import { NavLink, useLocation } from 'react-router-dom';
import { Database, BookOpen, Moon, Sun, HelpCircle, LogOut, X } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = ({ onOpenTutorial, isOpen, onClose }) => {
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Fechar sidebar mobile ao mudar de rota
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [isOpen, location.pathname, onClose]);

  useEffect(() => {
    // Check initial layout
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white dark:bg-zinc-950/95 dark:backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] border-r border-gray-100 dark:border-zinc-800/50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1 bg-white border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden shrink-0">
            <img src="/jeyfoods-logo.png" alt="JeyFoods" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 leading-tight">Receita</h1>
            <h1 className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400 leading-tight dark:drop-shadow-[0_0_8px_rgba(177,42,42,0.4)]">Certa</h1>
          </div>
        </div>
        <button className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 p-5 space-y-2">
        <div className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4 px-2">Menu Principal</div>
        
        <NavLink 
          to="/ingredients"
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              isActive 
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 font-medium shadow-sm dark:shadow-[0_0_20px_rgba(177,42,42,0.1)] border border-brand-100/50 dark:border-brand-500/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100 border border-transparent'
            }`
          }
        >
          <Database size={20} className="group-hover:scale-110 transition-transform" />
          Ingredientes
        </NavLink>
        
        <NavLink 
          to="/recipes"
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              isActive 
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 font-medium shadow-sm dark:shadow-[0_0_20px_rgba(177,42,42,0.1)] border border-brand-100/50 dark:border-brand-500/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100 border border-transparent'
            }`
          }
        >
          <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
          Receitas
        </NavLink>

        <button 
          onClick={onOpenTutorial}
          className="w-full flex items-center justify-start gap-3 px-4 py-3 mt-4 rounded-xl transition-all duration-300 group text-gray-500 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 border border-transparent font-medium shadow-sm hover:shadow-[0_0_20px_rgba(177,42,42,0.1)] dark:hover:border-brand-500/20 hover:border-brand-100/50"
        >
          <HelpCircle size={20} className="group-hover:scale-110 transition-transform group-hover:rotate-12" />
          Como Usar
        </button>
      </nav>
      
      <div className="p-4 border-t border-gray-50 dark:border-zinc-800/50 bg-gray-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors">
        <NavLink to="/profile" className="flex items-center gap-3 overflow-hidden flex-1 group cursor-pointer" title="Configurações da Conta">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold shrink-0 shadow-sm uppercase border border-transparent group-hover:scale-105 transition-transform group-hover:border-brand-200 dark:group-hover:border-brand-500/30">
            {user?.name?.charAt(0) || 'J'}
          </div>
          <div className="text-xs text-left truncate">
            <p className="font-bold text-gray-800 dark:text-zinc-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{user?.name || 'Administrador'}</p>
            <p className="text-gray-400 dark:text-zinc-500 mt-0.5 truncate max-w-[100px]">{user?.email || 'Acesso VIP'}</p>
          </div>
        </NavLink>
        
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 dark:text-zinc-500 dark:hover:text-amber-400 transition-colors"
            title="Alternar Tema"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button 
            onClick={logout}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Desconectar (Sair)"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
