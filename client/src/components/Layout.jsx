import React from 'react';
import {Link,Outlet} from 'react-router-dom';
import {Moon,Sun,Menu,X,LogOut,Shield} from 'lucide-react';
import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {api} from '../lib/api';
import {useEffect,useState} from 'react';

function getCategoryLoadError(error){
    const status=error?.response?.status;
    if(error?.message==='The categories API returned an unexpected response.'){
        return 'The API response did not include a categories list. Check that VITE_API_URL points to the correct API service.';
    }
    if(error?.message?.includes('API returned HTML instead of JSON')){
        return 'The API URL returned a website page instead of JSON. Check VITE_API_URL and the /api proxy configuration.';
    }
    if(status===403){
        return 'The API rejected this website origin. Check that the API service CLIENT_URL matches the website URL.';
    }
    if(status===404){
        return 'The categories API endpoint was not found. Check that VITE_API_URL points to the API service and includes /api.';
    }
    if(status>=500){
        return `The API failed to load categories (HTTP ${status}). Check the API service logs.`;
    }
    if(status){
        return `The API could not load categories (HTTP ${status}).`;
    }
    return 'The API could not be reached. Check VITE_API_URL, the /api proxy, and the browser Network tab.';
}

export default function Layout(){
    const {dark,setDark}=useTheme();
    const {user,logout}=useAuth();
    const servicesUrl=import.meta.env.VITE_SERVICES_URL?.trim();
    const marketplaceUrl=import.meta.env.VITE_MARKETPLACE_URL?.trim();
    const [open,setOpen]=useState(false);
    const [categories,setCategories]=useState([]);
    const [categoryError,setCategoryError]=useState('');
    const [categoryRetry,setCategoryRetry]=useState(0);
    useEffect(()=>{
        let active=true;
        api.get('/categories')
            .then(response=>{
                if(!Array.isArray(response.data?.categories)){
                    throw new Error('The categories API returned an unexpected response.');
                }
                if(active)setCategories(response.data.categories);
            })
            .catch(error=>{
                if(!active)return;
                const message=getCategoryLoadError(error);
                console.error('Category request failed:',message);
                setCategoryError(message);
            });
        return()=>{active=false};
    },[categoryRetry]);
    const defaultCategories=[
        {_id:'sports',name:'Sports',slug:'sports'},
        {_id:'fashion',name:'Fashion',slug:'fashion'},
        {_id:'culture',name:'Culture',slug:'culture'},
        {_id:'job',name:'Job',slug:'job'},
    ];
    const browseCategories=[...categories, ...defaultCategories]
        .filter((category, index, list) => category && category.slug && category.name && list.findIndex(item => item?.slug === category.slug) === index)
        .sort((a,b)=>a.name.localeCompare(b.name));
    return <><header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90
 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
    <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" onClick={()=>setOpen(false)} aria-label="Prinelva Blog home"
         className="flex shrink-0 items-center gap-2">
            <img src="/media/categories/logo.png" alt="Prinelva Technologies"
             className="h-14 w-14 object-contain"/>
            <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Prinelva<span className="text-indigo-600">Blog</span>
            </span>
        </Link>
        

{servicesUrl&&<a href={servicesUrl} onClick={()=>setOpen(false)} aria-label="IT Services"
         className="hidden shrink-0 items-center gap-2 md:flex">  
            <span className="text-2xl font-black tracking-tight
             text-slate-950 dark:text-white">
                IT<span className="text-indigo-600">Services</span>
            </span>
        </a>}




{marketplaceUrl&&<a href={marketplaceUrl} onClick={()=>setOpen(false)} aria-label="Marketplace"
         className="hidden shrink-0 items-center gap-2 md:flex">  
            <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Market <span className="text-indigo-600">Place</span>
            </span>
        </a>}



      

    

        
         <nav aria-label="Main navigation" className={`${open?'flex':'hidden'} 
         absolute left-0 top-16 w-full flex-col gap-4 border-b
          bg-white p-4 dark:border-slate-800 dark:bg-slate-950 
          md:static md:flex md:w-auto
            md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
            {[['/','Home'],['/search','Search']]
            .map(([to,t])=><Link key={to} onClick={()=>setOpen(false)} 
            className="text-2xl font-black tracking-tight text-slate-950 transition-colors hover:text-indigo-600 dark:text-white"
            to={to}>{t}</Link>)}
            {servicesUrl&&<a href={servicesUrl} onClick={()=>setOpen(false)}
             className="text-2xl font-black tracking-tight text-slate-950 transition-colors hover:text-indigo-600 dark:text-white md:hidden">IT Services</a>
            }
            {marketplaceUrl&&<a href={marketplaceUrl} onClick={()=>setOpen(false)}
             className="text-2xl font-black tracking-tight text-slate-950 transition-colors hover:text-indigo-600 dark:text-white md:hidden">Marketplace</a>
            }
            {['admin','subadmin'].includes(user?.role)&&<Link to="/admin" 
            onClick={()=>setOpen(false)} className="flex items-center gap-1 
            text-indigo-600"><Shield size={16}/>{user.role==='admin'?'Admin':'Staff'}
            </Link>}{user?<><Link to="/account" onClick={()=>setOpen(false)} 
            className="hover:text-indigo-600">Account</Link>
            <button onClick={()=>{logout();
            setOpen(false)}} 
            className="flex items-center gap-1 text-left"><LogOut size={16}/>Logout</button>
            </>:<Link to="/login" onClick={()=>setOpen(false)}
            className="text-2xl font-black tracking-tight text-slate-950 transition-colors hover:text-indigo-600 dark:text-white">Login</Link>}</nav>
            <div className="flex items-center gap-2">
                <button aria-label="theme" onClick={()=>setDark(!dark)} 
                className="rounded-lg p-2 hover:bg-slate-100 
                dark:hover:bg-slate-800">{dark?<Sun size={19}/>:<Moon size={19}/>} 
                </button><button aria-label="Toggle navigation" aria-expanded={open} 
                className="md:hidden" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}
                </button></div></div>
<nav aria-label="Browse categories" className="border-t border-indigo-800 
 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 shadow-sm">
    <div className="container-page flex justify-start gap-5 overflow-x-auto py-3 text-sm whitespace-nowrap md:justify-center">
        {browseCategories.map(category=><Link key={
            category._id || category.slug} onClick={()=>setOpen(false)}
            className="shrink-0 font-medium text-indigo-100 transition-colors hover:text-white"
            to={`/category/${category.slug}`}>{category.name}</Link>)}
        {!categories.length&&!categoryError&&
        <span role="status" className="shrink-0 text-indigo-100">Loading categories...</span>
        }
    </div>
</nav>{categoryError&&<div role="alert" className="container-page flex flex-wrap items-center gap-3 py-2 text-xs text-red-600 dark:text-red-400"><span>{categoryError}</span><button type="button" className="font-semibold underline" onClick={()=>{setCategoryError('');setCategoryRetry(retry=>retry+1)}}>Retry</button></div>}</header><main><Outlet/></main><footer className="mt-16 border-t border-slate-200 bg-slate-50 px-4 py-8 dark:border-slate-800 dark:bg-slate-950">
    <div className="container-page grid gap-8 md:grid-cols-3">
        <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Prinelva Blog</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Insights on web development, digital creativity, design, and modern technology.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Explore</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <Link className="block hover:text-indigo-600" to="/">Home</Link>
                <Link className="block hover:text-indigo-600" to="/search">Search</Link>
                <Link className="block hover:text-indigo-600" to="/category/culture">Culture</Link>
            </div>
        </div>
        <div>
            <Newsletter/>
        </div>
    </div>
</footer></>;
}
function Newsletter(){const [email,setEmail]=useState('');
    const [msg,setMsg]=useState('');
    async function submit(e){e.preventDefault();
        try{const response=await api.post('/newsletter',{email});
        setMsg(response.data.message);
        setEmail('')}catch(error){setMsg(error.response?.data?.message||'Could not subscribe. Please try again.')}}
        return <form onSubmit={submit}><p className="font-semibold">Newsletter</p>
        <p className="mt-1 text-xs text-slate-500">Get new post announcements. Unsubscribe from any email.</p>
        <div className="mt-2 flex gap-2">
            <input className="input" aria-label="Email address" placeholder="you@example.com" value={email} onChange={
                e=>setEmail(e.target.value)
            }
                 required type="email"/>
                 <button className="btn bg-indigo-600 text-white">Join</button>
                 </div><small role="status" className="text-slate-500">{msg}</small>
                 </form>
                 }
