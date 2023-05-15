import Link from 'next/link';
import { useState } from 'react';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { Button } from '../../components/ui/button';
import { FullMealPlan, type FullRecipe } from '../../models/model';
import { api } from '../../utils/api';
import clsx from 'clsx';
import { useRouter } from 'next/router';

const MealPlansPage = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Data Fetching
  const { data: mealPlans, isLoading: isMealPlansLoading } =
    api.mealPlan.getMealPlans.useQuery();

  return (
    <RecipesPageLayout
      isExpanded={selectedRecipe !== null}
      isFullScreen={isFullScreen}
      leftChildren={
        <>
          <div className="mb-10 flex flex-col flex-wrap items-start justify-between gap-6 pt-16 md:flex-row md:items-end lg:pt-0">
            <div>
              <h1 className="text-2xl font-bold">Your Meal Plans</h1>
              <h2 className="mt-1 text-gray-600">
                Plan your meals for the week (This page is still a work in
                progress)
              </h2>
            </div>
            <div className="flex w-full flex-col flex-wrap justify-end gap-4 lg:w-auto lg:flex-row">
              <Link href="/meal-plans/create">
                <Button>Create</Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {mealPlans?.map((mealPlan) => (
              <MealPlanDisplay
                key={mealPlan.id}
                mealPlan={mealPlan}
                onRecipeClicked={(recipe) => setSelectedRecipe(recipe)}
              />
            ))}
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

const MealPlanDisplay = ({
  mealPlan,
  onRecipeClicked,
}: {
  mealPlan: FullMealPlan;
  onRecipeClicked: (recipe: FullRecipe) => void;
}) => {
  const router = useRouter();

  return (
    <div className="w-full border-b border-b-2 border-b-slate-300 pb-10">
      <div className="mb-4 flex justify-between gap-4">
        <h2 className="text-xl font-bold">{mealPlan.name}</h2>
        <div className="flex gap-4">
          <Link href={`/meal-plans/create/${mealPlan.id}`}>
            <Button variant="secondary">Edit</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {mealPlan.meals.map((meal, index) => (
          <div
            key={meal.id}
            className="flex min-h-[140px] min-w-full flex-1 flex-col rounded bg-white shadow lg:min-w-[450px]"
          >
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="text-lg font-bold">Meal {index + 1}</h3>
            </div>

            <div className="flex flex-grow flex-col">
              {meal.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="overflow-clip border-b last-of-type:rounded-bl last-of-type:border-none"
                  onClick={() => {
                    onRecipeClicked(recipe);
                  }}
                >
                  <MealRecipeItem recipe={recipe} />
                </div>
              ))}

              {
                //If there are no recipes in this meal, show a message
                meal.recipes.length === 0 && (
                  <div className="flex flex-grow items-center justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        void router.push(`/meal-plans/create/${mealPlan.id}`);
                      }}
                    >
                      Click to add recipes for this meal
                    </Button>
                  </div>
                )
              }
            </div>
          </div>
        ))}

        {/* Hack because I want flex wrap but with all elements to maintain their size */}
        <div className="h-1 flex-1 lg:min-w-[450px]"></div>
        <div className="h-1 flex-1 lg:min-w-[450px]"></div>
      </div>
    </div>
  );
};

const MealRecipeItem = ({ recipe }: { recipe: FullRecipe }) => {
  return (
    <div
      className={clsx(
        'flex max-h-[80px] min-h-[80px] flex-1 cursor-pointer overflow-clip  transition-all ease-in-out  hover:bg-slate-100'
      )}
    >
      <img
        className="h-auto w-[100px] min-w-[100px]  object-cover"
        src={recipe.imageUrl ?? '/empty-bowl.jpg'}
        alt={recipe.name}
      />
      <div className="flex w-full flex-col p-2">
        <h3 className="mb-1 text-sm font-bold">{recipe.name}</h3>

        <div className="flex flex-wrap gap-2">
          {recipe.recipeTypes.map((recipeType) => (
            <div
              className="flex h-4 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-[10px] tracking-wide  "
              key={recipeType.id + recipeType.name + recipeType.icon}
            >
              {recipeType.icon}{' '}
              <span className="ml-2 text-[10px] font-medium">
                {recipeType.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
