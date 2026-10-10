import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export const adminController = {
  // GET /api/admin/users
  getUsers: async (req: Request, res: Response) => {
    try {
      const allUsers = await db.users.find();
      const allRecipes = await db.recipes.find();

      // Augment user objects with recipe count, excluding sensitive password hash
      const userList = allUsers.map((u) => {
        const authoredCount = allRecipes.filter((r) => {
          const authorId = typeof r.author === 'string' ? r.author : r.author._id;
          return authorId === u._id;
        }).length;

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          recipeCount: authoredCount,
        };
      });

      res.json({
        success: true,
        count: userList.length,
        users: userList,
      });
    } catch (error: any) {
      console.error('Admin getUsers error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve user accounts.' });
    }
  },

  // GET /api/admin/recipes
  getAllRecipes: async (req: Request, res: Response) => {
    try {
      const recipes = await db.recipes.find();
      res.json({
        success: true,
        count: recipes.length,
        recipes,
      });
    } catch (error: any) {
      console.error('Admin getAllRecipes error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve admin recipes.' });
    }
  },

  // DELETE /api/admin/users/:id
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (id === req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Admins cannot delete their own active account.',
        });
        return;
      }

      const user = await db.users.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      await db.users.deleteById(id);

      res.json({
        success: true,
        message: `User account '${user.name}' and all their recipes were removed successfully.`,
      });
    } catch (error: any) {
      console.error('Admin deleteUser error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user account.' });
    }
  },
};
