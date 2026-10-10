import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, Clock, Plus } from 'lucide-react';
import { Recipe } from '../types/index.ts';
import { HeroSection } from '../components/HeroSection.tsx';
import { CategoryFilter } from '../components/CategoryFilter.tsx';
import { RecipeCard } from '../components/RecipeCard.tsx';

interface HomePageProps {
  recipes: Recipe[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenCreateRecipe: () => void;
  onViewAllRecipes: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  recipes,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSearchSubmit,
  onSelectRecipe,
  onOpenCreateRecipe,
  onViewAllRecipes,
}) => {
  // Trending recipes (first 3)
  const trendingRecipes = recipes.slice(0, 3);
  // Recently added recipes (all filtered)
  const recentRecipes = recipes.slice(0, 6);

  const featuredRecipe = recipes.find(
    (r) => r._id === 'recipe_hyderabadi_biryani_101'
  ) || recipes[0];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={onSearchSubmit}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          onViewAllRecipes();
        }}
        onViewFeatured={() => {
          if (featuredRecipe) onSelectRecipe(featuredRecipe);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Category Filter Bar */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-4">
            <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2A26]">
              Browse by Culinary Category
            </h2>
            <p className="text-xs text-[#7B7368] mt-1">
              Find handcrafted dishes tailored to your mealtime cravings
            </p>
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Trending & Popular Recipes */}
        {trendingRecipes.length > 0 && selectedCategory === 'All' && !searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E86A33]/15 text-[#E86A33] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2A26]">
                    Trending & Popular Dishes
                  </h2>
                  <p className="text-xs text-[#7B7368]">
                    Most loved recipes bookmarked by our cooking community
                  </p>
                </div>
              </div>
              <button
                onClick={onViewAllRecipes}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E86A33] hover:text-[#D45924] transition-colors cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={onSelectRecipe}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Recipes Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/15 text-[#2E7D32] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2A26]">
                  {selectedCategory !== 'All' ? `${selectedCategory} Recipes` : 'Recently Added Recipes'}
                </h2>
                <p className="text-xs text-[#7B7368]">
                  Fresh culinary inspirations straight from our kitchen contributors
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCreateRecipe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E86A33] hover:bg-[#D45924] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Recipe</span>
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl bg-stone-100 animate-pulse border border-[#E8E2D8]"
                />
              ))}
            </div>
          ) : recentRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={onSelectRecipe}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E8E2D8]">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26] mb-1">
                No recipes found for this selection
              </h3>
              <p className="text-xs text-[#7B7368] max-w-sm mx-auto mb-5">
                We couldn't find any dishes matching "{searchQuery || selectedCategory}". Try searching for another ingredient or reset your filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-[#E86A33] text-white text-xs font-semibold rounded-xl hover:bg-[#D45924] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
