import React from 'react';
import { RecipeHubLogo } from './RecipeHubLogo.tsx';

// Backward compatibility alias for RecipeHub
export const RecipeNestLogo: React.FC<any> = (props) => {
  return <RecipeHubLogo {...props} />;
};
