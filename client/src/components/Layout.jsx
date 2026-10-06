import React from 'react';
import {Link,Outlet} from 'react-router-dom';
import {Moon,Sun,Menu,X,LogOut,Shield} from 'lucide-react';
import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {api} from '../lib/api';
import {useEffect,useState} from 'react';
export default function Layout(){
    const {dark,setDark}=useTheme();
    const {user,logout}=useAuth();
    const servicesUrl=import.meta.env.VITE_SERVICES_URL?.trim();
    const marketplaceUrl=import.meta.env.VITE_MARKETPLACE_URL?.trim();
    const [open,setOpen]=useState(false);
const [categories,setCategories]=useState([]);
const [categoryError,setCategoryError]=useState('');
useEffect(()=>{api.get('/categories')
    .then(response=>setCategories(response.data.categories))
    .catch(()=>setCategoryError('Categories could not be loaded. Refresh the page to try again.'))},[]);
const browseCategories=categories
    .filter(category=>!['technologies','css','sports','nodejs','react'].includes(category.slug)
        &&category.name.toLowerCase()!=='react')
    .concat([
        ...(!categories.some(category=>category.slug==='sports')
            ?[{_id:'sports',name:'Sports',slug:'sports'}]:[]),
        ...(!categories.some(category=>category.slug==='fashion')
            ?[{_id:'fashion',name:'Fashion',slug:'fashion'}]:[]),
        ...(!categories.some(category=>category.slug==='culture')
            ?[{_id:'culture',name:'Culture',slug:'culture'}]:[]),
        ...(!categories.some(category=>category.slug==='job')
            ?[{_id:'job',name:'Job',slug:'job'}]:[]),
    ])
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
            category._id} onClick={()=>setOpen(false)}
            className="shrink-0 font-medium text-indigo-100 transition-colors hover:text-white"
            to={`/category/${category.slug}`}>{category.name}</Link>)}
        {!categories.length&&!categoryError&&
        <span role="status" className="shrink-0 text-indigo-100">Loading categories...</span>
        }
    </div>
</nav>{categoryError&&<p role="status" className="container-page py-2 text-xs text-red-600 dark:text-red-400">{categoryError}</p>}</header><main><Outlet/></main><footer className="mt-16 border-t border-slate-200 py-10 dark:border-slate-800"><div className="container-page grid gap-8 md:grid-cols-3"><div><b>PrinelvaBlog</b><p className="mt-2 text-sm text-slate-500">A modern full-stack developer blog.</p></div><Newsletter/><div><p className="text-sm text-slate-500">© {new Date().getFullYear()} PrinelvaBlog</p></div></div></footer></>}
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
