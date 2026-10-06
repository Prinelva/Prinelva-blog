import {v2 as cloudinary} from 'cloudinary';
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
import {mediaTypeFor} from '../middleware/upload.js';
export async function uploadImage(req,res){if(!req.file)return res.status(400).json({message:'Image required'});if(!process.env.CLOUDINARY_CLOUD_NAME)return res.status(503).json({message:'Cloudinary is not configured'});const data=req.file.buffer.toString('base64');const result=await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${data}`,{folder:'prinelva-blog'});res.json({url:result.secure_url})}
export async function uploadMediaFile(req,res){
    if(!req.file)return res.status(400).json({message:'Choose an audio or video file to upload'});
    if(!process.env.CLOUDINARY_CLOUD_NAME||!process.env.CLOUDINARY_API_KEY||!process.env.CLOUDINARY_API_SECRET)
        return res.status(503).json({message:'Cloudinary storage is not configured. Please contact the site administrator.'});
    const type=mediaTypeFor(req.file.mimetype);
    const result=await new Promise((resolve,reject)=>{
        const stream=cloudinary.uploader.upload_stream({
            folder:'prinelva-blog/media',
            resource_type:'video',
            use_filename:true,
            unique_filename:true,
            timeout:120000,
        },(error,uploaded)=>error?reject(error):resolve(uploaded));
        stream.end(req.file.buffer);
    });
    const safeName=req.file.originalname.replace(/[\\/]/g,'_').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,200)||'media';
    const downloadUrl=cloudinary.url(result.public_id,{
        resource_type:'video',
        type:'upload',
        secure:true,
        version:result.version,
        format:result.format,
        flags:'attachment',
    });
    res.status(201).json({media:{
        type,
        url:result.secure_url,
        downloadUrl,
        name:safeName,
        mimeType:req.file.mimetype,
        size:req.file.size,
    }});
}
