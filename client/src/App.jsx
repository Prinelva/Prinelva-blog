import React, {lazy,Suspense} from 'react';
import {Routes,Route,Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import {useAuth} from './context/AuthContext';
import {Link} from 'react-router-dom';
const Home=lazy(()=>import('./pages/Home'));
const Search=lazy(()=>import('./pages/Search'));
const Post=lazy(()=>import('./pages/Post'));
const Category=lazy(()=>import('./pages/Category'));
const Admin=lazy(()=>import('./pages/Admin'));
const Editor=lazy(()=>import('./pages/Editor'));
const Account=lazy(()=>import('./pages/Account'));
const Login=lazy(()=>import('./pages/Auth').then(module=>({default:module.Login})));
const Register=lazy(()=>import('./pages/Auth').then(module=>({default:module.Register})));
const Forgot=lazy(()=>import('./pages/Auth').then(module=>({default:module.Forgot})));
const Reset=lazy(()=>import('./pages/Auth').then(module=>({default:module.Reset})));
function Guard({children,admin=false}){
    const {user,loading}=useAuth();
    if(loading)return <div className="container-page py-16" role="status">Loading account...</div>;
    if(!user)return <Navigate to="/login"/>;
    if(admin&&!['admin','subadmin'].includes(user.role))return <Navigate to="/"/>;
    return children
}
export default function App(){
    return <Suspense fallback={<div className="container-page py-16" role="status">Loading page...</div>}>
        <Routes><Route element={<Layout/>}>
        <Route path="/" element={<Home/>}/>
        <Route path="/search" element={<Search/>}/>
        <Route path="/post/:slug" element={<Post/>}/>
        <Route path="/category/:slug" element={<Category/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/forgot-password" element={<Forgot/>}/>
        <Route path="/reset-password/:token" element={<Reset/>}/>
        <Route path="/account" element={<Guard><Account/></Guard>}/>
        <Route path="/admin" element={<Guard admin><Admin/>
        </Guard>}/><Route path="/admin/new" element={<Guard admin><Editor/>
        </Guard>}/><Route path="/admin/edit/:id" element={<Guard admin>
            <Editor/></Guard>}/><Route path="*" element={<div className="container-page py-20 text-center">
                <h1 className="text-4xl font-black">Page not found</h1>
                <p className="mt-3 text-slate-500">The page you requested doesn’t exist or may have moved.</p>
                <Link className="btn mt-6 inline-block bg-indigo-600 text-white" to="/">Back to home</Link>
            </div>}/></Route></Routes>
        </Suspense>}
