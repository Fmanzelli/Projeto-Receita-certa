import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, CreditCard, Calendar } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove não numéricos
    if (value.length > 11) value = value.slice(0, 11);
    
    // Máscara 000.000.000-00 dinâmica (UX)
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    
    setCpf(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cpf.replace(/\D/g, '').length !== 11) {
      return setError('O CPF deve conter exatamente 11 números.');
    }
    if (password.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres.');
    }
    
    setError('');
    setIsSubmitting(true);
    try {
      await register(name, cpf, birthDate, email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex relative overflow-hidden selection:bg-brand-500/30">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/50 dark:border-zinc-800/50">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Criar Nova Conta</h1>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 font-medium text-sm">Preencha os dados reais para criar a gestão da sua loja.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in zoom-in duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Seu Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required 
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm"
                  placeholder="Ex: João Chef"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">CPF</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                    <CreditCard size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Nascimento (+18)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="date" 
                    required 
                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm text-xs font-medium"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">E-mail Comercial</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required 
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm"
                  placeholder="gerencia@jeyfoods.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Senha Segura</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required 
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 shadow-sm"
                  placeholder="Mínimo 6 dígitos"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-zinc-900/20 dark:shadow-white/20 mt-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Criar minha Conta'}
            </button>
            
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400 font-medium pt-2">
              Já possui uma conta? <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold hover:underline underline-offset-4">Fazer Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
