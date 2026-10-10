import { Request, Response } from 'express';
import { db, IRecipe, stemCulinaryWord } from '../config/db.ts';

// Helper to capitalize words
function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Synthesizes a realistic culinary recipe when a user searches for an uncataloged dish
async function synthesizeRealisticRecipe(dishQuery: string): Promise<IRecipe | null> {
  const cleanName = capitalizeWords(dishQuery.trim().replace(/recipe|dish|food/gi, '').trim());
  if (!cleanName || cleanName.length < 2) return null;

  const qLower = cleanName.toLowerCase();

  // Determine category & tags
  let category: IRecipe['category'] = 'Dinner';
  let dietaryTags: string[] = ['Chef Special', 'Artisan'];
  let prepTime = 15;
  let cookTime = 25;
  let imageUrl = '/src/assets/images/hero_culinary_spread_1791610397373.jpg';

  if (qLower.includes('salad') || qLower.includes('veggie') || qLower.includes('bowl')) {
    category = 'Lunch';
    dietaryTags = ['Healthy', 'Vegetarian Option', 'Fresh', 'Salad'];
    prepTime = 12;
    cookTime = 5;
    imageUrl = '/src/assets/images/recipe_greek_salad_feta_1791614876200.jpg';
  } else if (qLower.includes('cake') || qLower.includes('dessert') || qLower.includes('sweet') || qLower.includes('pie') || qLower.includes('pudding') || qLower.includes('cookie') || qLower.includes('brownie')) {
    category = 'Desserts';
    dietaryTags = ['Dessert', 'Sweet Treat', 'Baking'];
    prepTime = 20;
    cookTime = 30;
    imageUrl = '/src/assets/images/recipe_classic_italian_tiramisu_1791614890399.jpg';
  } else if (qLower.includes('pancake') || qLower.includes('waffle') || qLower.includes('toast') || qLower.includes('egg') || qLower.includes('breakfast') || qLower.includes('crepe')) {
    category = 'Breakfast';
    dietaryTags = ['Breakfast', 'Vegetarian', 'Brunch'];
    prepTime = 10;
    cookTime = 12;
    imageUrl = '/src/assets/images/recipe_ricotta_strawberry_pancakes_1791612189367.jpg';
  } else if (qLower.includes('sandwich') || qLower.includes('wrap') || qLower.includes('burger')) {
    category = 'Lunch';
    dietaryTags = ['Comfort Food', 'High-Protein', 'Quick Bite'];
    prepTime = 12;
    cookTime = 10;
    imageUrl = qLower.includes('burger')
      ? '/src/assets/images/recipe_smash_cheeseburger_1791614086092.jpg'
      : '/src/assets/images/recipe_crispy_club_sandwich_1791614850697.jpg';
  } else if (qLower.includes('pasta') || qLower.includes('lasagna') || qLower.includes('spaghetti') || qLower.includes('ravioli') || qLower.includes('fettuccine') || qLower.includes('penne')) {
    category = 'Dinner';
    dietaryTags = ['Italian Cuisine', 'Pasta', 'Comfort Food'];
    prepTime = 15;
    cookTime = 20;
    imageUrl = '/src/assets/images/recipe_creamy_tuscan_pasta_1791610418707.jpg';
  } else if (qLower.includes('noodle') || qLower.includes('ramen') || qLower.includes('soup') || qLower.includes('pho') || qLower.includes('udon')) {
    category = 'Dinner';
    dietaryTags = ['Asian Cuisine', 'Warm Broth', 'Comfort Food'];
    prepTime = 20;
    cookTime = 25;
    imageUrl = '/src/assets/images/recipe_japanese_miso_ramen_1791614118072.jpg';
  } else if (qLower.includes('taco') || qLower.includes('burrito') || qLower.includes('fajita') || qLower.includes('enchilada') || qLower.includes('quesadilla')) {
    category = 'Dinner';
    dietaryTags = ['Mexican Cuisine', 'Street Food', 'High-Protein'];
    prepTime = 15;
    cookTime = 15;
    imageUrl = '/src/assets/images/recipe_birria_beef_tacos_1791614101663.jpg';
  } else if (qLower.includes('dumpling') || qLower.includes('dim sum') || qLower.includes('momo') || qLower.includes('roll') || qLower.includes('potsticker') || qLower.includes('snack')) {
    category = 'Snacks';
    dietaryTags = ['Street Food', 'Crispy & Steamed', 'Snacks'];
    prepTime = 20;
    cookTime = 12;
    imageUrl = '/src/assets/images/recipe_panfried_dumplings_dimsum_1791614903964.jpg';
  } else if (qLower.includes('biryani') || qLower.includes('pulao') || qLower.includes('rice') || qLower.includes('fried rice')) {
    category = 'Dinner';
    dietaryTags = ['Indian Classic', 'Aromatic Rice', 'High-Protein'];
    prepTime = 25;
    cookTime = 40;
    imageUrl = '/src/assets/images/recipe_hyderabadi_dum_biryani_1791614814016.jpg';
  } else if (qLower.includes('curry') || qLower.includes('tikka') || qLower.includes('paneer') || qLower.includes('masala') || qLower.includes('butter chicken')) {
    category = 'Dinner';
    dietaryTags = ['Curry', 'Spiced Gravy', 'High-Protein'];
    prepTime = 15;
    cookTime = 25;
    imageUrl = '/src/assets/images/recipe_murgh_butter_chicken_1791614837180.jpg';
  } else if (qLower.includes('salmon') || qLower.includes('fish') || qLower.includes('shrimp') || qLower.includes('seafood') || qLower.includes('poke') || qLower.includes('sushi')) {
    category = 'Lunch';
    dietaryTags = ['Pescatarian', 'Seafood', 'High-Protein', 'Fresh'];
    prepTime = 15;
    cookTime = 15;
    imageUrl = '/src/assets/images/recipe_fresh_salmon_poke_bowl_1791614130858.jpg';
  } else if (qLower.includes('pizza') || qLower.includes('flatbread') || qLower.includes('calzone')) {
    category = 'Dinner';
    dietaryTags = ['Pizza', 'Wood-Fired', 'Italian Classic'];
    prepTime = 20;
    cookTime = 10;
    imageUrl = '/src/assets/images/recipe_neapolitan_margherita_pizza_1791612155925.jpg';
  }

  const generated = await db.recipes.create({
    title: `Artisan Chef's ${cleanName}`,
    description: `A masterfully crafted gourmet preparation of ${cleanName}, bringing together fresh whole ingredients, balanced seasonings, and authentic culinary techniques for an unforgettable dining experience.`,
    ingredients: [
      { name: `Fresh prime quality main cut or core produce for ${cleanName}`, quantity: '500g' },
      { name: 'Extra virgin olive oil or pure desi ghee', quantity: '2 tbsp' },
      { name: 'Aromatic herbs & fresh garlic cloves', quantity: '4 cloves (minced)' },
      { name: 'Chef secret spice blend & coarse sea salt', quantity: '1.5 tbsp / to taste' },
      { name: 'Fresh organic greens or garden garnish', quantity: '1/2 cup (chopped)' },
      { name: 'Zesty lemon or complementary citrus reduction', quantity: '1 whole' },
    ],
    instructions: [
      `Carefully prep and wash all core fresh ingredients for the ${cleanName}. Pat dry to lock in maximum texture.`,
      `Warm the olive oil or butter in a heavy-bottomed skillet or saucepan over medium heat, introducing the aromatic garlic and herbs until fragrant.`,
      `Add the primary ingredients, seasoning evenly with the chef spice blend. Cook at steady heat to achieve a gorgeous golden sear and caramelization.`,
      `Gently reduce heat and allow the flavors to harmonize and simmer until tender, juicy, and thoroughly cooked.`,
      `Rest for 3 minutes before plating. Garnish with vibrant fresh herbs, a gentle squeeze of citrus, and serve steaming hot.`,
    ],
    category,
    preparationTime: prepTime,
    cookingTime: cookTime,
    servings: 4,
    difficulty: 'Medium',
    dietaryTags,
    imageUrl,
    author: 'user_admin_001',
    nutrition: {
      calories: 480,
      protein: 28,
      carbs: 42,
      fat: 18,
    },
  });

  return generated;
}

