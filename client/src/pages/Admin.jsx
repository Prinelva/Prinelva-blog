import React from 'react';
import {useEffect,useState} from 'react';
import {api} from '../lib/api';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import PostTimestamp from '../components/PostTimestamp';
import {Trash2} from 'lucide-react';
export default function Admin(){const {user}=useAuth();const isAdmin=user?.role==='admin';const [s,setS]=useState({});
const [posts,setPosts]=useState([]);
const [users,setUsers]=useState([]);
const [comments,setComments]=useState([]);
const [subscribers,setSubscribers]=useState([]);
const [error,setError]=useState('');
const [postDeleteError,setPostDeleteError]=useState('');
const [deletingPost,setDeletingPost]=useState('');
const [postPendingDelete,setPostPendingDelete]=useState(null);
const [loading,setLoading]=useState(true);
const [staff,setStaff]=useState({name:'',email:'',password:''});
const [staffMessage,setStaffMessage]=useState('');
const [creatingStaff,setCreatingStaff]=useState(false);
const [roleDraft,setRoleDraft]=useState({});
const [newsletter,setNewsletter]=useState({subject:'',body:''});
const [newsletterMessage,setNewsletterMessage]=useState('');
const [sending,setSending]=useState(false);
const [sendingLatestPost,setSendingLatestPost]=useState(false);
useEffect(()=>{
   const requests=[api.get('/admin/posts'),api.get('/admin/comments')];
   if(isAdmin)requests.push(api.get('/admin/stats'),api.get('/admin/users'),api.get('/admin/newsletter'));
   Promise.all(requests)
       .then(([postResponse,commentResponse,statsResponse,userResponse,newsletterResponse])=>{
           setPosts(postResponse.data.posts);
           setComments(commentResponse.data.comments);
           if(isAdmin){
               setS(statsResponse.data);
               setUsers(userResponse.data.users);
               setSubscribers(newsletterResponse.data.subscribers);
           }
       })
       .catch(()=>setError('The dashboard could not be loaded. Refresh the page or sign in again.'))
       .finally(()=>setLoading(false));
},[isAdmin]);
async function createSubadmin(event){
   event.preventDefault();
   if(creatingStaff)return;
   setCreatingStaff(true);
   setStaffMessage('');
   try{
       const response=await api.post('/admin/subadmins',staff);
       setUsers(current=>[response.data.user,...current]);
       setRoleDraft(current=>({...current,[response.data.user._id]:'subadmin'}));
       setStaff({name:'',email:'',password:''});
       setStaffMessage('Sub-admin account created. Share the temporary password privately and ask them to change it after signing in.');
   }catch(err){
       setStaffMessage(err.response?.data?.message||'The sub-admin account could not be created.');
   }finally{
       setCreatingStaff(false);
   }
}
async function updateRole(account){
   const role=roleDraft[account._id]??account.role;
   try{
       const response=await api.put(`/admin/users/${account._id}`,{role});
       setUsers(current=>current.map(item=>item._id===account._id?{...item,...response.data.user}:item));
       setStaffMessage(`${account.name}'s role was updated.`);
   }catch(err){
       setStaffMessage(err.response?.data?.message||'The account role could not be updated.');
   }
}
async function removeComment(comment){
   try{
       await api.delete(`/comments/${comment._id}`);
       setComments(current=>current.filter(item=>item._id!==comment._id));
   }catch(err){
       setError(err.response?.data?.message||'The comment could not be deleted.');
   }
}
async function removePost(){
   if(!postPendingDelete||deletingPost)return;
   setPostDeleteError('');
   setDeletingPost(postPendingDelete._id);
   try{
       await api.delete(`/posts/${postPendingDelete._id}`);
       setPosts(current=>current.filter(item=>item._id!==postPendingDelete._id));
       if(isAdmin)setS(current=>({...current,posts:Math.max(0,(current.posts||0)-1)}));
       setPostPendingDelete(null);
   }catch(err){
       setPostDeleteError(err.response?.data?.message||'The post could not be deleted. Please try again.');
   }finally{
       setDeletingPost('');
   }
}
async function sendNewsletter(event){
    event.preventDefault();
    setSending(true);
    setNewsletterMessage('');
    const html=newsletter.body.split(/\r?\n/).map(line=>`<p>${escapeHtml(line)}</p>`).join('');
    try{
        const response=await api.post('/admin/newsletter/send',{subject:newsletter.subject,html});
        setNewsletterMessage(`Newsletter sent to ${response.data.sent} subscriber(s).`);
        setNewsletter({subject:'',body:''});
    }catch(err){
        const delivered=err.response?.data?.sent;
        setNewsletterMessage(delivered!==undefined
            ?`${err.response.data.message}. Sent: ${delivered}; failed: ${err.response.data.failed}.`
            :err.response?.data?.message||'Newsletter could not be sent. Check SMTP configuration and try again.');
    }finally{
        setSending(false);
    }
}
async function sendLatestPost(){
    if(sendingLatestPost)return;
    setSendingLatestPost(true);
    setNewsletterMessage('');
    try{
        const response=await api.post('/admin/newsletter/send-latest-post');
        setNewsletterMessage(`Latest post emailed to ${response.data.sent} subscriber(s).`);
    }catch(err){
        const delivered=err.response?.data?.sent;
        setNewsletterMessage(delivered!==undefined
            ?`${err.response.data.message}. Sent: ${delivered}; failed: ${err.response.data.failed}.`
            :err.response?.data?.message||'The latest post email could not be sent. Check SMTP configuration and try again.');
    }finally{
        setSendingLatestPost(false);
    }
}
    return <div className="container-page py-10">
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{isAdmin?'Admin dashboard':'Staff dashboard'}</h1>
        <Link className="btn bg-indigo-600 text-white" to="/admin/new">New post</Link></div>
        {error&&<p role="alert" className="mt-5 text-sm text-red-600">{error}</p>}
        {staffMessage&&<p role="status" className="mt-5 text-sm text-slate-600 dark:text-slate-300">{staffMessage}</p>}
        {loading&&<p role="status" className="mt-5 text-slate-500">Loading dashboard...</p>}
        {isAdmin&&<div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">{[['Posts',s.posts],
        ['Views',s.views],['Users',s.users],
        ['Comments',s.comments]].map(([a,b])=><div className="card p-5" key={a}>
        <p className="text-sm text-slate-500">{a}</p>
        <b className="text-3xl">{b??0}</b></div>)}</div>}
        <h2 className="mt-10 text-xl font-black">Posts</h2>
        {postDeleteError&&<p role="alert" className="mt-3 text-sm text-red-600">{postDeleteError}</p>}
        <div className="mt-3 overflow-x-auto card">
        <table className="w-full text-left text-sm">
        <thead><tr className="border-b dark:border-slate-800">
        <th className="p-3">Title</th><th>Status</th><th>Date &amp; time</th><th>Views</th>
        <th>Action</th></tr></thead>
        <tbody>{posts.map(p=><tr className="border-b dark:border-slate-800" key={p._id}>
        <td className="p-3">{p.title}</td><td>{p.status}</td>
        <td className="p-3"><div><PostTimestamp post={p}/></div>
            <span className="text-xs text-slate-500">{p.publishedAt?'Published':'Created'}</span></td>
        <td>{p.views}</td>
        <td className="p-3"><div className="flex items-center gap-3">
        <Link className="text-indigo-600" to={`/admin/edit/${p._id}`}>Edit</Link>
        <button type="button" onClick={()=>{setPostDeleteError('');setPostPendingDelete(p);}}
            disabled={Boolean(deletingPost)}
            aria-label={`Delete ${p.title}`} title="Delete post"
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950">
            <Trash2 size={18} aria-hidden="true"/>
        </button>
        </div>
        </td></tr>)}</tbody>
        </table>
        </div>
        <section className="mt-10">
            <h2 className="text-xl font-black">Comments</h2>
            <div className="mt-3 space-y-2">{comments.map(comment=><article className="card flex flex-wrap items-start justify-between gap-3 p-4" key={comment._id}>
                <div><p className="font-semibold">{comment.user?.name||'Reader'} · {comment.post?.title||'Post'}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                </div>
                <button className="text-sm text-red-600 hover:underline" onClick={()=>removeComment(comment)}>Delete comment</button>
            </article>)}
            {!comments.length&&<p className="text-sm text-slate-500">No comments to moderate.</p>}</div>
        </section>
        {isAdmin&&<>
        <section className="mt-10">
            <h2 className="text-xl font-black">Create a sub-admin account</h2>
            <p className="mt-1 text-sm text-slate-500">Sub-admins can manage posts and moderate comments. Only admins can manage staff accounts.</p>
            <form className="card mt-4 grid gap-3 p-5 md:grid-cols-2" onSubmit={createSubadmin}>
                <label className="text-sm">Name
                    <input className="input mt-1" required maxLength={80} value={staff.name}
                        onChange={event=>setStaff({...staff,name:event.target.value})}/>
                </label>
                <label className="text-sm">Email
                    <input className="input mt-1" required type="email" value={staff.email}
                        onChange={event=>setStaff({...staff,email:event.target.value})}/>
                </label>
                <label className="text-sm md:col-span-2">Temporary password (at least 8 characters)
                    <input className="input mt-1" required type="password" minLength={8} maxLength={128}
                        autoComplete="new-password" value={staff.password}
                        onChange={event=>setStaff({...staff,password:event.target.value})}/>
                </label>
                <button disabled={creatingStaff} className="btn w-fit bg-indigo-600 text-white disabled:opacity-50">
                    {creatingStaff?'Creating account...':'Create sub-admin'}
                </button>
            </form>
        </section>
        <section className="mt-10">
            <h2 className="text-xl font-black">Users and staff</h2>
            <div className="mt-3 space-y-2">{users.map(u=><div className="card flex flex-wrap items-center justify-between gap-3 p-4" key={u._id}>
                <span>{u.name} · {u.email}</span>
                {u.role==='admin'?<b>admin</b>:<div className="flex items-center gap-2">
                    <select aria-label={`Role for ${u.email}`} className="input" value={roleDraft[u._id]??u.role}
                        onChange={event=>setRoleDraft(current=>({...current,[u._id]:event.target.value}))}>
                        <option value="user">user</option><option value="subadmin">sub-admin</option>
                    </select>
                    <button className="btn bg-slate-200 dark:bg-slate-800" onClick={()=>updateRole(u)}>Save role</button>
                </div>}
            </div>)}</div>
        </section>
        <section className="mt-10">
            <h2 className="text-xl font-black">Newsletter</h2>
            <p className="mt-1 text-sm text-slate-500">{subscribers.length} opted-in subscriber(s). Each email includes an unsubscribe link.</p>
            <div className="card mt-4 space-y-3 p-5">
                <p className="text-sm text-slate-500">Send the latest published post to subscribers who signed up before it was published. This action is available only once per post. Future posts are announced automatically when published.</p>
                <button type="button" disabled={sendingLatestPost||!subscribers.length}
                    onClick={sendLatestPost}
                    className="btn bg-indigo-600 text-white disabled:opacity-50">
                    {sendingLatestPost?'Sending latest post...':'Email latest post to subscribers'}
                </button>
                {newsletterMessage&&<p role="status" className="text-sm text-slate-600 dark:text-slate-300">{newsletterMessage}</p>}
            </div>
            <form className="card mt-4 space-y-3 p-5" onSubmit={sendNewsletter}>
                <input className="input" required maxLength={200} placeholder="Email subject"
                    value={newsletter.subject} onChange={event=>setNewsletter({...newsletter,subject:event.target.value})}/>
                <textarea className="input min-h-36" required maxLength={20000}
                    placeholder="Write your newsletter message"
                    value={newsletter.body} onChange={event=>setNewsletter({...newsletter,body:event.target.value})}/>
                <button disabled={sending||!subscribers.length}
                    className="btn bg-indigo-600 text-white disabled:opacity-50">
                    {sending?'Sending...':'Send newsletter'}
                </button>
            </form>
        </section>
        </>}
        {postPendingDelete&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4"
            role="presentation">
            <section role="alertdialog" aria-modal="true" aria-labelledby="delete-post-title"
                aria-describedby="delete-post-warning"
                className="w-full max-w-lg rounded-2xl border border-red-300 bg-white p-6 shadow-2xl dark:border-red-900 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                    <span className="rounded-full bg-red-100 p-3 text-red-700 dark:bg-red-950 dark:text-red-300">
                        <Trash2 size={24} aria-hidden="true"/>
                    </span>
                    <div>
                        <h2 id="delete-post-title" className="text-xl font-black text-red-700 dark:text-red-300">
                            Permanently delete this post?
                        </h2>
                        <p id="delete-post-warning" className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                            You are about to delete <strong>{postPendingDelete.title}</strong>.
                            This action cannot be undone. The post will be removed from the site
                            and its content will not be recoverable.
                        </p>
                        {postDeleteError&&<p role="alert" className="mt-3 text-sm text-red-600">{postDeleteError}</p>}
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" className="btn bg-slate-200 dark:bg-slate-700"
                        disabled={Boolean(deletingPost)} onClick={()=>setPostPendingDelete(null)}>
                        Keep post
                    </button>
                    <button type="button" className="btn bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                        disabled={Boolean(deletingPost)} onClick={removePost}>
                        {deletingPost?'Deleting post...':'Yes, delete permanently'}
                    </button>
                </div>
            </section>
        </div>}
            </div>
            }

function escapeHtml(value){
    return value.replace(/[&<>"']/g,character=>({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
    })[character]);
}
