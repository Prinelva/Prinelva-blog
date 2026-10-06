import React from 'react';
import {useEffect,useRef,useState} from 'react';
import {useNavigate,useParams} from 'react-router-dom';
import DOMPurify from 'dompurify';
import Quill from 'quill';import 'quill/dist/quill.snow.css';
import {api} from '../lib/api';
export default function Editor(){const {id}=useParams();
const nav=useNavigate();
const ref=useRef(null);
const q=useRef(null);
const [d,setD]=useState({title:'',slug:'',excerpt:'',coverImage:'',
    tags:'',category:'',status:'draft',featured:false,content:'',media:[]});
const [cats,setCats]=useState([]);
const [error,setError]=useState('');
const [uploading,setUploading]=useState(false);
const [mediaUploading,setMediaUploading]=useState(false);
const [saving,setSaving]=useState(false);
    const [editorReady,setEditorReady]=useState(false);
    useEffect(()=>{Promise.all([api.get('/categories'),id?api.get('/admin/posts'):Promise.resolve(null)])
        .then(([categories,posts])=>{setCats(categories.data.categories);
            if(id){const p=posts.data.posts.find(x=>x._id===id);
                if(!p){setError('This post could not be found.');return}
                setD({...p,tags:p.tags?.join(',')||'',category:p.category?._id||'',media:p.media||[]})}
            setEditorReady(true)})
        .catch(()=>setError('The editor data could not be loaded. Refresh the page or sign in again.'))},[id]);
    useEffect(()=>{
        if(editorReady&&ref.current&&!q.current){q.current=new Quill(ref.current,{theme:'snow',modules:{toolbar:[[
            {header:[1,2,3,false]}],['bold','italic','underline','code-block'],[{list:'ordered'},
                {list:'bullet'}],['link','image'],['clean']]}});
                q.current.root.innerHTML=DOMPurify.sanitize(d.content||'');
                q.current.on('text-change',()=>setD(x=>({...x,content:q.current.root.innerHTML})))
            }},[editorReady]);
async function uploadCover(event){
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    if(!file.type.startsWith('image/')){setError('Choose an image file.');return}
    if(file.size>5*1024*1024){setError('Images must be 5 MB or smaller.');return}
    setError('');
    setUploading(true);
    const formData=new FormData();
    formData.append('image',file);
    try{
        const response=await api.post('/upload',formData);
        setD(current=>({...current,coverImage:response.data.url}));
    }catch(err){
        setError(err.response?.data?.message||'The image could not be uploaded. Check Cloudinary configuration and try again.');
    }finally{
        setUploading(false);
    }
}
async function uploadMedia(event){
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    if(file.size>100*1024*1024){setError('Audio and video files must be 100 MB or smaller.');return}
    setError('');
    setMediaUploading(true);
    const formData=new FormData();
    formData.append('media',file);
    try{
        const response=await api.post('/upload/media',formData);
        setD(current=>({...current,media:[...current.media,response.data.media]}));
    }catch(err){
        setError(err.response?.data?.message||'The media could not be uploaded. Check Cloudinary configuration and try again.');
    }finally{
        setMediaUploading(false);
    }
}
async function save(e){
    e.preventDefault();
    if(saving)return;
    const content=DOMPurify.sanitize(d.content);
    if(!d.title.trim()||!content.replace(/<[^>]*>/g,'').trim()){
        setError('Add a title and post content before saving.');
        return;
    }
    setError('');
    setSaving(true);
    const body={...d,content,tags:d.tags.split(',').map(x=>x.trim()).filter(Boolean)};
    try{
        if(id)await api.put(`/posts/${id}`,body);
        else await api.post('/posts',body);
        nav('/admin');
    }catch(err){
        setError(err.response?.data?.message||'The post could not be saved. Please try again.');
    }finally{
        setSaving(false);
    }
}
return <div className="container-page max-w-5xl py-10">
    <h1 className="text-3xl font-black">{id?'Edit post':'Create post'}</h1>
    {error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    <form className="mt-6 space-y-4" onSubmit={save}>
    <input className="input" placeholder="Title" required value={d.title} 
    onChange={e=>setD({...d,title:e.target.value})}/>
    <input className="input" placeholder="Slug (optional)" value={d.slug} 
    onChange={e=>setD({...d,slug:e.target.value})}/>
    <textarea className="input" placeholder="Excerpt" value={d.excerpt} 
    onChange={e=>setD({...d,excerpt:e.target.value})}/>
    <input className="input" placeholder="Cover image URL" 
    value={d.coverImage} onChange={e=>setD({...d,coverImage:e.target.value})}/>
    <label className="block text-sm font-medium">Or upload a cover image (max 5 MB)
        <input className="input mt-2" type="file" accept="image/*" disabled={uploading}
            onChange={uploadCover}/>
    </label>
    {uploading&&<p role="status" className="text-sm text-slate-500">Uploading image...</p>}
    <section className="card space-y-3 p-4">
        <div>
            <h2 className="font-semibold">Audio and video</h2>
            <p className="text-sm text-slate-500">Upload MP4, WebM, MOV, MP3, M4A, AAC, WAV or OGG files. Maximum 100 MB each.</p>
        </div>
        <label className="block text-sm font-medium">Upload media
            <input className="input mt-2" type="file"
                accept="video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/x-wav,audio/ogg,audio/webm"
                disabled={mediaUploading} onChange={uploadMedia}/>
        </label>
        {mediaUploading&&<p role="status" className="text-sm text-slate-500">Uploading media... Large files may take a few minutes.</p>}
        {d.media.length>0&&<ul className="space-y-2">{d.media.map((item,index)=><li key={`${item.url}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
            <span className="min-w-0 truncate">{item.name} · {item.type}</span>
            <button type="button" className="text-red-600 hover:underline"
                onClick={()=>setD(current=>({...current,media:current.media.filter((_,i)=>i!==index)}))}>
                Remove
            </button>
        </li>)}</ul>}
    </section>
    <input className="input" placeholder="Tags: react,node,css" value={d.tags} 
    onChange={e=>setD({...d,tags:e.target.value})}/><select className="input" value={d.category} 
    
    onChange={e=>setD({...d,category:e.target.value})}>
        
    <option value="">No category</option>
    {cats.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
    <select className="input" value={d.status}
     onChange={e=>setD({...d,status:e.target.value})}>
        <option value="draft">Draft</option><option value="published">Published</option>
        </select><label className="flex gap-2">
        <input type="checkbox" checked={d.featured}
        onChange={e=>setD({...d,featured:e.target.checked})}/> Featured</label>
        <div ref={ref} className="min-h-96 bg-white text-black"/>
        <div className="flex gap-2">
        <button disabled={saving||uploading||mediaUploading} className="btn bg-indigo-600 text-white disabled:opacity-50">
            {saving?'Saving...':'Save post'}
        </button>
        <button type="button" className="btn bg-slate-200 dark:bg-slate-800" 
        onClick={()=>nav('/admin')}>Cancel</button></div></form></div>
    }
