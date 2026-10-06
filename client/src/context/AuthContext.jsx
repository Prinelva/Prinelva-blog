import React, {createContext,useContext,useEffect,useState} from 'react';import {api} from '../lib/api';
const C=createContext();
export function AuthProvider({children}){
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    useEffect(()=>{
        if(!localStorage.getItem('token')){
            setLoading(false);
            return;
        }
        api.get('/auth/me')
            .then(r=>setUser(r.data.user))
            .catch(()=>localStorage.removeItem('token'))
            .finally(()=>setLoading(false));
    },[]);
    const login=async(d)=>{
            const r=await api.post('/auth/login',d);
            localStorage.setItem('token',r.data.token);
            setUser(r.data.user)};
            const googleLogin=async(credential)=>{
                const r=await api.post('/auth/google',{credential});
                localStorage.setItem('token',r.data.token);
                setUser(r.data.user);
            };
            const register=async(d)=>{const r=await api.post('/auth/register',d);
                localStorage.setItem('token',r.data.token);setUser(r.data.user)};
                const logout=()=>{localStorage.removeItem('token');setUser(null)};
                return <C.Provider value={{user,login,googleLogin,register,logout,loading}}>{children}</C.Provider>}
                export const useAuth=()=>useContext(C);
