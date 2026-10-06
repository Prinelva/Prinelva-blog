import React from 'react';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {api} from '../lib/api';
import PostCard from '../components/PostCard';
export default function Search(){
const [params,setParams]=useSearchParams();
const [q,setQ]=useState(params.get('q')||'');
const [data,setData]=useState({posts:[],pages:1,page:1});
const [error,setError]=useState('');
useEffect(()=>{setError('');
    api.get('/posts',{params:{search:params.get('q')||undefined,
    page:params.get('page')||1}}).then(r=>setData(r.data))
        .catch(()=>setError('Search results could not be loaded. Check the API URL and try again.'))},[params]);
return <div className="container-page py-12">
    <h1 className="text-3xl font-black">Search posts</h1>
    <form className="mt-5 flex gap-2" onSubmit={e=>{e.preventDefault();
    setParams({q})}}>
    <input className="input" value={q} onChange={e=>setQ(e.target.value)

    } placeholder="Search JavaScript, CSS, React..."/>
    <button className="btn bg-indigo-600 text-white">Search</button>
    </form>{error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {data.posts.map(p=><PostCard key={p._id} post={p}/>)}</div>
    {data.pages>1&&<div className="mt-8 flex gap-2">{
    Array.from({length:data.pages},(_,i)=><button key={i} className={
    `btn ${Number(params.get('page')||1)===i+1?'bg-indigo-600 text-white':'bg-slate-200 dark:bg-slate-800'}`} 
    onClick={()=>setParams({q,page:i+1})}>{i+1}</button>)}</div>}</div>
    }
