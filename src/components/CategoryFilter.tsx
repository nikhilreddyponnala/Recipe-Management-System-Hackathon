import React from 'react';
import { Coffee, Utensils, Moon, Cookie, Cake, Salad, LayoutGrid } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    { id: 'All', label: 'All Recipes', icon: LayoutGrid },
    { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'Lunch', label: 'Lunch', icon: Utensils },
    { id: 'Dinner', label: 'Dinner', icon: Moon },
    { id: 'Snacks', label: 'Snacks', icon: Cookie },
    { id: 'Desserts', label: 'Desserts', icon: Cake },
    { id: 'Vegetarian', label: 'Vegetarian', icon: Salad },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 p-1.5 bg-[#F0EBE1] rounded-2xl w-max min-w-full sm:min-w-0 sm:mx-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#2D2A26] shadow-sm font-bold'
                  : 'text-[#6E665C] hover:text-[#2D2A26] hover:bg-white/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E86A33]' : 'text-stone-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
