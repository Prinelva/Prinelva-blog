import mongoose from 'mongoose';
import Post from '../models/Post.js'; import Category from '../models/Category.js'; import Comment from '../models/Comment.js'; import User from '../models/User.js'; import slugify from 'slugify';
import {sendPostAnnouncement} from '../utils/newsletter.js';
const populate=['author','category'];
export async function list(req,res){const {category,search,tag,featured}=req.query;const pageValue=Number.parseInt(req.query.page,10);const limitValue=Number.parseInt(req.query.limit,10);const page=Number.isSafeInteger(pageValue)&&pageValue>0?pageValue:1;const limit=Number.isSafeInteger(limitValue)&&limitValue>0?Math.min(limitValue,30):9;const q={status:'published'};if(typeof category==='string'&&category){const selectedCategory=await Category.findOne({slug:category}).select('_id');if(!selectedCategory)return res.json({posts:[],total:0,page,pages:0});q.category=selectedCategory._id;}if(typeof tag==='string'&&tag)q.tags=tag;if(featured==='true')q.featured=true;if(typeof search==='string'&&search.trim())q.$text={$search:search.trim().slice(0,120)};const skip=(page-1)*limit;const [posts,total]=await Promise.all([Post.find(q).populate(populate).sort({publishedAt:-1,createdAt:-1}).skip(skip).limit(limit),Post.countDocuments(q)]);res.json({posts,total,page,pages:Math.ceil(total/limit)})}
export async function trending(req,res){const posts=await Post.find({status:'published'}).populate(populate).sort({views:-1,publishedAt:-1}).limit(6);res.json({posts})}
export async function getBySlug(req,res){const p=await Post.findOne({slug:req.params.slug,status:'published'}).populate(populate);if(!p)return res.status(404).json({message:'Post not found'});p.views+=1;await p.save();const [related,comments,likes,liked,bookmarked]=await Promise.all([Post.find({_id:{$ne:p._id},status:'published',$or:[{category:p.category?._id},{tags:{$in:p.tags||[]}}]}).limit(4).sort({publishedAt:-1}),Comment.find({post:p._id}).populate('user','name avatar').sort({createdAt:1}),User.countDocuments({likedPosts:p._id}),req.user?User.exists({_id:req.user.id,likedPosts:p._id}):null,req.user?User.exists({_id:req.user.id,bookmarks:p._id}):null]);res.json({post:p,related,comments,likes,liked:Boolean(liked),bookmarked:Boolean(bookmarked)})}
function announcePostInBackground(post){
    sendPostAnnouncement(post._id).catch(error=>
        console.error('Could not send new post announcement:',error));
}
export async function create(req,res){const p=await Post.create({...req.body,slug:slugify(req.body.slug||req.body.title,{lower:true,strict:true}),author:req.user.id,publishedAt:req.body.status==='published'?new Date():null});res.status(201).json({post:await p.populate(populate)});if(p.status==='published')announcePostInBackground(p)}
export async function update(req,res){const existing=await Post.findById(req.params.id).select('status');if(!existing)return res.status(404).json({message:'Post not found'});const data={...req.body};if(data.title||data.slug)data.slug=slugify(data.slug||data.title,{lower:true,strict:true});if(data.status==='published')data.publishedAt=data.publishedAt||new Date();const p=await Post.findByIdAndUpdate(req.params.id,data,{new:true}).populate(populate);res.json({post:p});if(existing.status!=='published'&&p.status==='published')announcePostInBackground(p)}
export async function remove(req,res){await Post.findByIdAndDelete(req.params.id);res.json({message:'Deleted'})}
export async function adminList(req,res){const posts=await Post.find().populate(populate).sort({createdAt:-1});res.json({posts})}
export async function categories(req,res){res.json({categories:await Category.find().sort({name:1})})}
export async function createCategory(req,res){const c=await Category.create({name:req.body.name,slug:slugify(req.body.name,{lower:true,strict:true}),description:req.body.description});res.status(201).json({category:c})}
export async function comments(req,res){res.json({comments:await Comment.find().populate('user','name email').populate('post','title').sort({createdAt:-1})})}
export async function addComment(req,res){const content=typeof req.body.content==='string'?req.body.content.trim():'';if(!mongoose.isValidObjectId(req.body.post))return res.status(400).json({message:'A valid post is required'});if(!content||content.length>2000)return res.status(400).json({message:'Comment must be between 1 and 2000 characters'});const post=await Post.findOne({_id:req.body.post,status:'published'});if(!post)return res.status(404).json({message:'Post not found'});let parent=null;if(req.body.parent){if(!mongoose.isValidObjectId(req.body.parent))return res.status(400).json({message:'Invalid parent comment'});parent=await Comment.findOne({_id:req.body.parent,post:post._id});if(!parent)return res.status(400).json({message:'Parent comment does not belong to this post'})}const c=await Comment.create({post:post._id,user:req.user.id,parent:parent?._id||null,content});res.status(201).json({comment:await c.populate('user','name avatar')})}
export async function deleteComment(req,res){
    const ids=[req.params.id];
    for(let index=0;index<ids.length;index++){
        const children=await Comment.find({parent:ids[index]}).select('_id');
        ids.push(...children.map(comment=>comment._id));
    }
    await Comment.deleteMany({_id:{$in:ids}});
    res.json({message:'Deleted'});
}
export async function toggleLike(req,res){const u=await User.findById(req.user.id);const id=req.params.id;const has=u.likedPosts.some(x=>x.toString()===id);u.likedPosts=has?u.likedPosts.filter(x=>x.toString()!==id):[...u.likedPosts,id];await u.save();res.json({liked:!has})}
export async function toggleBookmark(req,res){const u=await User.findById(req.user.id);const id=req.params.id;const has=u.bookmarks.some(x=>x.toString()===id);u.bookmarks=has?u.bookmarks.filter(x=>x.toString()!==id):[...u.bookmarks,id];await u.save();res.json({bookmarked:!has})}
