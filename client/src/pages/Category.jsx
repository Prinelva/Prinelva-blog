import React from 'react';
import {useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {api} from '../lib/api';
import PostCard from '../components/PostCard';
import CultureGallery from '../components/CultureGallery';
export default function Category(){
const {slug}=useParams();
const [cat,setCat]=useState(null);
const [posts,setPosts]=useState([]);
const [loading,setLoading]=useState(true);
const [error,setError]=useState('');
useEffect(()=>{let active=true;setLoading(true);
    setError('');
    Promise.all([api.get('/categories'),
        api.get('/posts',{params:{category:slug}})])
        .then(([a,b])=>{if(!active)
            return;
            setCat(a.data.categories.find(x=>x.slug===slug)||
                (slug==='culture'?{name:'Culture',description:'Explore the people, style, and creative traditions of Igbo, Hausa, and Yoruba communities.'}:
                    slug==='job'?{name:'Job',description:'Career opportunities, job search advice, and workplace insights.'}:null));
            setPosts(b.data.posts)})
        .catch(()=>{if(active)setError('This category could not be loaded. Please refresh the page to try again.')})
        .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
},[slug]);return <div className="container-page py-12">
        <h1 className="text-4xl font-black">{cat?.name||slug}</h1>
        <p className="mt-2 text-slate-500">{cat?.description}</p>
        {slug==='culture'&&<section className="mt-8" aria-label="Igbo, Hausa, and Yoruba culture">
            <CultureGallery linkImages={false}/>
        </section>}
        {error&&<p role="alert" className="mt-6 text-red-600">{error}</p>}
        {loading&&<p role="status" className="mt-6 text-slate-500">Loading posts...</p>}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!loading&&!error&&!posts.length&&<p className="text-slate-500">No posts in this category yet.</p>}
            {posts.map(p=><PostCard key={p._id} post={p}/>)}</div></div>
            }
