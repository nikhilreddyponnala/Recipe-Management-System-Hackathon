import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Plus, Clock, ChefHat, X, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { Recipe } from '../types/index.ts';
import { RecipeCard } from '../components/RecipeCard.tsx';
import { CategoryFilter } from '../components/CategoryFilter.tsx';
import { recipeService } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface RecipesPageProps {
  recipes: Recipe[];
  isLoading: boolean;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenCreateRecipe: () => void;
  onRecipeCreated?: () => void;
}

const POPULAR_FOOD_TAGS = [
  { label: 'All Foods', query: '' },
  { label: 'Biryani', query: 'Biryani' },
  { label: 'Butter Chicken', query: 'Butter Chicken' },
  { label: 'Burgers', query: 'Burger' },
  { label: 'Pizza', query: 'Pizza' },
  { label: 'Tacos', query: 'Taco' },
  { label: 'Ramen & Noodles', query: 'Ramen' },
  { label: 'Pasta', query: 'Pasta' },
  { label: 'Dumplings / Momos', query: 'Dumpling' },
  { label: 'Salmon Poke', query: 'Salmon' },
  { label: 'Club Sandwich', query: 'Sandwich' },
  { label: 'Greek Salad', query: 'Salad' },
  { label: 'Pancakes', query: 'Pancake' },
  { label: 'Tiramisu', query: 'Tiramisu' },
  { label: 'Payasam', query: 'Payasam' },
  { label: 'Paneer Tikka', query: 'Paneer' },
];

