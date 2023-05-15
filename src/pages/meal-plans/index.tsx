import Link from 'next/link';
import { useState } from 'react';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { Button } from '../../components/ui/button';
import { type FullRecipe } from '../../models/model';

const MealPlansPage = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <RecipesPageLayout
      isExpanded={selectedRecipe !== null}
      isFullScreen={false}
      leftChildren={
        <>
          <div className="mb-10 flex flex-col flex-wrap items-start justify-between gap-6 pt-16 md:flex-row md:items-end lg:pt-0">
            <div>
              <h1 className="text-2xl font-bold">Meal Plans</h1>
              <h2 className="mt-1 text-gray-600">
                Plan your meals for the week
              </h2>
            </div>
            <div className="flex w-full flex-col flex-wrap justify-end gap-4 lg:w-auto lg:flex-row">
              <Link href="/meal-plans/create">
                <Button>Create</Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* <MealPlanForm
              mealPlan={mealPlan}
              onAddMealClicked={addMeal}
              onRemoveMealClicked={removeMeal}
              onAddRecipeToMealClicked={(mealIndex: number) => {
                setSelectedMealIndex(mealIndex);
              }}
              onRemoveRecipeFromMealClicked={(
                mealIndex: number,
                recipeId: string
              ) => {
                setMealPlan((previousMealPlan) => ({
                  ...previousMealPlan,
                  meals: previousMealPlan.meals.map((meal, index) => {
                    if (index !== mealIndex) {
                      return meal;
                    }

                    return {
                      ...meal,
                      recipes: meal.recipes.filter(
                        (mealRecipe) => mealRecipe.id !== recipeId
                      ),
                    };
                  }),
                }));
              }}
            /> */}
          </div>
        </>
      }
      rightChildren={
        <RecipeDisplay
          recipe={selectedRecipe}
          isOnPublicPage={true}
          isFullscreen={isFullScreen}
          onClose={() => {
            setSelectedRecipe(null);
            setIsFullScreen(false);
          }}
          onFullscreenClick={() => setIsFullScreen(!isFullScreen)}
        />
      }
    ></RecipesPageLayout>
  );
};

export default MealPlansPage;
