import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoriteDocument extends Document {
  user: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring a user cannot favorite the same recipe multiple times
FavoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });
FavoriteSchema.index({ user: 1 });
FavoriteSchema.index({ recipe: 1 });

export const Favorite = mongoose.models.Favorite || mongoose.model<IFavoriteDocument>('Favorite', FavoriteSchema);
