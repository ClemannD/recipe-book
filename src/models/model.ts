import {
  type User,
  type Ingredient,
  type Recipe,
  type RecipeType,
  type Meal,
  type MealPlan,
} from '@prisma/client';

export type FullRecipe = Recipe & {
  recipeTypes: RecipeType[];
  ingredients: Ingredient[];
  createdBy: User;
};

export type FullMeal = Meal & {
  recipes: FullRecipe[];
};

export type FullMealPlan = MealPlan & {
  meals: FullMeal[];
};