// Stemming helper for client-side search
function stemTerm(word: string): string {
  let w = word.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!w) return '';
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && w.length > 4 && (w.endsWith('shes') || w.endsWith('ches') || w.endsWith('xes') || w.endsWith('ses'))) {
    return w.slice(0, -2);
  }
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  return w;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({
  recipes,
  isLoading,
  searchQuery = '',
  setSearchQuery = () => {},
  selectedCategory = 'All',
  setSelectedCategory = () => {},
  onSelectRecipe,
  onOpenCreateRecipe,
  onRecipeCreated,
}) => {
  const toast = useToast();

  // Additional filters
  const [difficulty, setDifficulty] = useState('All');
  const [dietary, setDietary] = useState('All');
  const [maxTime, setMaxTime] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'title_asc' | 'prep_asc' | 'popular'>('newest');
  const [isGeneratingDish, setIsGeneratingDish] = useState(false);

  // Multi-term fuzzy client search over all recipes with stemming and scoring
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Search query matching
    const queryTrimmed = (searchQuery || '').trim();
    if (queryTrimmed.length > 0) {
      const rawQ = queryTrimmed.toLowerCase();
      // Filter out generic filler words
      const rawTokens = rawQ
        .split(/[\s,]+/)
        .filter(Boolean)
        .filter((t) => !['recipe', 'recipes', 'dish', 'dishes', 'food', 'foods', 'the', 'a', 'an'].includes(t));

      const stemmedTokens = rawTokens.map(stemTerm).filter(Boolean);

      const scored = result.map((r) => {
        let score = 0;
        const titleLower = r.title.toLowerCase();
        const descLower = r.description.toLowerCase();
        const categoryLower = r.category.toLowerCase();
        const tagsLower = r.dietaryTags.map((t) => t.toLowerCase()).join(' ');
        const ingredientsLower = r.ingredients.map((ing) => `${ing.name} ${ing.quantity}`.toLowerCase()).join(' ');
        const instructionsLower = r.instructions.join(' ').toLowerCase();

        // Exact query match anywhere
        if (titleLower.includes(rawQ)) score += 100;
        else if (tagsLower.includes(rawQ) || categoryLower.includes(rawQ)) score += 60;
        else if (descLower.includes(rawQ)) score += 40;
        else if (ingredientsLower.includes(rawQ)) score += 30;

        // Token matches
        for (let i = 0; i < rawTokens.length; i++) {
          const token = rawTokens[i];
          const stemmed = stemmedTokens[i] || token;

          if (titleLower.includes(token) || (stemmed.length > 2 && titleLower.includes(stemmed))) {
            score += 50;
          }
          if (categoryLower.includes(token) || tagsLower.includes(token) || (stemmed.length > 2 && (categoryLower.includes(stemmed) || tagsLower.includes(stemmed)))) {
            score += 35;
          }
          if (ingredientsLower.includes(token) || (stemmed.length > 2 && ingredientsLower.includes(stemmed))) {
            score += 25;
          }
          if (descLower.includes(token) || instructionsLower.includes(token) || (stemmed.length > 2 && (descLower.includes(stemmed) || instructionsLower.includes(stemmed)))) {
            score += 15;
          }
        }

        return { recipe: r, score };
      });

      result = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).map((item) => item.recipe);
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Difficulty
    if (difficulty !== 'All') {
      result = result.filter((r) => r.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Dietary
    if (dietary !== 'All') {
      result = result.filter((r) => r.dietaryTags.some((t) => t.toLowerCase() === dietary.toLowerCase()));
    }

    // Max Time
    if (maxTime > 0) {
      result = result.filter((r) => r.preparationTime + r.cookingTime <= maxTime);
    }

    // Sorting (if not already sorted by search score)
    if (!queryTrimmed || sortBy !== 'newest') {
      if (sortBy === 'newest') {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'title_asc') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'prep_asc') {
        result.sort((a, b) => a.preparationTime + a.cookingTime - (b.preparationTime + b.cookingTime));
      } else if (sortBy === 'popular') {
        result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
      }
    }

    return result;
  }, [recipes, searchQuery, selectedCategory, difficulty, dietary, maxTime, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDifficulty('All');
    setDietary('All');
    setMaxTime(0);
    setSortBy('newest');
  };

  const handleGenerateOnDemand = async (dishName: string) => {
    if (!dishName.trim()) return;
    setIsGeneratingDish(true);
    try {
      const res = await recipeService.generate(dishName.trim());
      if (res.success && res.recipe) {
        toast.success(`Chef's recipe for "${res.recipe.title}" created successfully!`);
        if (onRecipeCreated) {
          onRecipeCreated();
        }
        onSelectRecipe(res.recipe);
      }
    } catch (err) {
      toast.error('Failed to craft recipe on demand. Please try again.');
    } finally {
      setIsGeneratingDish(false);
    }
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || difficulty !== 'All' || dietary !== 'All' || maxTime > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F472B] uppercase tracking-wider mb-1">
            <ChefHat className="w-4 h-4 text-[#EA580C]" />
            <span>RecipeHub Complete Culinary Catalog</span>
          </div>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#2D2A26]">
            All Food Recipes
          </h1>
          <p className="text-xs sm:text-sm text-[#7B7368] mt-1">
            Search by any food item — Biryani, Butter Chicken, Pizza, Burger, Tacos, Ramen, Pasta, Dumplings, or fresh ingredients
          </p>
        </div>

        <button
          onClick={onOpenCreateRecipe}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Share Recipe</span>
        </button>
      </div>

      {/* Category Segmented Control */}
      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {/* Quick Food Search Chips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-[#0F472B] shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Quick Foods:</span>
        </span>
        {POPULAR_FOOD_TAGS.map((tag) => {
          const isActive =
            (tag.query === '' && (!searchQuery || searchQuery === '')) ||
            (tag.query !== '' && searchQuery && searchQuery.toLowerCase() === tag.query.toLowerCase());
          return (
            <button
              key={tag.label}
              onClick={() => setSearchQuery(tag.query)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-[#0F472B] text-white border-[#0F472B] shadow-xs'
                  : 'bg-white hover:bg-[#FAF7F2] text-stone-700 border-[#E8E2D8]'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input with Clear Button */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any food (e.g. biryani, burger, pizza, taco, chicken, pasta)..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-[#E8E2D8] focus:outline-none focus:border-[#EA580C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="md:col-span-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-white text-stone-700 focus:outline-none focus:border-[#EA580C]"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy Level</option>
              <option value="Medium">Medium Level</option>
              <option value="Hard">Hard Level</option>
            </select>
          </div>

          {/* Dietary Dropdown */}
          <div className="md:col-span-2">
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-white text-stone-700 focus:outline-none focus:border-[#EA580C]"
            >
              <option value="All">All Dietary Types</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Dairy-Free">Dairy-Free</option>
              <option value="High-Protein">High-Protein</option>
              <option value="Low-Carb">Low-Carb</option>
            </select>
          </div>

          {/* Max Time Filter */}
          <div className="md:col-span-3">
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-white text-stone-700 focus:outline-none focus:border-[#EA580C]"
            >
              <option value="0">Any Cooking Time</option>
              <option value="15">Quick (Under 15 Mins)</option>
              <option value="30">Under 30 Mins</option>
              <option value="45">Under 45 Mins</option>
              <option value="60">Under 60 Mins</option>
            </select>
          </div>
        </div>

        {/* Second Row: Sort & Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F0EBE1] text-xs">
          <div className="flex items-center gap-2 text-[#7B7368]">
            <span className="font-bold text-[#2D2A26] font-mono tabular-nums">
              {filteredRecipes.length}
            </span>
            <span>recipes available</span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[#EA580C] hover:underline ml-2 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#7B7368] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D8] bg-white text-stone-700 font-medium focus:outline-none focus:border-[#EA580C]"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular & Top Rated</option>
              <option value="title_asc">Alphabetical (A-Z)</option>
              <option value="prep_asc">Fastest Prep Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-stone-100 animate-pulse border border-[#E8E2D8]" />
          ))}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 sm:p-14 text-center rounded-3xl bg-white border border-[#E8E2D8] shadow-sm">
          <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26] mb-1">
            No pre-made recipes matching "{searchQuery}"
          </h3>
          <p className="text-xs text-[#7B7368] max-w-md mx-auto mb-6 leading-relaxed">
            Would you like our chef engine to craft an authentic, realistic gourmet recipe for "{searchQuery}" right now?
          </p>

          {searchQuery && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => handleGenerateOnDemand(searchQuery)}
                disabled={isGeneratingDish}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingDish ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Crafting Recipe for "{searchQuery}"...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Gourmet Recipe for "{searchQuery}"</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="border-t border-[#F0EBE1] pt-6 mt-4">
            <p className="text-xs text-stone-400 mb-3">Or explore our signature popular dishes:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {['Biryani', 'Butter Chicken', 'Burger', 'Pizza', 'Taco', 'Ramen', 'Pasta', 'Dumplings', 'Salmon', 'Sandwich'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSearchQuery(f)}
                  className="px-3 py-1 bg-[#FAF7F2] hover:bg-[#EA580C] hover:text-white border border-[#E8E2D8] rounded-lg text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#0F472B] hover:bg-[#134E35] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Show All Recipes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
