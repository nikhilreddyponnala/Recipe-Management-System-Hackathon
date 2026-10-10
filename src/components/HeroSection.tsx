import React from 'react';
import { Search, Sparkles, ChefHat, Flame, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSelectCategory: (category: string) => void;
  onViewFeatured: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSelectCategory,
  onViewFeatured,
}) => {
  const POPULAR_DISHES = [
    { label: 'Biryani', query: 'Biryani' },
    { label: 'Butter Chicken', query: 'Butter Chicken' },
    { label: 'Burgers', query: 'Burger' },
    { label: 'Pizza', query: 'Pizza' },
    { label: 'Tacos', query: 'Taco' },
    { label: 'Ramen', query: 'Ramen' },
    { label: 'Pasta', query: 'Pasta' },
    { label: 'Dumplings', query: 'Dumpling' },
    { label: 'Salmon Poke', query: 'Salmon' },
    { label: 'Club Sandwich', query: 'Sandwich' },
    { label: 'Greek Salad', query: 'Salad' },
    { label: 'Pancakes', query: 'Pancake' },
    { label: 'Tiramisu', query: 'Tiramisu' },
    { label: 'Payasam', query: 'Payasam' },
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-14 bg-gradient-to-b from-[#F5EFE6] to-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F472B] uppercase tracking-wider mb-3 bg-[#0F472B]/10 px-3.5 py-1.5 rounded-full border border-[#0F472B]/15">
              <ChefHat className="w-4 h-4 text-[#EA580C]" />
              <span>RecipeHub · Discover · Save · Cook</span>
            </div>

            <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2D2A26] tracking-tight leading-[1.12] mb-5 [text-wrap:balance]">
              Discover Your Next <span className="italic text-[#EA580C]">Favourite</span> Recipe
            </h1>

            <p className="text-base sm:text-lg text-[#5F5850] max-w-xl mb-7 leading-relaxed">
              Explore authentic home-cooked delicacies, wood-fired artisan classics, curate your personal cookbook, and cook with step-by-step chef guidance.
            </p>

            {/* Prominent Search Bar */}
            <form onSubmit={onSearchSubmit} className="w-full max-w-xl mb-5">
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-md border border-[#E8E2D8] focus-within:border-[#EA580C] focus-within:ring-3 focus-within:ring-[#EA580C]/20 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any recipe (e.g. Biryani, Pizza, Tacos, Butter Chicken, Pasta)..."
                  className="w-full px-3 py-2 text-sm text-[#2D2A26] placeholder-stone-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Quick Popular Food Search Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#5F5850]">
              <span className="font-bold text-[#0F472B] mr-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
                Trending Foods:
              </span>
              {POPULAR_DISHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.query);
                    onSearchSubmit({ preventDefault: () => {} } as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    searchQuery.toLowerCase() === item.query.toLowerCase()
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-white hover:bg-[#EA580C] hover:text-white border-[#E8E2D8] text-stone-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Anchor */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E8E2D8] bg-stone-100 shadow-2xl group cursor-pointer" onClick={onViewFeatured}>
              <img
                src="/src/assets/images/recipe_hyderabadi_dum_biryani_1791614814016.jpg"
                alt="Royal Hyderabadi Chicken Dum Biryani"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Chef's Featured Grand Selection</span>
                </div>
                <h3 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold mb-1.5 leading-snug">
                  Royal Hyderabadi Dum Biryani
                </h3>
                <p className="text-xs text-stone-200 line-clamp-2 mb-3">
                  Aromatic basmati rice layered with saffron, marinated chicken, fried onions, and royal whole spices.
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-300 font-medium">
                  <span className="bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-white">45 mins</span>
                  <span className="bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-white">Serves 6</span>
                  <span className="text-amber-300 font-bold">★ 4.98 (230 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
