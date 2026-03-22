import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import { User, Mail, CreditCard, Calendar, ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        
        if (passwords.new !== passwords.confirm) {
            return setStatus({ type: 'error', message: 'A nova senha e a confirmação não batem.' });
        }
        if (passwords.new.length < 6) {
            return setStatus({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
        }

        setIsSubmitting(true);
        try {
            const res = await api.put('/auth/me/password', { 
                currentPassword: passwords.current, 
                newPassword: passwords.new 
            });
            setStatus({ type: 'success', message: res.data.message });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Erro interno ao alterar senha.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
                    <User size={32} className="text-brand-600 dark:text-brand-500" />
                    Meu Perfil
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 mt-2 font-medium">Resumo do titular da conta e central de segurança.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Cartão de Informações */}
                <div className="bg-white dark:bg-zinc-900/50 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800/50 backdrop-blur-xl p-8 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800/50">
                        <div className="bg-brand-50 dark:bg-brand-500/10 p-3 rounded-2xl text-brand-600 dark:text-brand-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Visão Geral da Conta</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Dados oficiais registrados no sistema.</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Nome do Titular</label>
                            <p className="text-gray-900 dark:text-zinc-100 font-semibold text-lg flex items-center gap-2 mt-1">
                                <User size={16} className="text-gray-400" /> {profile?.name}
                            </p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">E-mail Comercial</label>
                            <p className="text-gray-900 dark:text-zinc-100 font-semibold flex items-center gap-2 mt-1">
                                <Mail size={16} className="text-gray-400" /> {profile?.email}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700/50">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={12}/> CPF Seguro</label>
                                <p className="text-gray-900 dark:text-zinc-100 font-medium mt-1.5 text-sm">{profile?.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : '---'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700/50">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12}/> Nascimento</label>
                                <p className="text-gray-900 dark:text-zinc-100 font-medium mt-1.5 text-sm">{profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : '---'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cartão de Senha */}
                <div className="bg-white dark:bg-zinc-900/50 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800/50 backdrop-blur-xl p-8">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800/50">
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl text-zinc-600 dark:text-zinc-400">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Alterar Senha</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Gerencie a segurança do seu ambiente.</p>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in zoom-in duration-300 ${status.type === 'error' ? 'bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' : 'bg-green-50 border border-green-200 text-green-600 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400'}`}>
                            {status.type === 'error' ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
                            <p>{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Senha Atual</label>
                            <input 
                                type="password" required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 shadow-sm"
                                placeholder="Digite sua senha em uso"
                                value={passwords.current}
                                onChange={e => setPasswords({...passwords, current: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Nova Senha</label>
                            <input 
                                type="password" required minLength="6"
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-brand-200 dark:border-brand-500/30 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 shadow-sm"
                                placeholder="Mínimo de 6 caracteres"
                                value={passwords.new}
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Repita a Nova Senha</label>
                            <input 
                                type="password" required minLength="6"
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-zinc-100 shadow-sm"
                                placeholder="Confirme a nova senha"
                                value={passwords.confirm}
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" disabled={isSubmitting}
                            className="w-full mt-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Atualizar Segurança'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Profile;
