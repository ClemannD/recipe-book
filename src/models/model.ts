import {
  type User,
  type Ingredient,
  type Recipe,
  type RecipeType,
} from '@prisma/client';

export type FullRecipe = Recipe & {
  recipeTypes: RecipeType[];
  ingredients: Ingredient[];
  createdBy: User;
};
