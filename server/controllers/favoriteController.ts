import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export const favoriteController = {
  // GET /api/favorites
  getFavorites: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const favorites = await db.favorites.findForUser(req.user.id);

      res.json({
        success: true,
        count: favorites.length,
        favorites,
      });
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve favorites.' });
    }
  },

  // POST /api/favorites/:recipeId
  addFavorite: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { recipeId } = req.params;
      const recipe = await db.recipes.findById(recipeId);

      if (!recipe) {
        res.status(404).json({ success: false, message: 'Recipe not found.' });
        return;
      }

      const favorite = await db.favorites.add(req.user.id, recipeId);

      res.status(201).json({
        success: true,
        message: 'Recipe added to your favorites!',
        favorite,
        recipeId,
      });
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ success: false, message: 'Failed to add recipe to favorites.' });
    }
  },

  // DELETE /api/favorites/:recipeId
  removeFavorite: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { recipeId } = req.params;
      await db.favorites.remove(req.user.id, recipeId);

      res.json({
        success: true,
        message: 'Recipe removed from favorites.',
        recipeId,
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ success: false, message: 'Failed to remove favorite.' });
    }
  },

  // GET /api/favorites/:recipeId/status
  checkStatus: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.json({ success: true, isFavorite: false });
        return;
      }

      const { recipeId } = req.params;
      const isFavorite = await db.favorites.isFavorite(req.user.id, recipeId);

      res.json({
        success: true,
        isFavorite,
      });
    } catch (error: any) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({ success: false, message: 'Failed to check status.' });
    }
  },
};
