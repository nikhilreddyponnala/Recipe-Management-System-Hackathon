import axios from 'axios';
import { Recipe, User, DashboardStats } from '../types/index.ts';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recipehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authService = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/login', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },
};

// Recipe API
export interface RecipeFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  dietaryTag?: string;
  author?: string;
  maxTime?: number;
  sort?: string;
}

export const recipeService = {
  getAll: async (filters: RecipeFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.difficulty && filters.difficulty !== 'All') params.append('difficulty', filters.difficulty);
    if (filters.dietaryTag && filters.dietaryTag !== 'All') params.append('dietaryTag', filters.dietaryTag);
    if (filters.author) params.append('author', filters.author);
    if (filters.maxTime) params.append('maxTime', String(filters.maxTime));
    if (filters.sort) params.append('sort', filters.sort);

    const res = await api.get<{ success: boolean; count: number; recipes: Recipe[] }>(`/recipes?${params.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; recipe: Recipe; isFavorited: boolean }>(`/recipes/${id}`);
    return res.data;
  },

  create: async (data: Partial<Recipe>) => {
    const res = await api.post<{ success: boolean; recipe: Recipe; message: string }>('/recipes', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Recipe>) => {
    const res = await api.put<{ success: boolean; recipe: Recipe; message: string }>(`/recipes/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/recipes/${id}`);
    return res.data;
  },

  generate: async (dishName: string) => {
    const res = await api.post<{ success: boolean; recipe: Recipe; message: string }>('/recipes/generate', { dishName });
    return res.data;
  },
};

// Favorites API
export const favoriteService = {
  getFavorites: async () => {
    const res = await api.get<{ success: boolean; count: number; favorites: Recipe[] }>('/favorites');
    return res.data;
  },

  addFavorite: async (recipeId: string) => {
    const res = await api.post<{ success: boolean; message: string; recipeId: string }>(`/favorites/${recipeId}`);
    return res.data;
  },

  removeFavorite: async (recipeId: string) => {
    const res = await api.delete<{ success: boolean; message: string; recipeId: string }>(`/favorites/${recipeId}`);
    return res.data;
  },

  checkStatus: async (recipeId: string) => {
    const res = await api.get<{ success: boolean; isFavorite: boolean }>(`/favorites/${recipeId}/status`);
    return res.data;
  },
};

// Admin API
export const adminService = {
  getUsers: async () => {
    const res = await api.get<{ success: boolean; count: number; users: User[] }>('/admin/users');
    return res.data;
  },

  getAllRecipes: async () => {
    const res = await api.get<{ success: boolean; count: number; recipes: Recipe[] }>('/admin/recipes');
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);
    return res.data;
  },
};

// Dashboard API
export const dashboardService = {
  getStats: async () => {
    const res = await api.get<{ success: boolean; stats: DashboardStats }>('/dashboard/stats');
    return res.data;
  },
};

export default api;
