import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export function signToken(user){
    return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});}
export function auth(req,res,next){const h=req.headers.authorization||'';
    const token=h.startsWith('Bearer ')?h.slice(7):null;if(!token)
        return res.status(401).json({message:'Authentication required'});
    try{req.user=jwt.verify(token,process.env.JWT_SECRET);next()}
    catch{return res.status(401).json({message:'Invalid or expired token'})}}
export function optionalAuth(req,res,next){const h=req.headers.authorization||'';
    const token=h.startsWith('Bearer ')?h.slice(7):null;
    if(!token)return next();
    try{req.user=jwt.verify(token,process.env.JWT_SECRET);next()}
    catch{return next()}}
async function requireRole(roles,req,res,next){
    const user=await User.findById(req.user?.id).select('role');
    if(!user||!roles.includes(user.role))
        return res.status(403).json({message:'You do not have permission to perform this action'});
    req.user.role=user.role;
    next();
}
export function admin(req,res,next){return requireRole(['admin'],req,res,next)}
export function contentManager(req,res,next){return requireRole(['admin','subadmin'],req,res,next)}
