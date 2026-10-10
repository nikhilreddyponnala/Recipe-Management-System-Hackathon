import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import { authService, favoriteService } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  favoriteIds: Set<string>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<boolean>;
  isFavorite: (recipeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('recipehub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('recipehub_token');
      if (!storedToken) {
        setUser(null);
        setFavoriteIds(new Set());
        setIsLoading(false);
        return;
      }

      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.favoriteRecipeIds) {
          setFavoriteIds(new Set(res.user.favoriteRecipeIds));
        }
      } else {
        localStorage.removeItem('recipehub_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('recipehub_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('recipehub_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        await fetchCurrentUser();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to sign in. Check your credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: string }) => {
    try {
      const res = await authService.register(data);
      if (res.success && res.token) {
        localStorage.setItem('recipehub_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success('Account created successfully! Welcome to RecipeHub.');
        await fetchCurrentUser();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('recipehub_token');
    setToken(null);
    setUser(null);
    setFavoriteIds(new Set());
    toast.info('You have logged out.');
  };

  const toggleFavorite = async (recipeId: string): Promise<boolean> => {
    if (!user) {
      toast.info('Please log in or create an account to save favorite recipes.');
      return false;
    }

    const currentlyFav = favoriteIds.has(recipeId);
    try {
      if (currentlyFav) {
        await favoriteService.removeFavorite(recipeId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
        toast.info('Removed from your favorites.');
        return false;
      } else {
        await favoriteService.addFavorite(recipeId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.add(recipeId);
          return next;
        });
        toast.success('Saved to your favorites!');
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update favorites.');
      return currentlyFav;
    }
  };

  const isFavorite = (recipeId: string) => favoriteIds.has(recipeId);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        favoriteIds,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
