import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,select:false},googleId:{type:String,unique:true,sparse:true},role:{type:String,enum:['user','subadmin','admin'],default:'user'},avatar:String,bookmarks:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],likedPosts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],resetPasswordToken:String,resetPasswordExpires:Date},{timestamps:true});
export default mongoose.model('User',schema);
