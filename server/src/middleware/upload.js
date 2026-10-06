import multer from 'multer';
const storage=multer.memoryStorage();
export const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,file.mimetype.startsWith('image/'))});
const mediaTypes=new Map([
    ['video/mp4','video'],['video/webm','video'],['video/quicktime','video'],
    ['audio/mpeg','audio'],['audio/mp4','audio'],['audio/aac','audio'],
    ['audio/wav','audio'],['audio/x-wav','audio'],['audio/ogg','audio'],
    ['audio/webm','audio'],
]);
export const uploadMedia=multer({
    storage,
    limits:{fileSize:100*1024*1024,files:1},
    fileFilter(req,file,cb){
        if(mediaTypes.has(file.mimetype))return cb(null,true);
        const error=new Error('Choose an MP4, WebM, MOV, MP3, M4A, AAC, WAV or OGG audio/video file');
        error.status=400;
        cb(error);
    },
});
export function handleUploadError(error,req,res,next){
    if(!error)return next();
    if(error instanceof multer.MulterError){
        const status=error.code==='LIMIT_FILE_SIZE'?413:400;
        return res.status(status).json({message:status===413
            ?'Media files must be 100 MB or smaller'
            :'The media upload could not be processed'});
    }
    if(error.status===400)return res.status(400).json({message:error.message});
    return next(error);
}
export function mediaTypeFor(mimetype){return mediaTypes.get(mimetype)}
