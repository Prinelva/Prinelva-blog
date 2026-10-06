import axios from 'axios';
const configuredApiUrl=import.meta.env.VITE_API_URL?.trim();
const loopbackApiUrl=/^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;
const apiBaseUrl=import.meta.env.PROD
    ?configuredApiUrl&&!loopbackApiUrl.test(configuredApiUrl)?configuredApiUrl:'/api'
    :configuredApiUrl||'http://localhost:5000/api';
export const api=axios.create({baseURL:apiBaseUrl});
api.interceptors.response.use(response=>{
    const contentType=response.headers['content-type'];
    if(typeof contentType==='string'&&contentType.includes('text/html')){
        return Promise.reject(new Error('The API returned HTML instead of JSON. Check VITE_API_URL and the /api proxy configuration.'));
    }
    return response;
});
    api.interceptors.request.use(c=>{const t=localStorage.getItem('token');
        if(t)c.headers.Authorization=`Bearer ${t}`;
        return c
    });
