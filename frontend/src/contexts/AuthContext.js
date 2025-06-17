import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Définir le token dans le header de l'API
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Récupérer les informations utilisateur
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Erreur de vérification d\'authentification:', error);
          // Supprimer le token si invalide
          localStorage.removeItem('token');
          api.defaults.headers.common['Authorization'] = '';
        }
      }

      setLoading(false);
      setInitialized(true);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);

      const { user, tokens } = response.data;

      // Stocker le token dans localStorage
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Définir le token dans le header de l'API
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

      setUser(user);
      setLoading(false);

      toast.success('Connexion réussie');
      return true;
    } catch (error) {
      setLoading(false);

      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      return false;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);

      const { user, tokens } = response.data;

      // Stocker le token dans localStorage
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Définir le token dans le header de l'API
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

      setUser(user);
      setLoading(false);

      toast.success('Inscription réussie');
      return true;
    } catch (error) {
      setLoading(false);

      const message = error.response?.data?.message || 'Erreur d\'inscription';
      toast.error(message);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer les tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // Réinitialiser le header d'authentification
      api.defaults.headers.common['Authorization'] = '';

      setUser(null);
      toast.success('Déconnexion réussie');
    }
  };

  // Mise à jour du profil utilisateur
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', profileData);

      setUser(response.data.user);
      setLoading(false);

      toast.success('Profil mis à jour avec succès');
      return true;
    } catch (error) {
      setLoading(false);

      const message = error.response?.data?.message || 'Erreur de mise à jour du profil';
      toast.error(message);
      return false;
    }
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        register,
        logout,
        updateProfile,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
