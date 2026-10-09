import React from 'react';
import {useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {api} from '../lib/api';
import PostCard from '../components/PostCard';
import CultureGallery from '../components/CultureGallery';
import {categoryCovers} from '../lib/categoryCovers';
export default function Category(){
const {slug}=useParams();
const [cat,setCat]=useState(null);
const [posts,setPosts]=useState([]);
const [loading,setLoading]=useState(true);
const [error,setError]=useState('');
const [categoryError,setCategoryError]=useState('');
useEffect(()=>{let active=true;setLoading(true);
    setError('');
    setCategoryError('');
    api.get('/categories')
        .then(response=>{if(!active)return;
            setCat(response.data.categories.find(x=>x.slug===slug)||
                (slug==='culture'?{name:'Culture',description:'Explore the people, style, and creative traditions of Igbo, Hausa, and Yoruba communities.'}:
                    slug==='job'?{name:'Job',description:'Career opportunities, job search advice, and workplace insights.'}:null));
        })
        .catch(()=>{if(active)setCategoryError('Category details could not be loaded. Please refresh the page to try again.')});
    api.get('/posts',{params:{category:slug}})
        .then(response=>{if(active)setPosts(response.data.posts)})
        .catch(()=>{if(active)setError('Posts for this category could not be loaded. Please refresh the page to try again.')})
        .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
},[slug]);return <div className="container-page py-12">
        <section className="relative isolate mb-8 flex min-h-64 items-end overflow-hidden rounded-3xl bg-slate-900 p-8 md:min-h-80 md:p-12">
            <img src={categoryCovers[slug]||'/media/categories/technologies.svg'}
                alt={`${cat?.name||slug} category cover`}
                onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src='/media/categories/technologies.svg'}}
                className="absolute inset-0 z-0 h-full w-full object-cover"/>
            <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-transparent"/>
            <div className="relative z-20 max-w-3xl text-white">
                <h1 className="text-4xl font-black capitalize md:text-5xl">{cat?.name||slug}</h1>
                {cat?.description&&<p className="mt-3 text-base text-white/90 md:text-lg">{cat.description}</p>}
                {categoryError&&<p role="status" className="mt-3 text-sm text-white/90">{categoryError}</p>}
            </div>
        </section>
        {slug==='culture'&&<section className="mt-8" aria-label="Igbo, Hausa, and Yoruba culture">
            <CultureGallery linkImages={false}/>
        </section>}
        {error&&<p role="alert" className="mt-6 text-red-600">{error}</p>}
        {loading&&<p role="status" className="mt-6 text-slate-500">Loading posts...</p>}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!loading&&!error&&!posts.length&&<p className="text-slate-500">No posts in this category yet.</p>}
            {posts.map(p=><PostCard key={p._id} post={p}/>)}</div></div>
            }
