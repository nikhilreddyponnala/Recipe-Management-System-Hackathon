import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image, ChefHat, Sparkles } from 'lucide-react';
import { Recipe, Ingredient } from '../types/index.ts';
import { recipeService } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved: (savedRecipe: Recipe) => void;
  recipeToEdit?: Recipe | null;
}

const PRESET_IMAGES = [
  { label: 'Wood-Fired Neapolitan Pizza', url: '/src/assets/images/recipe_neapolitan_margherita_pizza_1791612155925.jpg' },
  { label: 'Skillet Roasted Herb Chicken', url: '/src/assets/images/recipe_roasted_herb_chicken_1791612167649.jpg' },
  { label: 'Thai Green Coconut Curry', url: '/src/assets/images/recipe_thai_green_coconut_curry_1791612179711.jpg' },
  { label: 'Ricotta Strawberry Pancakes', url: '/src/assets/images/recipe_ricotta_strawberry_pancakes_1791612189367.jpg' },
  { label: 'Tuscan Creamy Fettuccine', url: '/src/assets/images/recipe_creamy_tuscan_pasta_1791610418707.jpg' },
  { label: 'Poached Egg Avocado Sourdough', url: '/src/assets/images/recipe_avocado_toast_egg_1791610430848.jpg' },
  { label: 'Wild Berry Chia Parfait', url: '/src/assets/images/recipe_berry_parfait_dessert_1791610441672.jpg' },
  { label: 'Mediterranean Summer Harvest', url: '/src/assets/images/hero_culinary_spread_1791610397373.jpg' },
];

