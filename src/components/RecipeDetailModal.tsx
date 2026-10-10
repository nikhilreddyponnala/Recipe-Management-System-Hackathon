import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Flame,
  Users,
  Heart,
  Edit3,
  Trash2,
  Check,
  ChefHat,
  Tag,
  Star,
  Printer,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Recipe } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user, isAdmin, isFavorite, toggleFavorite } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);

  // Cooking Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  if (!recipe) return null;

  const baseServings = recipe.servings || 4;
  const currentServings = Math.max(1, Math.round(baseServings * servingsMultiplier));
  const ratio = currentServings / baseServings;

  const favorited = isFavorite(recipe._id);
  const isAuthor = user && (recipe.author?._id === user.id || recipe.author === (user.id as any));
  const canModify = isAuthor || isAdmin;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Helper to dynamically scale numbers in ingredient strings
  const scaleQuantity = (quantityStr: string) => {
    if (ratio === 1) return quantityStr;
    // Replace leading numbers or fractions
    return quantityStr.replace(/(\d+(\.\d+)?)/g, (match) => {
      const val = parseFloat(match);
      if (isNaN(val)) return match;
      const scaled = val * ratio;
      return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1);
    });
  };

  const startTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerActive(true);
    setIsTimerOpen(true);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col my-auto text-left">
        {/* Sticky Action Bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setIsTimerOpen(!isTimerOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md cursor-pointer ${
              timerActive
                ? 'bg-[#0F472B] text-white animate-pulse'
                : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-[#0F472B]'
            }`}
            title="Kitchen Cooking Timer"
          >
            <Timer className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-stone-900 flex items-center justify-center shadow-md transition-colors cursor-pointer"
            title="Print Recipe"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavorite(recipe._id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md cursor-pointer ${
              favorited
                ? 'bg-[#EA580C] text-white'
                : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-[#EA580C]'
            }`}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-stone-900 flex items-center justify-center shadow-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Kitchen Timer Drawer */}
        {isTimerOpen && (
          <div className="absolute top-16 right-4 z-20 p-4 bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-700 text-xs w-64 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Timer className="w-4 h-4" /> Kitchen Timer
              </span>
              <button
                onClick={() => setIsTimerOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-3xl font-mono font-bold text-center my-3 tracking-widest tabular-nums text-white">
              {formatTimer(timerSeconds)}
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] font-semibold flex items-center gap-1"
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{timerActive ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerSeconds(0);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-stone-800 pt-2 text-[11px] text-stone-400">
              <span>Quick Presets:</span>
              <div className="flex gap-1.5">
                {[5, 10, 15, 20].map((m) => (
                  <button
                    key={m}
                    onClick={() => startTimer(m)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Banner with Food Image */}
          <div className="relative h-64 sm:h-84 w-full bg-stone-100 overflow-hidden">
            <img
              src={recipe.imageUrl || '/src/assets/images/hero_culinary_spread_1791610397373.jpg'}
              alt={recipe.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/src/assets/images/hero_culinary_spread_1791610397373.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                <span>{recipe.category}</span>
                <span>·</span>
                <span>{recipe.difficulty} Level</span>
                {recipe.rating && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#84CC16]">
                      <Star className="w-3.5 h-3.5 fill-current" /> {recipe.rating.toFixed(2)} ({recipe.reviewsCount || 42} reviews)
                    </span>
                  </>
                )}
              </div>
              <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
                {recipe.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-300">
                <span>By {recipe.author?.name || 'Chef'}</span>
                <span>·</span>
                <span>Published on RecipeNest</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2D8] flex items-center justify-center text-[#EA580C]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7B7368] uppercase font-semibold">Prep Time</p>
                  <p className="text-sm font-bold text-[#2D2A26] font-mono">{recipe.preparationTime} mins</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2D8] flex items-center justify-center text-[#EA580C]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7B7368] uppercase font-semibold">Cook Time</p>
                  <p className="text-sm font-bold text-[#2D2A26] font-mono">{recipe.cookingTime} mins</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2D8] flex items-center justify-center text-[#0F472B]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7B7368] uppercase font-semibold">Yield</p>
                  <p className="text-sm font-bold text-[#2D2A26] font-mono">{currentServings} servings</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2D8] flex items-center justify-center text-amber-600">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7B7368] uppercase font-semibold">Difficulty</p>
                  <p className="text-sm font-bold text-[#2D2A26]">{recipe.difficulty}</p>
                </div>
              </div>
            </div>

            {/* Nutrition Facts Bar */}
            {recipe.nutrition && (
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B7368] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F472B]" />
                  <span>Estimated Nutrition (Per Serving)</span>
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-[#FAF7F2] rounded-xl">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase">Calories</p>
                    <p className="text-base font-bold text-[#2D2A26] font-mono tabular-nums">
                      {recipe.nutrition.calories} <span className="text-[10px] text-stone-500 font-normal">kcal</span>
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF7F2] rounded-xl">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase">Protein</p>
                    <p className="text-base font-bold text-[#0F472B] font-mono tabular-nums">
                      {recipe.nutrition.protein}g
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF7F2] rounded-xl">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase">Carbs</p>
                    <p className="text-base font-bold text-[#2D2A26] font-mono tabular-nums">
                      {recipe.nutrition.carbs}g
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF7F2] rounded-xl">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase">Healthy Fats</p>
                    <p className="text-base font-bold text-[#EA580C] font-mono tabular-nums">
                      {recipe.nutrition.fat}g
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B7368] mb-2">Culinary Notes</h4>
              <p className="text-sm sm:text-base text-[#4A443C] leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Dietary Tags */}
            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#7B7368] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Dietary:
                </span>
                {recipe.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold text-[#0F472B] bg-[#0F472B]/10 px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 2-Column Split: Dynamic Ingredients & Cooking Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t border-[#E8E2D8]">
              {/* Ingredients Column */}
              <div className="md:col-span-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26]">
                    Ingredients
                  </h3>
                  {/* Dynamic Servings Stepper */}
                  <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8E2D8] px-2 py-1 rounded-lg text-xs">
                    <span className="text-stone-500 text-[11px]">Servings:</span>
                    <button
                      onClick={() => setServingsMultiplier((prev) => Math.max(0.5, prev - 0.5))}
                      className="w-5 h-5 rounded bg-white hover:bg-stone-200 font-bold text-center leading-none"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold px-1">{currentServings}</span>
                    <button
                      onClick={() => setServingsMultiplier((prev) => prev + 0.5)}
                      className="w-5 h-5 rounded bg-white hover:bg-stone-200 font-bold text-center leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#7B7368] mb-3">
                  Check off items as you prep in your kitchen:
                </p>

                <div className="space-y-2.5">
                  {recipe.ingredients.map((ing, idx) => {
                    const isChecked = checkedIngredients.has(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleIngredient(idx)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#FAF7F2] border-stone-200 opacity-60 line-through'
                            : 'bg-white border-[#E8E2D8] hover:border-[#D5CDC0]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                            isChecked
                              ? 'bg-[#0F472B] border-[#0F472B] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-xs sm:text-sm flex-1">
                          <span className="font-semibold text-[#2D2A26]">
                            {scaleQuantity(ing.quantity)}
                          </span>{' '}
                          <span className="text-[#5F5850]">{ing.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions Column */}
              <div className="md:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26]">
                    Cooking Instructions
                  </h3>
                  <span className="text-xs text-[#7B7368]">
                    {completedSteps.size} of {recipe.instructions.length} completed
                  </span>
                </div>

                <div className="space-y-3.5">
                  {recipe.instructions.map((step, idx) => {
                    const isDone = completedSteps.has(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-[#FAF7F2] border-stone-200 opacity-70'
                            : 'bg-white border-[#E8E2D8] hover:border-[#D5CDC0]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isDone
                              ? 'bg-[#0F472B] text-white'
                              : 'bg-[#EA580C]/15 text-[#EA580C]'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed flex-1 ${
                            isDone ? 'line-through text-stone-400' : 'text-[#3E3832]'
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:px-8 border-t border-[#E8E2D8] bg-[#FAF7F2] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(recipe._id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                favorited
                  ? 'bg-[#EA580C] text-white hover:bg-[#C2410C]'
                  : 'bg-white text-stone-700 border border-[#E8E2D8] hover:bg-stone-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
              <span>{favorited ? 'Saved in My RecipeNest' : 'Save to RecipeNest'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canModify && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(recipe);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D8] text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Edit Recipe</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(recipe);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2D2A26] text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
