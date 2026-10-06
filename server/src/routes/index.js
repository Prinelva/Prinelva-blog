import {Router} from 'express';
import {register,login,googleLogin,me,forgot,reset,changePassword} from '../controllers/auth.js';
import {list,trending,getBySlug,create,update,remove,
    adminList,categories,createCategory,comments,addComment,
    deleteComment,toggleLike,toggleBookmark} from '../controllers/posts.js';
import {stats,users,createSubadmin,updateUser,deleteUser} from '../controllers/admin.js';
import {subscribe,listSubscribers,sendNewsletter,sendLatestPost,
    confirmUnsubscribe,unsubscribe} from '../controllers/newsletter.js';
import {auth,admin,contentManager,optionalAuth} from '../utils/auth.js';
import {upload,uploadMedia,handleUploadError} from '../middleware/upload.js';
import {uploadMediaFile,uploadImage} from '../controllers/upload.js';
import {authLimiter,submissionLimiter} from '../middleware/rateLimit.js';
const r=Router();
r.post('/auth/register',authLimiter,register);
r.post('/auth/login',authLimiter,login);
r.post('/auth/google',authLimiter,googleLogin);
r.post('/auth/forgot-password',authLimiter,forgot);
r.post('/auth/reset-password/:token',authLimiter,reset);
r.put('/auth/password',auth,authLimiter,changePassword);
r.get('/auth/me',auth,me);
r.get('/posts',list);r.get('/posts/trending',trending);
r.get('/posts/slug/:slug',optionalAuth,getBySlug);
r.get('/categories',categories);
r.get('/comments/post/:id',async(req,res)=>res.json({comments:[]}));
r.post('/posts',auth,contentManager,create);
r.get('/admin/posts',auth,contentManager,adminList);
r.put('/posts/:id',auth,contentManager,update);
r.delete('/posts/:id',auth,contentManager,remove);
r.post('/categories',auth,contentManager,createCategory);
r.post('/upload',auth,contentManager,upload.single('image'),uploadImage);
r.post('/upload/media',auth,contentManager,uploadMedia.single('media'),handleUploadError,uploadMediaFile);
r.post('/comments',submissionLimiter,auth,addComment);
r.get('/admin/comments',auth,contentManager,comments);
r.delete('/comments/:id',auth,contentManager,deleteComment);
r.post('/posts/:id/like',auth,toggleLike);
r.post('/posts/:id/bookmark',auth,toggleBookmark);
r.get('/admin/stats',auth,admin,stats);
r.get('/admin/users',auth,admin,users);
r.post('/admin/subadmins',auth,admin,createSubadmin);
r.put('/admin/users/:id',auth,admin,updateUser);
r.delete('/admin/users/:id',auth,admin,deleteUser);
r.post('/newsletter',submissionLimiter,subscribe);
r.get('/newsletter/unsubscribe/:token',confirmUnsubscribe);
r.post('/newsletter/unsubscribe/:token',submissionLimiter,unsubscribe);
r.get('/admin/newsletter',auth,admin,listSubscribers);
r.post('/admin/newsletter/send',auth,admin,sendNewsletter);
r.post('/admin/newsletter/send-latest-post',auth,admin,sendLatestPost);
r.get('/sitemap.xml',async(req,res)=>{const posts=await (
await import('../models/Post.js')).default.find({status:'published'}).select('slug updatedAt');
const base=process.env.CLIENT_URL||'http://localhost:5173';
res.type('application/xml').send(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${posts.map(p=>`<url><loc>${base}/post/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`).join('')}</urlset>`)});
r.get('/robots.txt',(req,res)=>res.type('text').send(`User-agent: *\nAllow: /\nSitemap: 
    ${(process.env.API_PUBLIC_URL||'http://localhost:5000')}/api/sitemap.xml`));
export default r;