const AVAILABLE_DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'High-Protein',
  'Low-Carb',
  'Keto',
  'Nut-Free',
];

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  onClose,
  onRecipeSaved,
  recipeToEdit,
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Recipe['category']>('Dinner');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('Easy');
  const [preparationTime, setPreparationTime] = useState<number>(15);
  const [cookingTime, setCookingTime] = useState<number>(20);
  const [servings, setServings] = useState<number>(4);
  const [imageUrl, setImageUrl] = useState('/src/assets/images/recipe_creamy_tuscan_pasta_1791610418707.jpg');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '' },
    { name: '', quantity: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['', '']);

  useEffect(() => {
    if (recipeToEdit) {
      setTitle(recipeToEdit.title);
      setDescription(recipeToEdit.description);
      setCategory(recipeToEdit.category);
      setDifficulty(recipeToEdit.difficulty);
      setPreparationTime(recipeToEdit.preparationTime);
      setCookingTime(recipeToEdit.cookingTime);
      setServings(recipeToEdit.servings);
      setImageUrl(recipeToEdit.imageUrl || PRESET_IMAGES[0].url);
      setDietaryTags(recipeToEdit.dietaryTags || []);
      setIngredients(
        recipeToEdit.ingredients && recipeToEdit.ingredients.length > 0
          ? recipeToEdit.ingredients
          : [{ name: '', quantity: '' }]
      );
      setInstructions(
        recipeToEdit.instructions && recipeToEdit.instructions.length > 0
          ? recipeToEdit.instructions
          : ['']
      );
    } else {
      // Defaults for new recipe
      setTitle('');
      setDescription('');
      setCategory('Dinner');
      setDifficulty('Easy');
      setPreparationTime(15);
      setCookingTime(20);
      setServings(4);
      setImageUrl(PRESET_IMAGES[0].url);
      setDietaryTags(['Vegetarian']);
      setIngredients([
        { name: 'Olive oil', quantity: '2 tbsp' },
        { name: 'Fresh garlic', quantity: '3 cloves' },
      ]);
      setInstructions([
        'Heat olive oil in a pan over medium heat and sauté minced garlic until fragrant.',
        'Add ingredients and simmer gently until thoroughly cooked.',
      ]);
    }
  }, [recipeToEdit, isOpen]);

  if (!isOpen) return null;

  // Ingredients handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Instructions handlers
  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  // Dietary tags toggle
  const toggleDietaryTag = (tag: string) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Recipe title is required.');
      return;
    }

    if (!description.trim()) {
      toast.error('Recipe description is required.');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim().length > 0);
    if (validIngredients.length === 0) {
      toast.error('Please enter at least one ingredient.');
      return;
    }

    const validInstructions = instructions.filter((inst) => inst.trim().length > 0);
    if (validInstructions.length === 0) {
      toast.error('Please enter at least one cooking instruction step.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<Recipe> = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        preparationTime: Number(preparationTime),
        cookingTime: Number(cookingTime),
        servings: Number(servings),
        imageUrl: imageUrl.trim(),
        dietaryTags,
        ingredients: validIngredients,
        instructions: validInstructions,
      };

      if (recipeToEdit) {
        const res = await recipeService.update(recipeToEdit._id, payload);
        toast.success('Recipe updated successfully!');
        onRecipeSaved(res.recipe);
      } else {
        const res = await recipeService.create(payload);
        toast.success('Recipe published to RecipeHub!');
        onRecipeSaved(res.recipe);
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save recipe.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col my-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D8] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E86A33]/15 text-[#E86A33] flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26]">
                {recipeToEdit ? 'Edit Recipe' : 'Add New Recipe'}
              </h2>
              <p className="text-xs text-[#7B7368]">
                {recipeToEdit ? 'Update recipe details in MongoDB' : 'Publish your culinary creation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8E2D8] text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#5F5850] mb-1.5">
                Recipe Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Creamy Tuscan Sun-Dried Tomato Fettuccine"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-sm focus:outline-none focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F5850] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Recipe['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-sm bg-white focus:outline-none focus:border-[#E86A33]"
              >
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Vegetarian'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#5F5850] mb-1.5">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A short overview of what makes this recipe special, flavor notes, texture..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D8] text-sm focus:outline-none focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/15"
            />
          </div>

          {/* Times, Servings, Difficulty */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D8]">
            <div>
              <label className="block text-[11px] font-semibold text-[#7B7368] mb-1">
                Prep Time (mins)
              </label>
              <input
                type="number"
                min="0"
                value={preparationTime}
                onChange={(e) => setPreparationTime(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E8E2D8] text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7B7368] mb-1">
                Cook Time (mins)
              </label>
              <input
                type="number"
                min="0"
                value={cookingTime}
                onChange={(e) => setCookingTime(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E8E2D8] text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7B7368] mb-1">
                Servings
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E8E2D8] text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7B7368] mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Recipe['difficulty'])}
                className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#E8E2D8] text-sm font-semibold"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#5F5850] mb-2 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-[#E86A33]" />
              <span>Recipe Food Image</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.url}
                  onClick={() => setImageUrl(preset.url)}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer ${
                    imageUrl === preset.url
                      ? 'border-[#E86A33] ring-2 ring-[#E86A33]/20'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or enter image URL..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2D8]"
            />
          </div>

          {/* Ingredients Section */}
          <div className="pt-2 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#2D2A26]">Ingredients *</h4>
                <p className="text-[11px] text-[#7B7368]">Specify quantity and ingredient name</p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2E7D32] bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Ingredient
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                    placeholder="e.g. 2 cups / 200g"
                    className="w-1/3 px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] focus:border-[#E86A33]"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    placeholder="Ingredient name (e.g. Baby spinach)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] focus:border-[#E86A33]"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Instructions Section */}
          <div className="pt-2 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#2D2A26]">Cooking Instructions *</h4>
                <p className="text-[11px] text-[#7B7368]">Step-by-step guidance for the cook</p>
              </div>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2E7D32] bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Step
              </button>
            </div>

            <div className="space-y-2.5">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E86A33]/15 text-[#E86A33] text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">
                    {idx + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    rows={2}
                    placeholder={`Step ${idx + 1} instructions...`}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] focus:border-[#E86A33]"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(idx)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors mt-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="pt-2 border-t border-[#E8E2D8]">
            <label className="block text-xs font-semibold text-[#5F5850] mb-2">
              Dietary Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_DIETARY_TAGS.map((tag) => {
                const isSelected = dietaryTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleDietaryTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E7D32] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#E86A33] hover:bg-[#D45924] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Recipe...' : recipeToEdit ? 'Save Changes' : 'Publish Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
