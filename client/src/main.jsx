import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {GoogleOAuthProvider} from '@react-oauth/google';
import {HelmetProvider} from 'react-helmet-async';
import App from './App';
import './index.css';
import {AuthProvider} from './context/AuthContext';
import {ThemeProvider} from './context/ThemeContext';
const app=<React.StrictMode><HelmetProvider><BrowserRouter><ThemeProvider><AuthProvider><App/></AuthProvider></ThemeProvider></BrowserRouter></HelmetProvider></React.StrictMode>;
const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(import.meta.env.VITE_GOOGLE_CLIENT_ID
    ?<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>{app}
    </GoogleOAuthProvider>
    :app);
