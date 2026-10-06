import crypto from 'crypto';
import Post from '../models/Post.js';
import Newsletter from '../models/Newsletter.js';
import {sendMail} from './mailer.js';

export async function ensureUnsubscribeToken(subscriber){
    if(!subscriber.unsubscribeToken){
        subscriber.unsubscribeToken=crypto.randomBytes(32).toString('hex');
        await subscriber.save();
    }
    return subscriber.unsubscribeToken;
}

function escapeHtml(value){
    return String(value||'').replace(/[&<>"']/g,character=>({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;',
    })[character]);
}

export async function sendPostAnnouncement(postId){
    const claimedAt=new Date();
    const sendingCutoff=new Date(claimedAt.getTime()-10*60*1000);
    const post=await Post.findOneAndUpdate({
        _id:postId,
        status:'published',
        newsletterSentAt:{$exists:false},
        $or:[
            {newsletterSendingAt:{$exists:false}},
            {newsletterSendingAt:{$lt:sendingCutoff}},
        ],
    },{$set:{newsletterSendingAt:claimedAt}},{new:true}).select('title slug excerpt');

    if(!post){
        const current=await Post.findById(postId).select('status newsletterSentAt newsletterSendingAt');
        if(!current||current.status!=='published')return {sent:0,failed:0,status:'not-published'};
        if(current.newsletterSentAt)return {sent:0,failed:0,status:'already-sent'};
        return {sent:0,failed:0,status:'sending'};
    }

    try{
        const subscribers=await Newsletter.find().select('email unsubscribeToken');
        if(!subscribers.length){
            await Post.updateOne({_id:post._id,newsletterSendingAt:claimedAt},
                {$unset:{newsletterSendingAt:1}});
            return {sent:0,failed:0,status:'no-subscribers'};
        }
        const clientUrl=(process.env.CLIENT_URL||'http://localhost:5173').split(',')[0].trim().replace(/\/+$/,'');
        const apiUrl=(process.env.API_PUBLIC_URL||'http://localhost:5000').replace(/\/+$/,'');
        const title=escapeHtml(post.title);
        const excerpt=post.excerpt?`<p>${escapeHtml(post.excerpt)}</p>`:'';
        const results=await Promise.allSettled(subscribers.map(async subscriber=>{
            const token=await ensureUnsubscribeToken(subscriber);
            const postUrl=`${clientUrl}/post/${encodeURIComponent(post.slug)}`;
            const html=`<h1>${title}</h1>${excerpt}<p><a href="${postUrl}">Read the latest post</a></p><hr><p><small><a href="${apiUrl}/api/newsletter/unsubscribe/${token}">Unsubscribe from these emails</a></small></p>`;
            return sendMail(subscriber.email,`New post: ${post.title}`,html);
        }));
        const sent=results.filter(result=>result.status==='fulfilled'&&result.value).length;
        const failed=results.length-sent;
        for(const result of results){
            if(result.status==='rejected')console.error('New post email delivery failed:',result.reason);
            else if(!result.value)console.error('New post email delivery failed: SMTP is not configured');
        }
        if(failed){
            await Post.updateOne({_id:post._id,newsletterSendingAt:claimedAt},
                {$unset:{newsletterSendingAt:1}});
            return {sent,failed,status:'failed'};
        }
        await Post.updateOne({_id:post._id,newsletterSendingAt:claimedAt},
            {$set:{newsletterSentAt:new Date()},$unset:{newsletterSendingAt:1}});
        return {sent,failed:0,status:'sent'};
    }catch(error){
        await Post.updateOne({_id:post._id,newsletterSendingAt:claimedAt},
            {$unset:{newsletterSendingAt:1}});
        throw error;
    }
}
