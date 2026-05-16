import axios from 'axios';

// O Vite sabe automaticamente quando está na Vercel (PROD) ou no seu PC (DEV)
const backendUrl = import.meta.env.PROD
  ? 'https://projeto-receita-certa-production.up.railway.app' // <-- TROQUE PELA SUA URL REAL DA RENDER AQUI!!!
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: backendUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jeyfoods_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o token expirar ou for inválido, o Backend retorna 403 ou 401.
    // Capturamos isso globalmente para deslogar e mandar p/ Login limpar os erros.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('jeyfoods_token');
      localStorage.removeItem('jeyfoods_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
