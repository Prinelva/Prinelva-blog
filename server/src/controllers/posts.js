import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import slugify from 'slugify';
import {sendPostAnnouncement} from '../utils/newsletter.js';

const populate=['author','category'];

export async function list(req,res){
    const {category,search,tag,featured}=req.query;
    const pageValue=Number.parseInt(req.query.page,10);
    const limitValue=Number.parseInt(req.query.limit,10);
    const page=Number.isInteger(pageValue)&&pageValue>=1?pageValue:1;
    const limit=Number.isInteger(limitValue)&&limitValue>=1&&limitValue<=100?limitValue:10;
    const skip=(page-1)*limit;
    const query={status:'published'};
    if(typeof category==='string'&&category){
        const selectedCategory=await Category.findOne({slug:category}).select('_id');
        if(!selectedCategory){
            return res.json({posts:[],pagination:{page,limit,total:0,pages:0}});
        }
        query.category=selectedCategory._id;
    }
    if(search)query.$text={$search:search};
    if(tag)query.tags=tag;
    if(featured)query.featured=true;
    const [posts,total]=await Promise.all([
        Post.find(query).populate(populate).sort({publishedAt:-1}).skip(skip).limit(limit),
        Post.countDocuments(query)
    ]);
    res.json({posts,pagination:{page,limit,total,pages:Math.ceil(total/limit)}})
}

export async function trending(req,res){
    const posts=await Post.find({status:'published'}).populate(populate).sort({views:-1,publishedAt:-1}).limit(6);
    res.json({posts})
}

export async function getBySlug(req,res){
    const p=await Post.findOne({slug:req.params.slug,status:'published'}).populate(populate);
    if(!p)return res.status(404).json({message:'Post not found'});
    p.views=(p.views||0)+1;
    await p.save();
    res.json({post:p})
}

function announcePostInBackground(post){
    sendPostAnnouncement(post._id).catch(error=>
        console.error('Could not send new post announcement:',error));
}

export async function create(req,res){
    const p=await Post.create({...req.body,slug:slugify(req.body.slug||req.body.title,{lower:true,strict:true}),author:req.user.id,publishedAt:req.body.status==='published'?new Date():undefined});
    await p.populate(populate);
    if(req.body.status==='published')announcePostInBackground(p);
    res.status(201).json({post:p})
}

export async function update(req,res){
    const existing=await Post.findById(req.params.id).select('status');
    if(!existing)return res.status(404).json({message:'Post not found'});
    const data={...req.body};
    if(data.title)data.slug=slugify(data.slug||data.title,{lower:true,strict:true});
    if(existing.status!=='published'&&data.status==='published')data.publishedAt=new Date();
    const p=await Post.findByIdAndUpdate(req.params.id,data,{new:true}).populate(populate);
    if(data.status==='published'&&existing.status!=='published')announcePostInBackground(p);
    res.json({post:p})
}

export async function remove(req,res){
    await Post.findByIdAndDelete(req.params.id);
    res.json({message:'Deleted'})
}

export async function adminList(req,res){
    const posts=await Post.find().populate(populate).sort({createdAt:-1});
    res.json({posts})
}

export async function categories(req,res){
    try{
        const cats=await Category.find().sort({name:1});
        res.json({categories:cats})
    }catch(error){
        console.error('Error fetching categories:',error);
        res.status(500).json({message:'Could not fetch categories'})
    }
}

export async function createCategory(req,res){
    try{
        const c=await Category.create({name:req.body.name,slug:slugify(req.body.name,{lower:true,strict:true}),description:req.body.description});
        res.status(201).json({category:c})
    }catch(error){
        console.error('Error creating category:',error);
        res.status(400).json({message:error.message})
    }
}

export async function comments(req,res){
    res.json({comments:await Comment.find().populate('user','name email').populate('post','title').sort({createdAt:-1})})
}

export async function addComment(req,res){
    const content=typeof req.body.content==='string'?req.body.content.trim():'';
    if(!mongoose.isValidObjectId(req.body.post))return res.status(400).json({message:'Invalid post ID'});
    if(!content)return res.status(400).json({message:'Comment cannot be empty'});
    if(content.length>1000)return res.status(400).json({message:'Comment is too long'});
    const post=await Post.findById(req.body.post);
    if(!post)return res.status(404).json({message:'Post not found'});
    const c=await Comment.create({content,post:req.body.post,user:req.user.id,parent:req.body.parent});
    await c.populate('user','name');
    res.status(201).json({comment:c})
}

export async function deleteComment(req,res){
    const ids=[req.params.id];
    for(let index=0;index<ids.length;index++){
        const children=await Comment.find({parent:ids[index]}).select('_id');
        ids.push(...children.map(comment=>comment._id));
    }
    await Comment.deleteMany({_id:{$in:ids}});
    res.json({message:'Deleted'});
}

export async function toggleLike(req,res){
    const u=await User.findById(req.user.id);
    const id=req.params.id;
    const has=u.likedPosts.some(x=>x.toString()===id);
    u.likedPosts=has?u.likedPosts.filter(x=>x.toString()!==id):[...u.likedPosts,id];
    await u.save();
    res.json({liked:!has})
}

export async function toggleBookmark(req,res){
    const u=await User.findById(req.user.id);
    const id=req.params.id;
    const has=u.bookmarks.some(x=>x.toString()===id);
    u.bookmarks=has?u.bookmarks.filter(x=>x.toString()!==id):[...u.bookmarks,id];
    await u.save();
    res.json({bookmarked:!has})
}
