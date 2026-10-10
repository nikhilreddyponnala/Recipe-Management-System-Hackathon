import { Router } from 'express';
import { adminController } from '../controllers/adminController.ts';
import { authenticate, authorizeAdmin } from '../middleware/auth.ts';

const router = Router();

// Protect all admin endpoints with both JWT auth and Admin role check
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', adminController.getUsers);
router.get('/recipes', adminController.getAllRecipes);
router.delete('/users/:id', adminController.deleteUser);

export default router;
