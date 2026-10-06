import React, {useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {api} from '../lib/api';
import GoogleSignIn from '../components/GoogleSignIn';

export function Login(){
    const [data,setData]=useState({email:'',password:''});
    const {login}=useAuth();
    const navigate=useNavigate();
    const location=useLocation();
    async function signIn(){
        await login(data);
        const destination=location.state?.from;
        navigate(typeof destination==='string'&&destination.startsWith('/')&&!destination.startsWith('//')
            ?destination:'/');
    }
    return <div className="container-page max-w-md py-16">
        <AuthForm title="Welcome back" button="Login" data={data} setData={setData}
            onSubmit={signIn}/>
        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
            OR
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
        </div>
        <GoogleSignIn onSignedIn={()=>navigate(typeof location.state?.from==='string'
            &&location.state.from.startsWith('/')&&!location.state.from.startsWith('//')
            ?location.state.from:'/')}/>
        <div className="mt-4 flex justify-between text-sm">
            <Link className="text-indigo-600 hover:underline" to="/forgot-password">Forgot password?</Link>
            <Link className="text-indigo-600 hover:underline" to="/register">Create an account</Link>
        </div>
    </div>;
}

export function Register(){
    const [data,setData]=useState({name:'',email:'',password:''});
    const {register}=useAuth();
    const navigate=useNavigate();
    return <div className="container-page max-w-md py-16">
        <AuthForm title="Create account" button="Register" data={data} setData={setData} name
            onSubmit={async()=>{await register(data);navigate('/')}}/>
        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
            OR
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
        </div>
        <GoogleSignIn onSignedIn={()=>navigate('/')}/>
    </div>;
}

export function Forgot(){
    const [email,setEmail]=useState('');
    const [message,setMessage]=useState('');
    const [error,setError]=useState('');
    const [sending,setSending]=useState(false);
    async function submit(event){
        event.preventDefault();
        setError('');
        setMessage('');
        setSending(true);
        try{
            const response=await api.post('/auth/forgot-password',{email});
            setMessage(response.data.devResetUrl||response.data.message);
        }catch(err){
            setError(err.response?.data?.message||'Could not request a reset link. Please try again.');
        }finally{
            setSending(false);
        }
    }
    return <div className="container-page max-w-md py-16">
        <h1 className="text-3xl font-black">Forgot password</h1>
        <p className="mt-2 text-slate-500">Enter your account email and we’ll send a password reset link.</p>
        <form className="mt-6 space-y-3" onSubmit={submit}>
            <input className="input" type="email" required placeholder="Email" value={email}
                onChange={event=>setEmail(event.target.value)}/>
            <button disabled={sending} className="btn bg-indigo-600 text-white disabled:opacity-50">
                {sending?'Sending...':'Send reset link'}
            </button>
        </form>
        {message&&<p role="status" className="mt-4 break-all text-sm text-emerald-700">{message}</p>}
        {error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <Link className="mt-5 inline-block text-sm text-indigo-600 hover:underline" to="/login">Back to login</Link>
    </div>;
}

export function Reset(){
    const {token}=useParams();
    const navigate=useNavigate();
    const [password,setPassword]=useState('');
    const [message,setMessage]=useState('');
    const [error,setError]=useState('');
    const [saving,setSaving]=useState(false);
    async function submit(event){
        event.preventDefault();
        setError('');
        setSaving(true);
        try{
            const response=await api.post(`/auth/reset-password/${token}`,{password});
            setMessage(response.data.message);
            setTimeout(()=>navigate('/login'),1500);
        }catch(err){
            setError(err.response?.data?.message||'Could not reset your password. Please request a new link.');
        }finally{
            setSaving(false);
        }
    }
    return <div className="container-page max-w-md py-16">
        <h1 className="text-3xl font-black">Choose a new password</h1>
        <form className="mt-6 space-y-3" onSubmit={submit}>
            <input className="input" type="password" minLength={8} required
                autoComplete="new-password" placeholder="New password (at least 8 characters)"
                value={password} onChange={event=>setPassword(event.target.value)}/>
            <button disabled={saving} className="btn bg-indigo-600 text-white disabled:opacity-50">
                {saving?'Saving...':'Reset password'}
            </button>
        </form>
        {message&&<p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
        {error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </div>;
}

function AuthForm({title,button,data,setData,onSubmit,name}){
    const [error,setError]=useState('');
    const [submitting,setSubmitting]=useState(false);
    async function submit(event){
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try{
            await onSubmit();
        }catch(err){
            setError(err.response?.data?.message||'Could not complete your request. Please try again.');
        }finally{
            setSubmitting(false);
        }
    }
    return <>
        <h1 className="text-3xl font-black">{title}</h1>
        <form className="mt-6 space-y-3" onSubmit={submit}>
            {name&&<input className="input" required maxLength={80} placeholder="Name"
                value={data.name} onChange={event=>setData({...data,name:event.target.value})}/>}
            <input className="input" required type="email" autoComplete="email" placeholder="Email"
                value={data.email} onChange={event=>setData({...data,email:event.target.value})}/>
            <input className="input" required minLength={8} type="password"
                autoComplete={name?'new-password':'current-password'}
                placeholder={name?'Password (at least 8 characters)':'Password'}
                value={data.password} onChange={event=>setData({...data,password:event.target.value})}/>
            <button disabled={submitting} className="btn w-full bg-indigo-600 text-white disabled:opacity-50">
                {submitting?'Please wait...':button}
            </button>
        </form>
        {error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </>;
}
