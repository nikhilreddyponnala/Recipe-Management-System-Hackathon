import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.ts';
import { generateToken } from '../middleware/auth.ts';

export const authController = {
  // POST /api/auth/register
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Full name is required (minimum 2 characters).',
        });
        return;
      }

      if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        res.status(400).json({
          success: false,
          message: 'A valid email address is required.',
        });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await db.users.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address is already registered.',
        });
        return;
      }

      // Hash password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Default role is 'user', unless explicitly 'admin' requested during setup/demo
      const assignedRole = role === 'admin' ? 'admin' : 'user';

      const newUser = await db.users.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
      });

      const token = generateToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      });

      res.status(201).json({
        success: true,
        message: 'Account successfully created!',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration. Please try again.',
      });
    }
  },

  // POST /api/auth/login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide both email and password.',
        });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await db.users.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
        return;
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.json({
        success: true,
        message: 'Welcome back!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login. Please try again.',
      });
    }
  },

  // GET /api/auth/me or GET /api/users/me
  getMe: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const user = await db.users.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      // Count recipes authored by user and favorites
      const userRecipes = await db.recipes.find({ author: user._id });
      const favoriteIds = await db.favorites.getUserFavoriteIds(user._id);

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          recipeCount: userRecipes.length,
          favoriteCount: favoriteIds.length,
          favoriteRecipeIds: favoriteIds,
        },
      });
    } catch (error: any) {
      console.error('getMe error:', error);
      res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
    }
  },
};
