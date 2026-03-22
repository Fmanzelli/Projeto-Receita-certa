import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const recoveredUser = localStorage.getItem('jeyfoods_user');
    const token = localStorage.getItem('jeyfoods_token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = response.data;
    
    localStorage.setItem('jeyfoods_user', JSON.stringify(loggedUser));
    localStorage.setItem('jeyfoods_token', token);
    
    setUser(loggedUser);
    navigate('/ingredients');
  };

  const register = async (name, cpf, birth_date, email, password) => {
    const rawCpf = cpf.replace(/\D/g, ''); // Envia limpo para o DB
    await api.post('/auth/register', { name, cpf: rawCpf, birth_date, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('jeyfoods_user');
    localStorage.removeItem('jeyfoods_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated: !!user, 
      user, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
