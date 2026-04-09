import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import Profile from './pages/Profile';
import TutorialModal from './components/TutorialModal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Bloqueio Global contra Invasores não autenticados
const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }
  
  return authenticated ? children : <Navigate to="/login" />;
};

// O Corpo interno do App para ler Contextos
function AppContent() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { authenticated } = useContext(AuthContext);

  useEffect(() => {
    if (authenticated) {
      const hasSeen = localStorage.getItem('jeyfoods_tutorial_seen');
      if (!hasSeen) {
        setTimeout(() => setShowTutorial(true), 700);
        localStorage.setItem('jeyfoods_tutorial_seen', 'true');
      }
    }
  }, [authenticated]);

  return (
    <div className="flex h-screen overflow-hidden selection:bg-brand-500/30 relative bg-gray-50 dark:bg-zinc-950">
      {/* Abstract Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none hidden dark:block"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none hidden dark:block"></div>
      
      {/* Backdrop for Mobile Sidebar */}
      {authenticated && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Oculta nas telas de Login/Signup */}
      {authenticated && <Sidebar onOpenTutorial={() => setShowTutorial(true)} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-10">
        {/* Topbar para Mobile */}
        {authenticated && (
          <div className="lg:hidden bg-white dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1 bg-white border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden shrink-0">
                <img src="/jeyfoods-logo.png" alt="JeyFoods" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-brand-600 dark:text-brand-400">Receita Certa</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto ${authenticated ? 'p-4 md:p-8 lg:p-12' : 'p-0'}`}>
          <div className={`${authenticated ? 'max-w-6xl mx-auto' : 'w-full h-full'}`}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={!authenticated ? <Login /> : <Navigate to="/ingredients" />} />
            <Route path="/register" element={!authenticated ? <Signup /> : <Navigate to="/ingredients" />} />
            
            {/* Rotas Privadas (Protegidas por Crachá) */}
            <Route path="/" element={<PrivateRoute><Navigate to="/ingredients" replace /></PrivateRoute>} />
            <Route path="/ingredients" element={<PrivateRoute><Ingredients /></PrivateRoute>} />
            <Route path="/recipes" element={<PrivateRoute><Recipes /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      </div>
      
      {authenticated && <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

// O Casco externo principal
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
