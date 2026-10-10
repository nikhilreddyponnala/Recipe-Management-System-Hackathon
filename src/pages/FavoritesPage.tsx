import React, { useState, useEffect } from 'react';
import { Heart, Search, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '../types/index.ts';
import { favoriteService } from '../services/api.ts';
import { RecipeCard } from '../components/RecipeCard.tsx';
import { CategoryFilter } from '../components/CategoryFilter.tsx';

interface FavoritesPageProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onExploreRecipes: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onSelectRecipe,
  onExploreRecipes,
}) => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await favoriteService.getFavorites();
      if (res.success) {
        setFavorites(res.favorites);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const filteredFavorites = favorites.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-[#EA580C]" />
            <span>RecipeNest Favorites</span>
          </div>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#2D2A26]">
            My Saved Recipes
          </h1>
          <p className="text-xs sm:text-sm text-[#7B7368] mt-1">
            Your personal cookbook of handpicked dishes to cook and savor
          </p>
        </div>

        <button
          onClick={onExploreRecipes}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D8] text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Explore More Dishes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {favorites.length > 0 && (
        <>
          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Search bar inside favorites */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in your saved favorites..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-white focus:outline-none focus:border-[#E86A33]"
            />
          </div>
        </>
      )}

      {/* Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-stone-100 animate-pulse border border-[#E8E2D8]" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-[#E8E2D8] max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#E86A33]/10 text-[#E86A33] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2A26] mb-2">
            No Saved Recipes Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#7B7368] leading-relaxed mb-6">
            Whenever you find a dish you'd love to cook, click the heart icon on any recipe card to save it here for easy kitchen reference.
          </p>
          <button
            onClick={onExploreRecipes}
            className="px-6 py-2.5 bg-[#E86A33] hover:bg-[#D45924] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Browse Recipe Catalog
          </button>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E8E2D8]">
          <UtensilsCrossed className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-[#7B7368]">
            No saved recipes match the category "{selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearch('');
            }}
            className="mt-3 text-xs text-[#E86A33] font-semibold hover:underline cursor-pointer"
          >
            Show All Saved Recipes
          </button>
        </div>
      )}
    </div>
  );
};
