import React from 'react';
import { Terminal, Heart } from 'lucide-react';
import { RecipeHubLogo } from './RecipeHubLogo.tsx';

interface FooterProps {
  onOpenPostmanGuide: () => void;
  onNavigate: (tab: 'home' | 'recipes' | 'favorites' | 'dashboard' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPostmanGuide, onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-[#E8E2D8] bg-[#FAF7F2] py-14 text-[#6E665C] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <RecipeHubLogo variant="full" size="md" />
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#2D2A26] transition-colors cursor-pointer"
            >
              Discover
            </button>
            <button
              onClick={() => onNavigate('recipes')}
              className="hover:text-[#2D2A26] transition-colors cursor-pointer"
            >
              All Recipes
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-[#2D2A26] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={onOpenPostmanGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D8] text-stone-700 hover:text-[#EA580C] transition-colors cursor-pointer font-medium"
            >
              <Terminal className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Postman API Test Suite</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E2D8]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} RecipeHub. Full-Stack MERN Recipe Platform.</p>
          <p className="flex items-center gap-1">
            Discover · Save · Cook — Handcrafted with love for food lovers and home chefs worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
