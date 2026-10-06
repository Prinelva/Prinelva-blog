import React,{useState} from 'react';
import {api} from '../lib/api';

export default function Account(){
    const [currentPassword,setCurrentPassword]=useState('');
    const [newPassword,setNewPassword]=useState('');
    const [message,setMessage]=useState('');
    const [error,setError]=useState('');
    const [saving,setSaving]=useState(false);

    async function submit(event){
        event.preventDefault();
        setMessage('');
        setError('');
        setSaving(true);
        try{
            const response=await api.put('/auth/password',{currentPassword,newPassword});
            setMessage(response.data.message);
            setCurrentPassword('');
            setNewPassword('');
        }catch(err){
            setError(err.response?.data?.message||'Password could not be changed. Please try again.');
        }finally{
            setSaving(false);
        }
    }

    return <div className="container-page max-w-md py-16">
        <h1 className="text-3xl font-black">Account security</h1>
        <p className="mt-2 text-slate-500">Change your password using a new, unique password.</p>
        <form className="mt-6 space-y-3" onSubmit={submit}>
            <input className="input" type="password" required autoComplete="current-password"
                placeholder="Current password" value={currentPassword}
                onChange={event=>setCurrentPassword(event.target.value)}/>
            <input className="input" type="password" required minLength={8}
                autoComplete="new-password" placeholder="New password (at least 8 characters)"
                value={newPassword} onChange={event=>setNewPassword(event.target.value)}/>
            <button disabled={saving} className="btn bg-indigo-600 text-white disabled:opacity-50">
                {saving?'Updating...':'Change password'}
            </button>
        </form>
        {message&&<p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
        {error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </div>;
}
