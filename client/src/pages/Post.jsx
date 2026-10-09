import React from 'react';
import {useEffect,useMemo,useState} from 'react';
import {Link,useLocation,useParams} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import DOMPurify from 'dompurify';
import {api} from '../lib/api';
import PostCard from '../components/PostCard';
import PostTimestamp from '../components/PostTimestamp';
import SaveImageButton from '../components/SaveImageButton';
import GoogleSignIn from '../components/GoogleSignIn';
import {Share2,Bookmark,Heart,Copy,MessageCircle} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
export default function Post(){
    const {slug}=useParams();
    const location=useLocation();
    const {user}=useAuth();
    const [data,setData]=useState(null);
    const [progress,setProgress]=useState(0);
    const [comment,setComment]=useState('');
    const [actionNotice,setActionNotice]=useState('');
    const [commentNotice,setCommentNotice]=useState('');
    const [replyTo,setReplyTo]=useState(null);
    const [replyContent,setReplyContent]=useState('');
    const [replyNotice,setReplyNotice]=useState('');
    const [liking,setLiking]=useState(false);
    const [guestLiked,setGuestLiked]=useState(false);
    const [guestBookmarked,setGuestBookmarked]=useState(false);
    const [posting,setPosting]=useState(false);
    const [postingReply,setPostingReply]=useState(false);
    const [loadError,setLoadError]=useState('');
    useEffect(()=>{setData(null);setLoadError('');api.get(`/posts/slug/${slug}`)
        .then(r=>setData(r.data))
        .catch(err=>setLoadError(err.response?.status===404?'This post could not be found.':'The post could not be loaded. Please try again.'))},[slug]);
    useEffect(()=>{
        if(data?.post?.title)document.title=`${data.post.title} | PrinelvaBlog`;
    },[data?.post?.title]);
    useEffect(()=>{
        if(!data?.post?._id)return;
        if(user){
            setGuestLiked(false);
            setGuestBookmarked(false);
            return;
        }
        try{
            setGuestLiked(localStorage.getItem(`prinelva-blog:like:${data.post._id}`)==='true');
            setGuestBookmarked(localStorage.getItem(`prinelva-blog:bookmark:${data.post._id}`)==='true');
        }catch{
            setActionNotice('Your browser could not load saved likes or bookmarks.');
        }
    },[data?.post?._id,user]);
    useEffect(()=>{const f=()=>{const h=document.documentElement.scrollHeight-innerHeight;
        setProgress(h?scrollY/h*100:0)};addEventListener('scroll',f);
        return()=>removeEventListener('scroll',f)},[]);
        const toc=useMemo(()=>{if(!data)return[];
        return [...data.post.content.matchAll(/<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi)].map((m,i)=>({
        id:`h-${i}`,text:m[2].replace(/<[^>]+>/g,''),level:m[1]}))},[data]);
        if(!data)return <div className="container-page py-16" role={loadError?'alert':'status'}>
            {loadError||'Loading post...'}
            {loadError&&<Link className="ml-2 text-indigo-600 underline" to="/">Return home</Link>}
        </div>;
        const p=data.post;
        const comments=Array.isArray(data.comments)?data.comments:[];
        const related=Array.isArray(data.related)?data.related:[];
        const words=p.content.replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;
        const read=Math.max(1,Math.ceil(words/200));
        async function act(path){if(!user){
            const key=`prinelva-blog:${path==='like'?'like':'bookmark'}:${p._id}`;
            const isActive=path==='like'?guestLiked:guestBookmarked;
            try{
                if(isActive)localStorage.removeItem(key);
                else localStorage.setItem(key,'true');
                if(path==='like')setGuestLiked(!isActive);
                else setGuestBookmarked(!isActive);
                setActionNotice(isActive
                    ?`${path==='like'?'Like':'Bookmark'} removed from this browser.`
                    :`${path==='like'?'Like':'Bookmark'} saved on this browser.`);
            }catch{
                setActionNotice('Your browser could not save this action. Check its storage settings and try again.');
            }
            return;
        }
        try{
            if(path==='like'){
                if(liking)return;
                setLiking(true);
                const r=await api.post(`/posts/${p._id}/like`);
                setData(current=>({...current,liked:r.data.liked,
                    likes:Math.max(0,(current.likes??0)+(r.data.liked?1:-1))}));
                setActionNotice(r.data.liked?'You liked this post.':'Like removed.');
            }else{
                const r=await api.post(`/posts/${p._id}/bookmark`);
                setData(current=>({...current,bookmarked:r.data.bookmarked}));
                setActionNotice(r.data.bookmarked?'Post bookmarked.':'Bookmark removed.');
            }
        }catch(err){
            setActionNotice(err.response?.data?.message||'Could not update this post. Please try again.');
        }finally{
            if(path==='like')setLiking(false);
        }}
        async function sharePost(){
            const url=window.location.href;
            try{
                if(navigator.share){
                    await navigator.share({title:p.title,url});
                    setActionNotice('Post shared.');
                }else if(navigator.clipboard?.writeText){
                    await navigator.clipboard.writeText(url);
                    setActionNotice('Link copied. Share it with your friends.');
                }else{
                    window.prompt('Copy this link to share the post:',url);
                    setActionNotice('Use the link above to share this post.');
                }
            }catch(err){
                if(err.name!=='AbortError')setActionNotice('Could not share this post. Please try again.');
            }
        }
        async function submit(e){e.preventDefault();
            if(!user){
                setCommentNotice('Please log in to comment on this post.');
                return;
            }
            if(!comment.trim()||posting)return;
            try{
                setPosting(true);
                const r=await api.post('/comments',{post:p._id,content:comment.trim()});
                setData(current=>({...current,comments:[...(current.comments??[]),r.data.comment]}));
                setComment('');
                setCommentNotice('Your comment was posted.');
            }catch(err){
                setCommentNotice(err.response?.data?.message||'Could not post your comment. Please try again.');
            }finally{
                setPosting(false);
            }}
        async function submitReply(parent,e){
            e.preventDefault();
            const content=replyContent.trim();
            if(!user||!content||postingReply)return;
            try{
                setPostingReply(true);
                setReplyNotice('');
                const response=await api.post('/comments',{
                    post:p._id,
                    parent,
                    content,
                });
                setData(current=>({...current,comments:[...(current.comments??[]),response.data.comment]}));
                setReplyContent('');
                setReplyTo(null);
            }catch(err){
                setReplyNotice(err.response?.data?.message||'Could not post your reply. Please try again.');
            }finally{
                setPostingReply(false);
            }
        }
        const isLiked=user?Boolean(data.liked):guestLiked;
        const isBookmarked=user?Boolean(data.bookmarked):guestBookmarked;
        const displayedLikes=(data.likes||0)+(!user&&guestLiked?1:0);
            return <>
            <Helmet>
                <title>{p.title} | PrinelvaBlog</title>
                <meta name="description" content={p.excerpt||p.content.replace(/<[^>]+>/g,' ').slice(0,160)}/>
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={p.title}/>
                <meta property="og:description" content={p.excerpt||p.content.replace(/<[^>]+>/g,' ').slice(0,160)}/>
                {p.coverImage&&<meta property="og:image" content={p.coverImage}/>}
                <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`}/>
                <meta name="twitter:card" content={p.coverImage?'summary_large_image':'summary'}/>
            </Helmet>
            <div className="fixed left-0 top-0 z-[60] h-1 bg-indigo-600"
             style={{width:`${progress}%`}}/><article className="container-page max-w-4xl py-10">
            <div className="mb-6 text-sm text-slate-500">
            {p.category?.name||'Technology'} · {read} min read · {p.views} views</div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">{p.title}</h1>
            <p className="mt-4 text-slate-500">By {p.author?.name}</p>
            <p className="mt-1 text-sm text-slate-500">
                Published <PostTimestamp post={p}/>
            </p>
            <div className="my-5 flex flex-wrap gap-2">
                <button aria-pressed={isLiked} disabled={liking}
                 className={`btn flex items-center gap-2 ${isLiked?'bg-rose-600 text-white':'bg-slate-200 dark:bg-slate-800'}`}
                 onClick={()=>act('like')}>
        <Heart size={17} fill={isLiked?'currentColor':'none'}/>{isLiked?'Liked':'Like'} · {displayedLikes}</button>
        <button aria-pressed={isBookmarked}
        className={`btn flex items-center gap-2 ${isBookmarked?'bg-indigo-600 text-white':'bg-slate-200 dark:bg-slate-800'}`}
    onClick={()=>act('bookmark')}><Bookmark size={17} fill={isBookmarked?'currentColor':'none'}/>{isBookmarked?'Bookmarked':'Bookmark'}</button>
    <button className="btn flex items-center gap-2 bg-slate-200 dark:bg-slate-800" 
    onClick={sharePost}>
    <Share2 size={17}/>Share</button>
    <button className="btn flex items-center gap-2 bg-slate-200 dark:bg-slate-800"
    onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setActionNotice('Post link copied.')}catch{setActionNotice('Could not copy the link. Use the Share or social buttons instead.')}}}>
    <Copy size={17}/>Copy link</button>
    <a className="btn bg-green-600 text-white" 
    href={`https://wa.me/?text=${encodeURIComponent(p.title+' '+window.location.href)}`}>WhatsApp</a>
    <a className="btn bg-sky-500 text-white" 
    href={
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${
        encodeURIComponent(window.location.href)}`}>Twitter/X</a></div>
        <a href="#comments" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline">
            <MessageCircle size={17}/>Comments ({comments.length})
        </a>
        {actionNotice&&<p role="status" className="mb-5 text-sm text-slate-600 dark:text-slate-300">{actionNotice}{!user&&actionNotice.includes('log in')&&<> <Link className="text-indigo-600 underline" to="/login">Log in</Link></>}</p>}
            {p.coverImage&&
            <div className="mb-8">
                <img src={p.coverImage} alt={p.title} className="mt-2 max-h-[520px] w-full rounded-2xl object-cover"/>
                <SaveImageButton src={p.coverImage} title={p.title}/>
            </div>
            }
        {toc.length>0&&
        <aside className="card mb-8 p-5"><b>Table of contents</b>
        <ul className="mt-3 space-y-2 text-sm">{
        toc.map(x=><li className={x.level==='3'?'ml-4':''} key={x.id}>{x.text}</li>)}</ul>
        </aside>}<div className="prose-blog" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(p.content)}}/>
        {p.media?.length>0&&<section className="mt-10 space-y-6" aria-label="Post audio and video">
            {p.media.map((item,index)=><article className="card space-y-3 p-4" key={`${item.url}-${index}`}>
                <h2 className="font-semibold">{item.name}</h2>
                {item.type==='video'
                    ?<video className="w-full rounded-xl" controls preload="metadata">
                        <source src={item.url} type={item.mimeType}/>
                        Your browser does not support video playback.
                    </video>
                    :<audio className="w-full" controls preload="metadata">
                        <source src={item.url} type={item.mimeType}/>
                        Your browser does not support audio playback.
                    </audio>}
                <a className="btn inline-flex bg-indigo-600 text-white" href={item.downloadUrl}>
                    Download {item.type==='audio'?'audio':'video'}
                </a>
                {(item.sourceUrl||item.license)&&<p className="text-xs text-slate-500">
                    {item.license&&<>License: {item.license}</>}
                    {item.sourceUrl&&<> · <a className="text-indigo-600 underline"
                        href={item.sourceUrl} target="_blank" rel="noreferrer">Media source</a></>}
                </p>}
            </article>)}
        </section>}
        <section id="comments" className="mt-12 border-t pt-8 dark:border-slate-800">
        <h2 className="text-2xl font-black">Comments</h2>
        {user?<form className="mt-4" onSubmit={submit}>
        <textarea className="input min-h-28" placeholder={
        'Write a comment...'} maxLength={2000} value={comment}
        disabled={posting}
      onChange={e=>setComment(e.target.value)}/>
      <button disabled={posting||!comment.trim()} className="btn mt-2 bg-indigo-600 text-white disabled:opacity-50">{posting?'Posting...':'Comment'}</button>
      </form>:<div className="card mt-4 space-y-3 p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
            Continue with Google to comment. We use your verified name and email to identify your comments; no separate blog password is needed.
        </p>
        <GoogleSignIn/>
        <Link className="inline-block text-sm text-indigo-600 hover:underline" to="/login"
            state={{from:`${location.pathname}#comments`}}>Or log in with email</Link>
      </div>}
    {commentNotice&&<p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{commentNotice}</p>}
    {replyNotice&&<p role="alert" className="mt-3 text-sm text-red-600">{replyNotice}</p>}
    <div className="mt-6 space-y-4">{comments.filter(c=>!c.parent).map(c=>
        <CommentThread key={c._id} comment={c} comments={comments} depth={0}
            user={user} replyTo={replyTo} setReplyTo={setReplyTo}
            replyContent={replyContent} setReplyContent={setReplyContent}
            postingReply={postingReply} onReply={submitReply}
            returnTo={`${location.pathname}#comments`}/>
    )}</div></section>
    </article>
    <section className="container-page pb-12">
        <h2 className="mb-5 text-2xl font-black">Related posts</h2>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {related.map(x=><PostCard key={x._id} post={x}/>)}
        </div>
        </section></>
        }

