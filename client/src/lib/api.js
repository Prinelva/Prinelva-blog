import axios from 'axios';

const loopbackApiUrl = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;

const normalizeApiUrl = (value) => {
    if (typeof value !== 'string') return '';

    let url = value.trim();
    if (!url || url.includes('${{') || url === 'undefined' || url === 'null') return '';
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) url = `https://${url}`;
    url = url.replace(/\/+$/, '');
    return /\/api$/i.test(url) ? url : `${url}/api`;
};

const runtimeApiUrl = normalizeApiUrl(typeof window !== 'undefined' ? window.__APP_CONFIG__?.apiUrl : '');
const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);

const apiBaseUrl = import.meta.env.PROD
    ? [runtimeApiUrl, configuredApiUrl].find((url) => url && !loopbackApiUrl.test(url))
        || (typeof window !== 'undefined' && !loopbackApiUrl.test(window.location.origin) ? '/api' : 'http://localhost:5000/api')
    : configuredApiUrl || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.response.use((response) => {
    const contentType = response.headers['content-type'];
    if (typeof contentType === 'string' && contentType.includes('text/html')) {
        return Promise.reject(new Error('The API returned HTML instead of JSON. Check VITE_API_URL and the /api proxy configuration.'));
    }
    return response;
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
