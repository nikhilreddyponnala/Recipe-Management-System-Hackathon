export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  recipeCount?: number;
  favoriteCount?: number;
  favoriteRecipeIds?: string[];
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Desserts' | 'Vegetarian';
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  imageUrl: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  nutrition?: NutritionInfo;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRecipes: number;
  userRecipeCount: number;
  userFavoritesCount: number;
  totalUsers: number;
  totalPlatformFavorites: number;
  categoryDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  recentRecipes: Recipe[];
  userRecentRecipes: Recipe[];
}
