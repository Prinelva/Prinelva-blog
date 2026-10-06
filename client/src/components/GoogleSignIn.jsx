import React,{useState} from 'react';
import {GoogleLogin} from '@react-oauth/google';
import {useAuth} from '../context/AuthContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignIn({onSignedIn}){
    const {googleLogin}=useAuth();
    const [error,setError]=useState('');
    const [loading,setLoading]=useState(false);

    if(!clientId){
        return <p className="text-sm text-amber-700" role="status">
            Google commenting is not configured yet. Please contact the site administrator.
        </p>;
    }

    async function handleSuccess(response){
        if(!response.credential){
            setError('Google did not return a sign-in credential. Please try again.');
            return;
        }
        setError('');
        setLoading(true);
        try{
            await googleLogin(response.credential);
            onSignedIn?.();
        }catch(err){
            setError(err.response?.data?.message||'Google sign-in failed. Please try again.');
        }finally{
            setLoading(false);
        }
    }

    return <div className="space-y-2">
        <GoogleLogin onSuccess={handleSuccess}
            onError={()=>setError('Google sign-in failed or was cancelled. Please try again.')}
            text="continue_with" shape="rectangular" theme="outline" size="large"/>
        {loading&&<p className="text-sm text-slate-500" role="status">Signing in with Google...</p>}
        {error&&<p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>;
}
