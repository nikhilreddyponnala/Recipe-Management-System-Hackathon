import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredientDoc {
  name: string;
  quantity: string;
}

export interface IRecipeDocument extends Document {
  title: string;
  description: string;
  ingredients: IIngredientDoc[];
  instructions: string[];
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Desserts' | 'Vegetarian';
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  imageUrl: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const RecipeSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    ingredients: {
      type: [IngredientSchema],
      required: [true, 'At least one ingredient is required'],
      validate: {
        validator: (v: IIngredientDoc[]) => Array.isArray(v) && v.length > 0,
        message: 'A recipe must contain at least one ingredient',
      },
    },
    instructions: {
      type: [String],
      required: [true, 'Cooking instructions are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'A recipe must contain at least one step instruction',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Vegetarian'],
    },
    preparationTime: {
      type: Number,
      required: [true, 'Preparation time in minutes is required'],
      min: [0, 'Preparation time must be positive'],
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time in minutes is required'],
      min: [0, 'Cooking time must be positive'],
    },
    servings: {
      type: Number,
      required: [true, 'Number of servings is required'],
      min: [1, 'Servings must be at least 1'],
      default: 2,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '/src/assets/images/hero_culinary_spread_1791610397373.jpg',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipe author reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance searches and filtering
RecipeSchema.index({ title: 'text', description: 'text', 'ingredients.name': 'text' });
RecipeSchema.index({ category: 1, difficulty: 1 });
RecipeSchema.index({ author: 1 });
RecipeSchema.index({ createdAt: -1 });

export const Recipe = mongoose.models.Recipe || mongoose.model<IRecipeDocument>('Recipe', RecipeSchema);
