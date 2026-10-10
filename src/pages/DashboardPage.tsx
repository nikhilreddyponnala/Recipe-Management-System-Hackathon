import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Heart,
  Plus,
  Users,
  PieChart,
  Edit3,
  Trash2,
  Clock,
  Sparkles,
  Utensils,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { DashboardStats, Recipe } from '../types/index.ts';
import { dashboardService, recipeService } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface DashboardPageProps {
  onOpenCreateRecipe: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onExploreRecipes: () => void;
  onOpenPostmanGuide: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onSelectRecipe,
  onExploreRecipes,
  onOpenPostmanGuide,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.stats);
      }

      if (user) {
        const myRes = await recipeService.getAll({ author: user.id });
        if (myRes.success) {
          setMyRecipes(myRes.recipes);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-48 bg-stone-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-stone-100 animate-pulse rounded-2xl border border-[#E8E2D8]" />
          ))}
        </div>
      </div>
    );
  }

  const categoryEntries = stats?.categoryDistribution
    ? Object.entries(stats.categoryDistribution)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* Header & User Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <span className="text-xs font-bold text-[#0F472B] uppercase tracking-wider block mb-1">
            RecipeNest · Discover · Save · Cook
          </span>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#2D2A26]">
            Welcome, {user?.name || 'Chef'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7B7368] mt-1">
            Live MongoDB metrics, authored recipes, and culinary quick actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPostmanGuide}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D8] text-stone-700 hover:text-[#E86A33] transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#E86A33]" />
            <span>API Test Suite</span>
          </button>
          <button
            onClick={onOpenCreateRecipe}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E86A33] hover:bg-[#D45924] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Recipe</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4-column strip) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recipes */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase tracking-wider mb-1">
              Platform Recipes
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#2D2A26] font-mono tabular-nums">
              {stats?.totalRecipes ?? 0}
            </p>
            <p className="text-[11px] text-[#2E7D32] font-medium mt-1">Live in MongoDB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E86A33]/10 text-[#E86A33] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Recipes Created by Current User */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase tracking-wider mb-1">
              My Recipes
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#2D2A26] font-mono tabular-nums">
              {myRecipes.length}
            </p>
            <p className="text-[11px] text-[#2E7D32] font-medium mt-1">Published by you</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* User Saved Favorites */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase tracking-wider mb-1">
              Saved Favorites
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#2D2A26] font-mono tabular-nums">
              {stats?.userFavoritesCount ?? 0}
            </p>
            <p className="text-[11px] text-[#E86A33] font-medium mt-1">Personal bookmarks</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Total Registered Cooks */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase tracking-wider mb-1">
              Community Cooks
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#2D2A26] font-mono tabular-nums">
              {stats?.totalUsers ?? 0}
            </p>
            <p className="text-[11px] text-[#7B7368] font-medium mt-1">Registered members</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2-Column Split: Category Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Category Breakdown Chart / Progress Bars */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#E86A33]" />
              <h2 className="font-['Playfair_Display',serif] text-lg font-bold text-[#2D2A26]">
                Recipe Category Distribution
              </h2>
            </div>
            <span className="text-xs text-[#7B7368]">
              {stats?.totalRecipes ?? 0} total dishes
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryEntries.map(([categoryName, count]) => {
              const total = stats?.totalRecipes || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={categoryName} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-[#3E3832] font-semibold">{categoryName}</span>
                    <span className="text-[#7B7368] font-mono tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#E86A33] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions & Difficulty Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-sm space-y-4">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2A26]">
              Quick Actions
            </h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={onOpenCreateRecipe}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EBE1] border border-[#E8E2D8] flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E86A33] text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-stone-800">Add New Recipe</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
              </button>

              <button
                onClick={onExploreRecipes}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EBE1] border border-[#E8E2D8] flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-stone-800">Explore Catalog</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
              </button>

              <button
                onClick={onOpenPostmanGuide}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EBE1] border border-[#E8E2D8] flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-stone-800 text-white flex items-center justify-center">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-stone-800">Open Postman Testing Suite</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
              </button>
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs">
            <h4 className="font-bold text-[#2D2A26] mb-3">Skill Level Breakdown</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D8]">
                <p className="text-[10px] text-stone-500 font-semibold uppercase">Easy</p>
                <p className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
                  {stats?.difficultyDistribution?.Easy ?? 0}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D8]">
                <p className="text-[10px] text-stone-500 font-semibold uppercase">Medium</p>
                <p className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                  {stats?.difficultyDistribution?.Medium ?? 0}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D8]">
                <p className="text-[10px] text-stone-500 font-semibold uppercase">Hard</p>
                <p className="text-lg font-bold text-red-700 font-mono tabular-nums">
                  {stats?.difficultyDistribution?.Hard ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Authored Recipes Section (Manage / Edit / Delete CRUD) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D8] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#2D2A26]">
              Recipes Created by You
            </h2>
            <p className="text-xs text-[#7B7368]">
              Manage, update, or remove dishes you've submitted to the platform
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-stone-500 tabular-nums">
            {myRecipes.length} recipes
          </span>
        </div>

        {myRecipes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FAF7F2] border border-dashed border-[#E8E2D8]">
            <Utensils className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">You haven't added any recipes yet</p>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Share your family traditions or gourmet experiments with the community.
            </p>
            <button
              onClick={onOpenCreateRecipe}
              className="px-4 py-2 bg-[#E86A33] hover:bg-[#D45924] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Add Your First Recipe
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E2D8] text-[#7B7368] font-semibold">
                  <th className="py-3 px-3">Recipe</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Difficulty</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {myRecipes.map((r) => (
                  <tr key={r._id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-3">
                      <div
                        onClick={() => onSelectRecipe(r)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                        />
                        <div>
                          <p className="font-semibold text-stone-900 group-hover:text-[#E86A33] transition-colors line-clamp-1">
                            {r.title}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600">{r.category}</td>
                    <td className="py-3 px-3 text-stone-600 font-mono tabular-nums">
                      {r.preparationTime + r.cookingTime} mins
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[#2E7D32] font-medium">{r.difficulty}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEditRecipe(r)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#E86A33] hover:bg-white border border-[#E8E2D8] transition-colors cursor-pointer"
                          title="Edit Recipe"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecipe(r)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 transition-colors cursor-pointer"
                          title="Delete Recipe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
