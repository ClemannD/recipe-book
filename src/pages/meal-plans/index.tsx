/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { Button } from '../../components/ui/button';
import { type FullMealPlan, type FullRecipe } from '../../models/model';
import { api } from '../../utils/api';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { defaultRecipeImageUrl } from '../../constants';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const MealPlansPage = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isSelectingMealPlan, setIsSelectingMealPlan] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<FullMealPlan | null>(
    null
  );

  const [mealPlan, setMealPlan] = useState<FullMealPlan | null>(null);

  // Data Fetching
  const { data: latestMealPlan, isLoading: isMealPlanLoading } =
    api.mealPlan.getLatestMealPlan.useQuery();

  useEffect(() => {
    if (selectedMealPlan) {
      setMealPlan(selectedMealPlan);
    } else if (latestMealPlan) {
      setMealPlan(latestMealPlan);
    }
  }, [latestMealPlan, selectedMealPlan]);

  return (
    <RecipesPageLayout
      isExpanded={selectedRecipe !== null}
      isFullScreen={isFullScreen}
      leftChildren={
        <>
          <div className="mb-10 flex flex-col flex-wrap items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-merri text-2xl font-bold">Your Meal Plans</h1>
              <h2 className="mt-1 text-gray-600">
                Plan the recipes you want to cook for the week
              </h2>
            </div>
            <div className="flex w-full justify-end gap-4 lg:w-auto">
              <Button
                variant="outline"
                className="w-full flex-1 lg:min-w-[150px]"
                onClick={() => setIsSelectingMealPlan(true)}
              >
                Switch Meal Plan
              </Button>
              <Link href="/meal-plans/create" className="flex-1">
                <Button className="w-full">Create</Button>
              </Link>
              <MealPlanSelectDialog
                isOpen={isSelectingMealPlan}
                onClose={() => setIsSelectingMealPlan(false)}
                mealPlanSelected={(plan) => {
                  setIsSelectingMealPlan(false);
                  setSelectedMealPlan(plan);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {isMealPlanLoading ? (
              <>
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
              </>
            ) : (
              mealPlan && (
                <MealPlanDisplay
                  mealPlan={mealPlan}
                  onRecipeClicked={(recipe) => setSelectedRecipe(recipe)}
                />
              )
            )}
          </div>
        </>
      }
      rightChildren={
        <>
          {selectedRecipe && (
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
          )}
        </>
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
    <div className="w-full">
      <div className="mb-4 flex justify-between gap-4">
        <h2 className="text-xl font-bold">{mealPlan.name}</h2>
        <div className="flex gap-4">
          <Link href={`/meal-plans/create/${mealPlan.id}`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {mealPlan.meals.map((meal, index) => (
          <div key={meal.id} className=" min-w-full flex-1  lg:min-w-[450px]">
            <div className="flex min-h-[133px] flex-col rounded border  bg-white">
              <div className="flex items-center justify-between border-b p-2">
                <h3 className=" font-bold">Meal {index + 1}</h3>
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
        src={
          recipe.imageUrl !== '' ? recipe.imageUrl ?? '' : defaultRecipeImageUrl
        }
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

const MealPlanSelectDialog = ({
  isOpen,
  mealPlanSelected,
  onClose,
}: {
  isOpen: boolean;
  mealPlanSelected: (mealPlan: FullMealPlan) => void;
  onClose: () => void;
}) => {
  const { data: mealPlans, isLoading: isMealPlansLoading } =
    api.mealPlan.listMealPlans.useQuery();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="overflow-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Meal Plan</DialogTitle>
          <DialogDescription>Select a meal plan to view</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col rounded border">
          {isMealPlansLoading ? (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            mealPlans &&
            mealPlans.map((mealPlan) => (
              <div
                key={mealPlan.id}
                className="flex cursor-pointer items-center justify-between border-b p-2 first-of-type:rounded-t last-of-type:rounded-b last-of-type:border-b-0 hover:bg-slate-100"
                onClick={() => {
                  mealPlanSelected(mealPlan);
                }}
              >
                <h3 className="text-sm font-bold">{mealPlan.name}</h3>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
