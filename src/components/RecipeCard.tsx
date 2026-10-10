import React from 'react';
import { Clock, Heart, Users, Flame, Star } from 'lucide-react';
import { Recipe } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(recipe._id);
  const totalMinutes = recipe.preparationTime + recipe.cookingTime;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe._id);
  };

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E8E2D8] hover:border-[#D5CDC0] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer text-left"
    >
      {/* Recipe Food Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={recipe.imageUrl || '/src/assets/images/hero_culinary_spread_1791610397373.jpg'}
          alt={recipe.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/src/assets/images/hero_culinary_spread_1791610397373.jpg';
          }}
        />

        {/* Favorite Heart Button */}
        <button
          onClick={handleHeartClick}
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md cursor-pointer ${
            favorited
              ? 'bg-[#EA580C] text-white'
              : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-[#EA580C]'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Category Pill Replacement */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide">
          {recipe.category}
        </div>

        {/* Star Rating Overlay */}
        {recipe.rating && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-[#2D2A26] text-[11px] font-bold flex items-center gap-1 shadow-sm font-mono">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{recipe.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata line with typographic separators (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#7B7368] mb-2 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{totalMinutes}m</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{recipe.difficulty}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{recipe.servings} serv</span>
            </span>
            {recipe.nutrition && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#0F472B] font-semibold">
                  {recipe.nutrition.calories} kcal
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#2D2A26] line-clamp-1 group-hover:text-[#EA580C] transition-colors mb-1.5 leading-snug">
            {recipe.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#6B6357] line-clamp-2 leading-relaxed mb-4">
            {recipe.description}
          </p>
        </div>

        {/* Footer: Author Byline */}
        <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs text-[#827A6F]">
          <span className="truncate">
            By <span className="font-semibold text-[#3D372F]">{recipe.author?.name || 'Chef'}</span>
          </span>
          {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
            <span className="text-[11px] text-[#0F472B] font-semibold truncate max-w-[130px]">
              {recipe.dietaryTags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
