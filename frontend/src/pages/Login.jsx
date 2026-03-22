import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao efetuar o login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex relative overflow-hidden selection:bg-brand-500/30">
      {/* Background Decorativo Estilo Glass */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/50 dark:border-zinc-800/50 transition-all">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 mb-6 shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden p-1.5">
              <img src="/jeyfoods-logo.png" alt="Logo JeyFoods" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
              Receita<span className="text-brand-600 dark:text-brand-400">Certa</span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 font-medium tracking-wide">by JeyFoods</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in zoom-in duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">E-mail de Acesso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm"
                  placeholder="gerencia@jeyfoods.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 my-2 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Entrar na Plataforma'}
            </button>
            
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400 font-medium">
              Não é cadastrado? <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold hover:underline underline-offset-4">Cadastre-se</Link>
            </p>
          </form>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-12 font-medium text-center">
          &copy; 2026 Sistema Interno JeyFoods. Requer credenciais verificadas.
        </p>
      </div>
    </div>
  );
};

export default Login;
