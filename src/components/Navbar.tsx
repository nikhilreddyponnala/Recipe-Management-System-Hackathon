import React, { useState } from 'react';
import { Plus, Heart, LayoutDashboard, ShieldCheck, LogOut, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { RecipeHubLogo } from './RecipeHubLogo.tsx';

interface NavbarProps {
  activeTab: 'home' | 'recipes' | 'favorites' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'home' | 'recipes' | 'favorites' | 'dashboard' | 'admin') => void;
  onOpenCreateRecipe: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateRecipe,
  onOpenAuth,
  searchQuery = '',
  setSearchQuery,
  onSearchSubmit,
}) => {
  const { user, isAuthenticated, isAdmin, logout, favoriteIds } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else {
      setActiveTab('recipes');
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Brand Wordmark & Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center group text-left cursor-pointer focus:outline-none shrink-0"
        >
          <RecipeHubLogo variant="compact" size="md" />
        </button>

        {/* Zone 2: Global Instant Search Bar */}
        {setSearchQuery && (
          <form
            onSubmit={handleHeaderSearch}
            className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
          >
            <div className="relative w-full flex items-center bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D4C8B8] focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all shadow-xs">
              <Search className="w-4 h-4 text-stone-400 ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all recipes, foods, ingredients..."
                className="w-full px-2.5 py-2 text-xs text-[#2D2A26] placeholder-stone-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-1 text-stone-400 hover:text-stone-600 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="mr-1.5 px-2.5 py-1 text-[11px] font-semibold bg-[#EA580C] text-white rounded-lg hover:bg-[#C2410C] transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </form>
        )}

        {/* Zone 3: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#5F5850]">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#2D2A26] cursor-pointer pb-1 ${
              activeTab === 'home'
                ? 'text-[#2D2A26] font-semibold border-b-2 border-[#EA580C]'
                : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`whitespace-nowrap transition-colors hover:text-[#2D2A26] cursor-pointer pb-1 ${
              activeTab === 'recipes'
                ? 'text-[#2D2A26] font-semibold border-b-2 border-[#EA580C]'
                : ''
            }`}
          >
            All Recipes
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth('login');
              } else {
                setActiveTab('favorites');
              }
            }}
            className={`whitespace-nowrap flex items-center gap-1.5 transition-colors hover:text-[#2D2A26] cursor-pointer pb-1 ${
              activeTab === 'favorites'
                ? 'text-[#2D2A26] font-semibold border-b-2 border-[#EA580C]'
                : ''
            }`}
          >
            <span>Favorites</span>
            {isAuthenticated && favoriteIds.size > 0 && (
              <span className="text-xs font-mono tabular-nums bg-[#EA580C]/15 text-[#EA580C] px-1.5 py-0.2 rounded-full font-bold">
                {favoriteIds.size}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth('login');
              } else {
                setActiveTab('dashboard');
              }
            }}
            className={`whitespace-nowrap transition-colors hover:text-[#2D2A26] cursor-pointer pb-1 ${
              activeTab === 'dashboard'
                ? 'text-[#2D2A26] font-semibold border-b-2 border-[#EA580C]'
                : ''
            }`}
          >
            Dashboard
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap flex items-center gap-1.5 transition-colors hover:text-[#0F472B] cursor-pointer pb-1 ${
                activeTab === 'admin'
                  ? 'text-[#0F472B] font-semibold border-b-2 border-[#0F472B]'
                  : 'text-[#0F472B]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 4: Right Actions & Mobile Search Icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile search toggle */}
          {setSearchQuery && (
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-lg border border-[#E8E2D8] bg-white text-stone-600 hover:text-[#EA580C] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCreateRecipe}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Share Recipe</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-[#E8E2D8] bg-white hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-md bg-[#0F472B]/10 text-[#0F472B] flex items-center justify-center font-bold text-xs">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-[#2D2A26] max-w-[110px] truncate hidden sm:inline">
                    {user?.name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8E2D8] py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-[#F0EBE1]">
                      <p className="font-semibold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-stone-500 truncate">{user?.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#0F472B] font-bold">
                        <span>Role:</span>
                        <span className="capitalize">{user?.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenCreateRecipe();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] flex items-center gap-2 text-stone-700 cursor-pointer sm:hidden"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#EA580C]" />
                      Share Recipe
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] flex items-center gap-2 text-stone-700 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('favorites');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] flex items-center gap-2 text-stone-700 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-stone-500" />
                      My Favorites ({favoriteIds.size})
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] flex items-center gap-2 text-[#0F472B] cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Console
                      </button>
                    )}

                    <div className="border-t border-[#F0EBE1] my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {isMobileSearchOpen && setSearchQuery && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E8E2D8] bg-[#FAF7F2]">
          <form onSubmit={handleHeaderSearch} className="flex items-center gap-2">
            <div className="relative w-full flex items-center bg-white rounded-xl border border-[#E8E2D8] px-3 py-1.5 shadow-2xs">
              <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes or dishes..."
                className="w-full text-xs text-[#2D2A26] bg-transparent focus:outline-none"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-xl shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
