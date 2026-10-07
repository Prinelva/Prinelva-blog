import axios from 'axios';
const PRODUCTION_API_URL='https://prinelva-blog-production.up.railway.app/api';
const loopbackApiUrl=/^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;
// Reference variables such as ${{ service.RAILWAY_PUBLIC_DOMAIN }} are not resolved at build time,
// and RAILWAY_PUBLIC_DOMAIN has no scheme. Ignore unresolved values and normalise the rest.
const normalizeApiUrl=value=>{
    if(typeof value!=='string')return '';
    let url=value.trim();
    if(!url||url.includes('${{')||url==='undefined'||url==='null')return '';
    if(!/^https?:\/\//i.test(url)&&!url.startsWith('/'))url=`https://${url}`;
    url=url.replace(/\/+$/,'');
    return /\/api$/i.test(url)?url:`${url}/api`;
};
const runtimeApiUrl=normalizeApiUrl(typeof window!=='undefined'?window.__APP_CONFIG__?.apiUrl:'');
const configuredApiUrl=normalizeApiUrl(import.meta.env.VITE_API_URL);
const apiBaseUrl=import.meta.env.PROD
    ?[runtimeApiUrl,configuredApiUrl].find(url=>url&&!loopbackApiUrl.test(url))||PRODUCTION_API_URL
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
