import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export const dashboardController = {
  // GET /api/dashboard/stats
  getStats: async (req: Request, res: Response) => {
    try {
      const allRecipes = await db.recipes.find();
      const totalRecipes = allRecipes.length;

      let userRecipeCount = 0;
      let userFavoritesCount = 0;
      let userRecipes: any[] = [];

      if (req.user) {
        userRecipes = allRecipes.filter((r) => {
          const authorId = typeof r.author === 'string' ? r.author : r.author._id;
          return authorId === req.user!.id;
        });
        userRecipeCount = userRecipes.length;
        userFavoritesCount = await db.favorites.countByUser(req.user.id);
      }

      // Recipe category distribution
      const categoryDistribution: Record<string, number> = {
        Breakfast: 0,
        Lunch: 0,
        Dinner: 0,
        Snacks: 0,
        Desserts: 0,
        Vegetarian: 0,
      };

      for (const recipe of allRecipes) {
        if (categoryDistribution[recipe.category] !== undefined) {
          categoryDistribution[recipe.category]++;
        } else {
          categoryDistribution[recipe.category] = 1;
        }
      }

      // Difficulty distribution
      const difficultyDistribution: Record<string, number> = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };
      for (const recipe of allRecipes) {
        if (difficultyDistribution[recipe.difficulty] !== undefined) {
          difficultyDistribution[recipe.difficulty]++;
        }
      }

      // Recently added recipes (top 5)
      const recentRecipes = [...allRecipes]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const totalUsers = await db.users.count();
      const totalPlatformFavorites = await db.favorites.count();

      res.json({
        success: true,
        stats: {
          totalRecipes,
          userRecipeCount,
          userFavoritesCount,
          totalUsers,
          totalPlatformFavorites,
          categoryDistribution,
          difficultyDistribution,
          recentRecipes,
          userRecentRecipes: userRecipes.slice(0, 5),
        },
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
    }
  },
};
