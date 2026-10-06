import bcrypt from 'bcryptjs';
import Post from '../models/Post.js';import User from '../models/User.js';import Comment from '../models/Comment.js';
export async function stats(req,res){const [posts,users,comments,views]=await Promise.all([Post.countDocuments(),User.countDocuments(),Comment.countDocuments(),Post.aggregate([{$group:{_id:null,total:{$sum:'$views'}}}])]);res.json({posts,users,comments,views:views[0]?.total||0})}
export async function users(req,res){res.json({users:await User.find().select('-password -resetPasswordToken -resetPasswordExpires').sort({createdAt:-1})})}
export async function createSubadmin(req,res){
    const name=typeof req.body.name==='string'?req.body.name.trim():'';
    const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
    const password=req.body.password;
    if(!name||!email||typeof password!=='string')
        return res.status(400).json({message:'Name, email and temporary password are required'});
    if(name.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({message:'Enter a valid name and email address'});
    if(password.length<8||password.length>128)
        return res.status(400).json({message:'Temporary password must be between 8 and 128 characters'});
    if(await User.exists({email}))
        return res.status(409).json({message:'An account already uses this email'});
    try{
        const user=await User.create({name,email,password:await bcrypt.hash(password,12),role:'subadmin'});
        return res.status(201).json({user:{_id:user._id,name:user.name,email:user.email,role:user.role}});
    }catch(error){
        if(error.code===11000)return res.status(409).json({message:'An account already uses this email'});
        throw error;
    }
}
export async function updateUser(req,res){
    if(!['user','subadmin'].includes(req.body.role))
        return res.status(400).json({message:'Role must be user or subadmin'});
    const u=await User.findById(req.params.id);
    if(!u)return res.status(404).json({message:'User not found'});
    if(u.role==='admin')return res.status(403).json({message:'Administrator roles cannot be changed here'});
    u.role=req.body.role;
    await u.save();
    res.json({user:{id:u._id,name:u.name,email:u.email,role:u.role}});
}
export async function deleteUser(req,res){
    const user=await User.findById(req.params.id).select('role');
    if(!user)return res.status(404).json({message:'User not found'});
    if(user.role==='admin')return res.status(403).json({message:'Administrator accounts cannot be deleted here'});
    await user.deleteOne();
    res.json({message:'Deleted'});
}
