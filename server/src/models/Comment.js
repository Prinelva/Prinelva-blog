import mongoose from 'mongoose';
const schema=new mongoose.Schema({post:{type:mongoose.Schema.Types.ObjectId,ref:'Post',required:true},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},parent:{type:mongoose.Schema.Types.ObjectId,ref:'Comment',default:null},content:{type:String,required:true,trim:true}},{timestamps:true});
export default mongoose.model('Comment',schema);
