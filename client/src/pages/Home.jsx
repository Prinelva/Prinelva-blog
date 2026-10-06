import React from 'react';
import {useEffect,useState} from 'react';
import {Helmet} from 'react-helmet-async';
import {api} from '../lib/api';
import PostCard from '../components/PostCard';
import {Link} from 'react-router-dom';
import CultureGallery from '../components/CultureGallery';

export default function Home(){
const [data,setData]=useState({posts:[]});
const [trend,setTrend]=useState([]);
const [error,setError]=useState('');
const [loading,setLoading]=useState(true);
        useEffect(()=>{Promise.all([api.get('/posts?limit=9'),api.get('/posts/trending')])
        .then(([posts,trending])=>{setData(posts.data);setTrend(trending.data.posts)})
        .catch(()=>setError('Posts could not be loaded. Please refresh the page to try again.'))
        .finally(()=>setLoading(false))},[]);
        return <div>
        <Helmet>
            <title>PrinelvaBlog | Practical web development articles</title>
            <meta name="description" content="Practical web development, programming, CSS,
             JavaScript and technology articles."/>
        </Helmet>

        <section className="border-b bg-gradient-to-br 
        from-indigo-600 to-violet-700 py-20 text-white">
        <div className="container-page">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest 
        text-indigo-200">PrinelvaBlog</p>
        <h1 className="max-w-3xl text-4xl font-black sm:text-6xl">Build. Learn. 
        Share what you know.</h1>
        <p className="mt-5 max-w-2xl text-indigo-100">Practical web development, 
        programming, React, JavaScript and technology articles.</p>
        <Link className="btn mt-7 inline-block bg-white text-indigo-700"
        to="/search">Explore posts</Link></div></section>
        <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between">
        <div><h2 className="text-2xl font-black">Latest posts</h2>
        <p className="text-slate-500">Freshly published articles.</p>
        </div><Link className="text-sm font-semibold text-indigo-600" 
        to="/search">View all</Link></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
        {loading&&<p role="status" className="text-slate-500">Loading posts...</p>}
        {!loading&&!error&&!data.posts.length&&<p className="text-slate-500">No posts published yet.</p>}
        {data.posts.map(p=><PostCard key={p._id} post={p}/>)}
        </div></section>
        <section className="container-page pb-12" aria-labelledby="culture-heading">
        <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Nigeria</p>
        <h2 id="culture-heading" className="mt-1 text-3xl font-black">Culture</h2>
        <p className="mt-2 text-slate-500">Explore the people, style, and creative traditions of Igbo, Hausa, and Yoruba communities.</p>
        </div>
        <CultureGallery/>
        </section>
        <section className="container-page pb-12">
        <h2 className="mb-5 text-2xl font-black">Trending</h2>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >{trend.map(p=><Link className="card p-4 hover:border-indigo-400" 
        to={`/post/${p.slug}`} key={p._id}><b>{p.title}</b>
        <span className="mt-1 block text-xs text-slate-500">{p.views} views</span>
        </Link>)}</div></section></div>
        }