function CommentThread({comment,comments,depth,user,replyTo,setReplyTo,replyContent,
    setReplyContent,postingReply,onReply,returnTo}){
    const children=comments.filter(child=>child.parent===comment._id);
    const isReplying=replyTo===comment._id;
    const createdAt=new Date(comment.createdAt);
    const dateLabel=Number.isNaN(createdAt.getTime())?'':createdAt.toLocaleDateString();
    return <div className={depth?'ml-4 border-l-2 border-slate-200 pl-4 dark:border-slate-700 sm:ml-8':'card p-4'}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <b>{comment.user?.name||'Reader'}</b>
            {dateLabel&&<time className="text-xs text-slate-500" dateTime={createdAt.toISOString()}>{dateLabel}</time>}
        </div>
        <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{comment.content}</p>
        {user?<button type="button" className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
            onClick={()=>{setReplyTo(isReplying?null:comment._id);setReplyContent('');}}>
            {isReplying?'Cancel reply':'Reply'}
        </button>:<div className="mt-2 space-y-2">
            <GoogleSignIn/>
            <Link className="block text-sm font-medium text-indigo-600 hover:underline"
                to="/login" state={{from:returnTo}}>Or log in with email</Link>
        </div>}
        {isReplying&&<form className="mt-3 space-y-2" onSubmit={event=>onReply(comment._id,event)}>
            <label className="sr-only" htmlFor={`reply-${comment._id}`}>Reply to {comment.user?.name||'comment'}</label>
            <textarea id={`reply-${comment._id}`} className="input min-h-20" required maxLength={2000}
                placeholder={`Reply to ${comment.user?.name||'this comment'}...`}
                value={replyContent} disabled={postingReply}
                onChange={event=>setReplyContent(event.target.value)}/>
            <button disabled={postingReply||!replyContent.trim()}
                className="btn bg-indigo-600 text-white disabled:opacity-50">
                {postingReply?'Posting...':'Post reply'}
            </button>
        </form>}
        {children.length>0&&<div className="mt-4 space-y-4">
            {children.map(child=><CommentThread key={child._id} comment={child} comments={comments}
                depth={depth+1} user={user} replyTo={replyTo} setReplyTo={setReplyTo}
                replyContent={replyContent} setReplyContent={setReplyContent}
                postingReply={postingReply} onReply={onReply} returnTo={returnTo}/>)}
        </div>}
    </div>;
}
