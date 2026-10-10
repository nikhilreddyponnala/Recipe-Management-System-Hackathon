import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.post('/:recipeId', favoriteController.addFavorite);
router.delete('/:recipeId', favoriteController.removeFavorite);
router.get('/:recipeId/status', favoriteController.checkStatus);

export default router;
