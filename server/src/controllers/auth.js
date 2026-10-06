import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import {signToken} from '../utils/auth.js';
import {sendMail} from '../utils/mailer.js';
import {OAuth2Client} from 'google-auth-library';

const minimumPasswordLength = 8;
const googleClient = new OAuth2Client();

export async function register(req,res){
    const name=typeof req.body.name==='string'?req.body.name.trim():'';
    const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
    const password=req.body.password;
    if(!name||!email||typeof password!=='string')
        return res.status(400).json({message:'Name, email and password are required'});
    if(name.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({message:'Enter a valid name and email address'});
    if(password.length<minimumPasswordLength)
        return res.status(400).json({message:'Password must be at least 8 characters'});
    if(await User.findOne({email}))
        return res.status(409).json({message:'Email already registered'});
    const hash=await bcrypt.hash(password,12);
    const user=await User.create({name,email,password:hash});
    res.status(201).json({
        token:signToken(user),
        user:{id:user._id,name:user.name,email:user.email,role:user.role},
    });
}

export async function login(req,res){
    const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
    const password=req.body.password;
    if(!email||typeof password!=='string')
        return res.status(400).json({message:'Email and password are required'});
    const user=await User.findOne({email}).select('+password');
    if(!user?.password||!(await bcrypt.compare(password,user.password)))
        return res.status(401).json({message:'Invalid credentials'});
    res.json({
        token:signToken(user),
        user:{id:user._id,name:user.name,email:user.email,role:user.role},
    });
}

export async function googleLogin(req,res){
    if(!process.env.GOOGLE_CLIENT_ID)
        return res.status(503).json({message:'Google sign-in is not configured yet'});
    const credential=typeof req.body.credential==='string'?req.body.credential:'';
    if(!credential)
        return res.status(400).json({message:'A Google credential is required'});
    let payload;
    try{
        const ticket=await googleClient.verifyIdToken({
            idToken:credential,
            audience:process.env.GOOGLE_CLIENT_ID,
        });
        payload=ticket.getPayload();
    }catch{
        return res.status(401).json({message:'Google sign-in could not be verified. Please try again.'});
    }
    const googleId=payload?.sub;
    const email=payload?.email?.trim().toLowerCase();
    if(!googleId||!email||payload.email_verified!==true)
        return res.status(401).json({message:'Google must verify your email before you can comment'});
    let user=await User.findOne({googleId});
    if(!user){
        const existing=await User.findOne({email});
        if(existing)
            return res.status(409).json({message:'An account already uses this email. Sign in with that account first, then connect Google.'});
        try{
            user=await User.create({
                name:(payload.name||email.split('@')[0]).trim().slice(0,80),
                email,
                googleId,
                avatar:payload.picture,
            });
        }catch(error){
            if(error.code!==11000)throw error;
            user=await User.findOne({googleId});
            if(!user)return res.status(409).json({message:'This email is already registered. Sign in with that account first.'});
        }
    }
    res.json({
        token:signToken(user),
        user:{id:user._id,name:user.name,email:user.email,role:user.role,avatar:user.avatar},
    });
}

export async function changePassword(req,res){
    const currentPassword=req.body.currentPassword;
    const newPassword=req.body.newPassword;
    if(typeof currentPassword!=='string'||typeof newPassword!=='string')
        return res.status(400).json({message:'Current and new passwords are required'});
    if(newPassword.length<minimumPasswordLength)
        return res.status(400).json({message:'New password must be at least 8 characters'});
    const user=await User.findById(req.user.id).select('+password');
    if(!user)return res.status(404).json({message:'User not found'});
    if(!user.password)
        return res.status(400).json({message:'This account does not have a password. Continue signing in with Google.'});
    if(!(await bcrypt.compare(currentPassword,user.password)))
        return res.status(401).json({message:'Current password is incorrect'});
    user.password=await bcrypt.hash(newPassword,12);
    await user.save();
    res.json({message:'Password updated successfully'});
}

export async function me(req,res){
    const user=await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if(!user)return res.status(404).json({message:'User not found'});
    res.json({user});
}

export async function forgot(req,res){
    const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({message:'Enter a valid email address'});
    const genericMessage='If that email exists, a reset link has been prepared.';
    const user=await User.findOne({email});
    if(!user)return res.json({message:genericMessage});
    const raw=crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken=crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordExpires=Date.now()+3600000;
    await user.save();
    const baseUrl=(process.env.CLIENT_URL||'http://localhost:5173').split(',')[0].trim().replace(/\/+$/,'');
    const url=`${baseUrl}/reset-password/${raw}`;
    const sent=await sendMail(user.email,'Password reset',`<p>Reset your password: <a href="${url}">${url}</a></p>`);
    if(!sent&&process.env.NODE_ENV!=='development')
        return res.status(503).json({message:'Password reset email is temporarily unavailable. Please contact the site administrator.'});
    res.json({
        message:genericMessage,
        devResetUrl:process.env.NODE_ENV==='development'?url:undefined,
    });
}

export async function reset(req,res){
    const password=req.body.password;
    if(typeof password!=='string'||password.length<minimumPasswordLength)
        return res.status(400).json({message:'Password must be at least 8 characters'});
    const hash=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({
        resetPasswordToken:hash,
        resetPasswordExpires:{$gt:Date.now()},
    }).select('+password');
    if(!user)return res.status(400).json({message:'Reset link is invalid or expired'});
    user.password=await bcrypt.hash(password,12);
    user.resetPasswordToken=undefined;
    user.resetPasswordExpires=undefined;
    await user.save();
    res.json({message:'Password reset successful'});
}
