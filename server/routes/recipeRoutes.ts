import { Router, Request, Response, NextFunction } from 'express';
import { recipeController } from '../controllers/recipeController.ts';
import { authenticate } from '../middleware/auth.ts';
import jwt from 'jsonwebtoken';
import { AuthUserPayload } from '../middleware/auth.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'recipehub_super_secret_jwt_key_2026_dev_seed';

// Optional auth middleware so public visitors can view recipes while logged-in users get their favorite state
function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignore token failure for public routes
    }
  }
  next();
}

router.get('/', optionalAuthenticate, recipeController.getAllRecipes);
router.post('/generate', optionalAuthenticate, recipeController.generateCustomRecipe);
router.get('/:id', optionalAuthenticate, recipeController.getRecipeById);
router.post('/', authenticate, recipeController.createRecipe);
router.put('/:id', authenticate, recipeController.updateRecipe);
router.delete('/:id', authenticate, recipeController.deleteRecipe);

export default router;