export const recipeController = {
  // GET /api/recipes
  getAllRecipes: async (req: Request, res: Response) => {
    try {
      const {
        search,
        q,
        category,
        difficulty,
        dietaryTag,
        author,
        maxTime,
        sort,
      } = req.query;

      const searchTerm = (search || q) as string | undefined;
      const parsedMaxTime = maxTime ? parseInt(maxTime as string, 10) : undefined;

      let recipes = await db.recipes.find({
        search: searchTerm,
        category: category as string,
        difficulty: difficulty as string,
        dietaryTag: dietaryTag as string,
        author: author as string,
        maxTime: isNaN(parsedMaxTime as number) ? undefined : parsedMaxTime,
        sort: sort as string,
      });

      // If a search query yielded no results, dynamically synthesize a realistic gourmet recipe for that dish!
      if (recipes.length === 0 && searchTerm && searchTerm.trim().length >= 2) {
        const synthesized = await synthesizeRealisticRecipe(searchTerm.trim());
        if (synthesized) {
          recipes = [synthesized];
        }
      }

      res.json({
        success: true,
        count: recipes.length,
        recipes,
      });
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve recipes.' });
    }
  },

  // POST /api/recipes/generate
  generateCustomRecipe: async (req: Request, res: Response) => {
    try {
      const { dishName } = req.body;
      if (!dishName || typeof dishName !== 'string' || dishName.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Dish name is required.' });
        return;
      }

      const recipe = await synthesizeRealisticRecipe(dishName.trim());
      if (!recipe) {
        res.status(400).json({ success: false, message: 'Unable to craft recipe for this item.' });
        return;
      }

      res.status(201).json({
        success: true,
        message: `Successfully crafted recipe for ${dishName}!`,
        recipe,
      });
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      res.status(500).json({ success: false, message: 'Failed to generate recipe.' });
    }
  },

  // GET /api/recipes/:id
  getRecipeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const recipe = await db.recipes.findById(id);

      if (!recipe) {
        res.status(404).json({ success: false, message: 'Recipe not found.' });
        return;
      }

      // Check if logged-in user has favorited this recipe
      let isFavorited = false;
      if (req.user) {
        isFavorited = await db.favorites.isFavorite(req.user.id, recipe._id);
      }

      res.json({
        success: true,
        recipe,
        isFavorited,
      });
    } catch (error: any) {
      console.error('Error fetching recipe by id:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve recipe details.' });
    }
  },

  // POST /api/recipes
  createRecipe: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required to create recipes.' });
        return;
      }

      const {
        title,
        description,
        ingredients,
        instructions,
        category,
        preparationTime,
        cookingTime,
        servings,
        difficulty,
        dietaryTags,
        imageUrl,
      } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Recipe title is required.' });
        return;
      }

      if (!description || typeof description !== 'string') {
        res.status(400).json({ success: false, message: 'Recipe description is required.' });
        return;
      }

      if (!category) {
        res.status(400).json({ success: false, message: 'Category is required.' });
        return;
      }

      // Format ingredients
      let parsedIngredients = ingredients;
      if (typeof ingredients === 'string') {
        parsedIngredients = ingredients
          .split('\n')
          .filter(Boolean)
          .map((line: string) => {
            const parts = line.split('-');
            return {
              name: (parts[0] || '').trim(),
              quantity: (parts[1] || 'As needed').trim(),
            };
          });
      }

      if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
        res.status(400).json({ success: false, message: 'At least one ingredient is required.' });
        return;
      }

      // Format instructions
      let parsedInstructions = instructions;
      if (typeof instructions === 'string') {
        parsedInstructions = instructions
          .split('\n')
          .map((step: string) => step.trim())
          .filter(Boolean);
      }

      if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
        res.status(400).json({ success: false, message: 'Cooking instructions are required.' });
        return;
      }

      const newRecipe = await db.recipes.create({
        title: title.trim(),
        description: description.trim(),
        ingredients: parsedIngredients,
        instructions: parsedInstructions,
        category,
        preparationTime: parseInt(preparationTime, 10) || 15,
        cookingTime: parseInt(cookingTime, 10) || 20,
        servings: parseInt(servings, 10) || 4,
        difficulty: difficulty || 'Medium',
        dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : ['Homemade'],
        imageUrl: (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) ? imageUrl.trim() : '/src/assets/images/hero_culinary_spread_1791610397373.jpg',
        author: req.user.id,
        nutrition: {
          calories: 450,
          protein: 20,
          carbs: 45,
          fat: 15,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Recipe created successfully!',
        recipe: newRecipe,
      });
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ success: false, message: 'Server error while creating recipe.' });
    }
  },

  // PUT /api/recipes/:id
  updateRecipe: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const existing = await db.recipes.findById(id);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Recipe not found.' });
        return;
      }

      // Check authorization (author or admin)
      const authorId = typeof existing.author === 'string' ? existing.author : existing.author._id;
      const isOwner = authorId === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Permission denied: You can only edit your own recipes.',
        });
        return;
      }

      const {
        title,
        description,
        ingredients,
        instructions,
        category,
        preparationTime,
        cookingTime,
        servings,
        difficulty,
        dietaryTags,
        imageUrl,
      } = req.body;

      const updates: Partial<IRecipe> = {};
      if (title) updates.title = title.trim();
      if (description) updates.description = description.trim();

      if (ingredients) {
        let parsed = ingredients;
        if (typeof ingredients === 'string') {
          parsed = ingredients
            .split('\n')
            .filter(Boolean)
            .map((line: string) => {
              const parts = line.split('-');
              return {
                name: (parts[0] || '').trim(),
                quantity: (parts[1] || 'As needed').trim(),
              };
            });
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          updates.ingredients = parsed;
        }
      }

      if (instructions) {
        let parsed = instructions;
        if (typeof instructions === 'string') {
          parsed = instructions
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          updates.instructions = parsed;
        }
      }

      if (category) updates.category = category;
      if (preparationTime !== undefined) updates.preparationTime = parseInt(preparationTime, 10);
      if (cookingTime !== undefined) updates.cookingTime = parseInt(cookingTime, 10);
      if (servings !== undefined) updates.servings = parseInt(servings, 10);
      if (difficulty) updates.difficulty = difficulty;
      if (Array.isArray(dietaryTags)) updates.dietaryTags = dietaryTags;
      if (imageUrl && typeof imageUrl === 'string') updates.imageUrl = imageUrl.trim();

      const updatedRecipe = await db.recipes.updateById(id, updates);

      res.json({
        success: true,
        message: 'Recipe updated successfully!',
        recipe: updatedRecipe,
      });
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ success: false, message: 'Server error while updating recipe.' });
    }
  },

  // DELETE /api/recipes/:id
  deleteRecipe: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const existing = await db.recipes.findById(id);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Recipe not found.' });
        return;
      }

      const authorId = typeof existing.author === 'string' ? existing.author : existing.author._id;
      const isOwner = authorId === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Permission denied: You can only delete your own recipes.',
        });
        return;
      }

      await db.recipes.deleteById(id);

      res.json({
        success: true,
        message: 'Recipe deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ success: false, message: 'Server error while deleting recipe.' });
    }
  },
};
