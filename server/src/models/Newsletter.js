import mongoose from 'mongoose';
import crypto from 'crypto';
const schema=new mongoose.Schema({
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  unsubscribeToken:{type:String,unique:true,sparse:true,default:()=>crypto.randomBytes(32).toString('hex')},
},{timestamps:true});
export default mongoose.model('Newsletter',schema);
