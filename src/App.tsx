import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RecipesPage } from './pages/RecipesPage.tsx';
import { FavoritesPage } from './pages/FavoritesPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { RecipeDetailModal } from './components/RecipeDetailModal.tsx';
import { RecipeFormModal } from './components/RecipeFormModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PostmanGuideModal } from './components/PostmanGuideModal.tsx';
import { recipeService } from './services/api.ts';
import { Recipe } from './types/index.ts';

function MainApp() {
  const { user } = useAuth();
  const toast = useToast();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'recipes' | 'favorites' | 'dashboard' | 'admin'>('home');

  // Recipes state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  // Search & category from home page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [isPostmanGuideOpen, setIsPostmanGuideOpen] = useState(false);

  // Fetch all recipes from database
  const loadRecipes = useCallback(async () => {
    setIsLoadingRecipes(true);
    try {
      const res = await recipeService.getAll();
      if (res.success) {
        setRecipes(res.recipes);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setIsLoadingRecipes(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('recipes');
  };

  const handleOpenCreateRecipe = () => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      toast.info('Please sign in to publish a recipe.');
      return;
    }
    setRecipeToEdit(null);
    setIsRecipeFormOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsRecipeFormOpen(true);
  };

  const handleDeletePrompt = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
  };

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);
    try {
      await recipeService.delete(recipeToDelete._id);
      toast.success(`"${recipeToDelete.title}" has been deleted.`);
      setRecipeToDelete(null);
      if (selectedRecipe?._id === recipeToDelete._id) {
        setSelectedRecipe(null);
      }
      loadRecipes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete recipe.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecipeSaved = (saved: Recipe) => {
    loadRecipes();
    if (selectedRecipe && selectedRecipe._id === saved._id) {
      setSelectedRecipe(saved);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D2A26] font-sans selection:bg-[#E86A33]/20 selection:text-[#E86A33]">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateRecipe={handleOpenCreateRecipe}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            recipes={recipes}
            isLoading={isLoadingRecipes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSearchSubmit={handleSearchSubmit}
            onSelectRecipe={setSelectedRecipe}
            onOpenCreateRecipe={handleOpenCreateRecipe}
            onViewAllRecipes={() => setActiveTab('recipes')}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesPage
            recipes={recipes}
            isLoading={isLoadingRecipes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectRecipe={setSelectedRecipe}
            onOpenCreateRecipe={handleOpenCreateRecipe}
            onRecipeCreated={loadRecipes}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesPage
            onSelectRecipe={setSelectedRecipe}
            onExploreRecipes={() => setActiveTab('recipes')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onOpenCreateRecipe={handleOpenCreateRecipe}
            onEditRecipe={handleEditRecipe}
            onDeleteRecipe={handleDeletePrompt}
            onSelectRecipe={setSelectedRecipe}
            onExploreRecipes={() => setActiveTab('recipes')}
            onOpenPostmanGuide={() => setIsPostmanGuideOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPage
            onSelectRecipe={setSelectedRecipe}
            onDeleteRecipe={handleDeletePrompt}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPostmanGuide={() => setIsPostmanGuideOpen(true)}
        onNavigate={setActiveTab}
      />

      {/* Modals */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onEdit={handleEditRecipe}
        onDelete={handleDeletePrompt}
      />

      <RecipeFormModal
        isOpen={isRecipeFormOpen}
        onClose={() => setIsRecipeFormOpen(false)}
        onRecipeSaved={handleRecipeSaved}
        recipeToEdit={recipeToEdit}
      />

      <DeleteConfirmModal
        isOpen={!!recipeToDelete}
        title="Delete Recipe"
        message={`Are you sure you want to permanently delete "${recipeToDelete?.title}"? This action removes the recipe from the database and all user favorites.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecipeToDelete(null)}
        isDeleting={isDeleting}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <PostmanGuideModal
        isOpen={isPostmanGuideOpen}
        onClose={() => setIsPostmanGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
