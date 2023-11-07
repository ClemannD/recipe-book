/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import { CheckCircle, PlusCircle, X, XCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Label from '../../../components/forms/label';
import RecipesPageLayout from '../../../components/recipes/recipes-page';
import { Button } from '../../../components/ui/button';
import { PlainInput } from '../../../components/ui/input-plain';
import { Switch } from '../../../components/ui/switch';
import { useToast } from '../../../components/ui/toast/use-toast';
import { FullRecipe } from '../../../models/model';
import { api } from '../../../utils/api';
import { Skeleton } from '../../../components/ui/skeleton';
import { defaultRecipeImageUrl } from '../../../constants';
import RecipeDisplay from '../../../components/recipes/recipe-display';

interface MealFormMeal {
  id: string;
  recipes: FullRecipe[];
}

interface MealPlan {
  id: string;
  name: string;
  meals: MealFormMeal[];
}

const CreateMealPlanPage = () => {
  const { toast, dismiss } = useToast();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [hasFetched, setHasFetched] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [editingMealPlanId, setEditingMealPlanId] = useState<string | null>(
    null
  );
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(
    null
  );

  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);

  // Data fetching
  const {
    data: mealPlanData,
    isLoading: isMealPlanLoading,
    refetch,
  } = api.mealPlan.getMealPlan.useQuery(
    { id: editingMealPlanId! },
    {
      enabled: !!editingMealPlanId && !hasFetched,
      onSuccess: () => {
        setHasFetched(true);
      },
    }
  );

  const {
    data: recipesData,
    // isLoading,
  } = api.recipe.getRecipes.useQuery();

  const { data: publicRecipesData, isLoading: isLoadingPublicRecipes } =
    api.recipe.getPublicRecipes.useQuery();

  const { mutate: createMealPlan, isLoading: isCreatingMealPlan } =
    api.mealPlan.createMealPlan.useMutation({
      onSuccess: () => {
        toast({
          title: '✅ Meal Plan Created',
          description: 'Your meal plan has been created successfully.',
        });

        void router.push('/meal-plans');
      },
      onError: (error: any) => {
        console.error(error);

        toast({
          title: 'Error creating Meal Plan',
          description: 'Please try again later.',
        });
      },
    });

  const { mutate: updateMealPlan, isLoading: isUpdatingMealPlan } =
    api.mealPlan.updateMealPlan.useMutation({
      onSuccess: () => {
        toast({
          title: '✅ Meal Plan Updated',
          description: 'Your meal plan has been updated successfully.',
        });

        void router.push('/meal-plans');
      },
      onError: (error: any) => {
        console.error(error);

        toast({
          title: 'Error updating Meal Plan',
          description: 'Please try again later.',
        });
      },
    });

  useEffect(() => {
    if (!!router.query.mealPlanId?.[0]) {
      setEditingMealPlanId(router.query.mealPlanId[0]);
    }
    setInitialized(true);
  }, [router.query.mealPlanId]);

  // If there is a meal plan id in the url, we are editing an existing meal plan
  useEffect(() => {
    if (mealPlanData) {
      setMealPlan(mealPlanData as unknown as MealPlan);
    }
  }, [mealPlanData]);

  // Form state
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    id: '',
    name: `${
      // todays date
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    } to ${
      // 5 days from now
      new Date(
        new Date().getTime() + 5 * 24 * 60 * 60 * 1000
      ).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    }`,
    meals: [
      {
        id: '',
        recipes: [],
      },
      {
        id: '',
        recipes: [],
      },
      {
        id: '',
        recipes: [],
      },
      {
        id: '',
        recipes: [],
      },
      {
        id: '',
        recipes: [],
      },
    ],
  });

  const addMeal = () => {
    setMealPlan((previousMealPlan) => ({
      ...previousMealPlan,
      meals: [
        ...previousMealPlan.meals,
        {
          id: '',
          recipes: [],
        },
      ],
    }));
  };

  const removeMeal = (indexToRemove: number) => {
    setMealPlan((previousMealPlan) => ({
      ...previousMealPlan,
      meals: previousMealPlan.meals.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const saveMealPlan = () => {
    if (editingMealPlanId) {
      updateMealPlan({
        id: editingMealPlanId,
        name: mealPlan.name,
        meals: mealPlan.meals.map((meal) => ({
          id: meal.id,
          recipeIds: meal.recipes.map((recipe) => recipe.id),
        })),
      });
      return;
    }

    createMealPlan({
      name: mealPlan.name,
      meals: mealPlan.meals.map((meal) => ({
        recipeIds: meal.recipes.map((recipe) => recipe.id),
      })),
    });
  };

  useEffect(() => {
    console.log(mealPlan);
  }, [mealPlan]);

  return (
    <RecipesPageLayout
      isExpanded={selectedMealIndex !== null}
      isFullScreen={false}
      leftChildren={
        <>
          <div className="mb-10 flex flex-col flex-wrap items-start justify-between gap-6 pt-16 md:flex-row md:items-end lg:pt-0">
            <div>
              <h1 className="text-2xl font-bold">
                {mealPlanData ? 'Update' : 'Create'} Meal Plan
              </h1>
              <h2 className="mt-1 text-gray-600">
                A Meal Plan is a collection of meals, and each meal can have 1
                or more recipes
              </h2>
            </div>
            <div className="flex w-full flex-col flex-wrap justify-end gap-4 lg:w-auto lg:flex-row">
              <Button
                onClick={saveMealPlan}
                isSubmitting={isCreatingMealPlan || isUpdatingMealPlan}
              >
                Save Meal Plan
              </Button>

              <Button
                variant="destructive-outline"
                onClick={() => {
                  toast({
                    title: 'Are you sure you want to cancel?',
                    description: 'All unsaved changes will be lost',
                    action: (
                      <Button
                        variant={'destructive'}
                        onClick={() => {
                          void router.push('/meal-plans');

                          dismiss();
                        }}
                      >
                        Discard
                      </Button>
                    ),
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {(isMealPlanLoading && !!editingMealPlanId) || !initialized ? (
              <>
                <Skeleton className="flex min-h-[140px] min-w-full flex-1 lg:min-w-[450px]" />
                <Skeleton className="flex min-h-[140px] min-w-full flex-1 lg:min-w-[450px]" />
                <Skeleton className="flex min-h-[140px] min-w-full flex-1 lg:min-w-[450px]" />
                <Skeleton className="flex min-h-[140px] min-w-full flex-1 lg:min-w-[450px]" />
                <Skeleton className="flex min-h-[140px] min-w-full flex-1 lg:min-w-[450px]" />
              </>
            ) : (
              <MealPlanForm
                mealPlan={mealPlan}
                onMealPlanNameChanged={(name: string) => {
                  setMealPlan((previousMealPlan) => ({
                    ...previousMealPlan,
                    name,
                  }));
                }}
                onAddMealClicked={addMeal}
                onRemoveMealClicked={removeMeal}
                onAddRecipeToMealClicked={(mealIndex: number) => {
                  setSelectedMealIndex(mealIndex);
                }}
                onRemoveRecipeFromMealClicked={(
                  mealIndex: number,
                  recipeId: string
                ) => {
                  setMealPlan((previousMealPlan) => {
                    return {
                      ...previousMealPlan,
                      meals: previousMealPlan.meals.map((meal, index) => {
                        console.log('index', index);
                        console.log('mealIndex', mealIndex);
                        if (index !== mealIndex) {
                          return meal;
                        }
                        console.log('meal.recipes', meal.recipes);
                        const newRecipes = meal.recipes.filter(
                          (mealRecipe) => mealRecipe.id !== recipeId
                        );
                        console.log('newRecipes', newRecipes);

                        return {
                          ...meal,
                          recipes: newRecipes,
                        };
                      }),
                    };
                  });
                }}
              />
            )}
          </div>
        </>
      }
      rightChildren={
        <>
          {selectedRecipe ? (
            <RecipeDisplay
              recipe={selectedRecipe}
              onClose={() => {
                setSelectedRecipe(null);
              }}
            />
          ) : (
            <RecipesSelectWindow
              selectedMealIndex={selectedMealIndex || 1}
              recipesData={recipesData}
              publicRecipesData={publicRecipesData}
              selectedRecipeIds={
                selectedMealIndex !== null
                  ? mealPlan?.meals[selectedMealIndex]?.recipes.map(
                      (recipe) => recipe.id
                    ) ?? []
                  : []
              }
              search={search}
              onSearchChanged={(search: string) => {
                setSearch(search);
              }}
              onCloseClicked={() => {
                setSelectedMealIndex(null);
              }}
              onRecipeViewClicked={(recipe: FullRecipe) => {
                setSelectedRecipe(recipe);
              }}
              onRecipeClicked={(recipe: FullRecipe) => {
                if (selectedMealIndex === null) {
                  return;
                }

                if (
                  mealPlan?.meals[selectedMealIndex]?.recipes.some(
                    (mealRecipe) => mealRecipe.id === recipe.id
                  )
                ) {
                  setMealPlan((previousMealPlan) => ({
                    ...previousMealPlan,
                    meals: previousMealPlan.meals.map((meal, index) => {
                      if (index !== selectedMealIndex) {
                        return meal;
                      }

                      return {
                        ...meal,
                        recipes: meal.recipes.filter(
                          (mealRecipe) => mealRecipe.id !== recipe.id
                        ),
                      };
                    }),
                  }));
                } else {
                  setMealPlan((previousMealPlan) => ({
                    ...previousMealPlan,
                    meals: previousMealPlan.meals.map((meal, index) => {
                      if (index !== selectedMealIndex) {
                        return meal;
                      }

                      return {
                        ...meal,
                        recipes: [...meal.recipes, recipe],
                      };
                    }),
                  }));
                }
              }}
            />
          )}
        </>
      }
    ></RecipesPageLayout>
  );
};

export default CreateMealPlanPage;

const MealPlanForm = ({
  mealPlan,
  onMealPlanNameChanged,
  onAddRecipeToMealClicked,
  onAddMealClicked,
  onRemoveMealClicked,
  onRemoveRecipeFromMealClicked,
}: {
  mealPlan: MealPlan;
  onMealPlanNameChanged: (name: string) => void;
  onAddRecipeToMealClicked: (mealIndex: number) => void;
  onAddMealClicked: () => void;
  onRemoveMealClicked: (index: number) => void;
  onRemoveRecipeFromMealClicked: (mealIndex: number, recipeId: string) => void;
}) => {
  const [longestMealPlanLength, setLongestMealPlanLength] = useState(0);
  useEffect(() => {
    const longestMealPlanLength = Math.max(
      ...mealPlan.meals.map((meal) => meal.recipes.length)
    );
    setLongestMealPlanLength(longestMealPlanLength);
  }, [mealPlan]);

  return (
    <div className="w-full">
      {/* <div className="w-full rounded bg-white p-4 shadow"> */}
      <div className="mb-4 ">
        <Label label={'Meal Plan Name'}></Label>
        <PlainInput
          value={mealPlan.name}
          onChange={(e) => {
            onMealPlanNameChanged(e.target.value);
          }}
        />

        {/* <div className="flex gap-4">
          <Button
            disabled={meals.length === 1}
            variant="outline"
            onClick={addMeal}
          >
            Remove Meal
          </Button>
        </div> */}
      </div>
      <div className="flex flex-wrap gap-4">
        {mealPlan.meals.map((meal, mealIndex) => (
          <div
            key={mealIndex}
            className="flex min-h-[140px] min-w-full flex-1 flex-col rounded border bg-white lg:min-w-[450px]"
          >
            <div className="flex items-center justify-between border-b p-2 px-3">
              <h3 className="font-bold">Meal {mealIndex + 1}</h3>
              <div className="flex gap-1 text-gray-500">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onAddRecipeToMealClicked(mealIndex);
                  }}
                >
                  <PlusCircle />
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500"
                  disabled={mealPlan.meals.length === 1}
                  size="icon"
                  onClick={() => {
                    onRemoveMealClicked(mealIndex);
                  }}
                >
                  <XCircle />
                </Button>
              </div>
            </div>

            <div className="flex flex-grow flex-col">
              {meal.recipes.map((recipe, index) => (
                <MealRecipeItem
                  key={recipe.id}
                  recipe={recipe}
                  index={index}
                  longestMealPlanLength={longestMealPlanLength}
                  onClick={() => {
                    onRemoveRecipeFromMealClicked(mealIndex, recipe.id);
                  }}
                />
              ))}

              {
                //If there are no recipes in this meal, show a message
                meal.recipes.length === 0 && (
                  <div className="flex flex-grow items-center justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        onAddRecipeToMealClicked(mealIndex);
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

        <div className="flex h-[140px] min-w-full flex-1 items-center justify-center rounded border bg-white  lg:lg:min-w-[450px]">
          <Button
            disabled={mealPlan.meals.length === 7}
            variant="outline"
            onClick={onAddMealClicked}
          >
            Add Meal
          </Button>
        </div>

        {/* Hack because I want flex wrap but with all elements to maintain their size */}
        <div className="h-1 flex-1 lg:min-w-[450px]"></div>
        <div className="h-1 flex-1 lg:min-w-[450px]"></div>
      </div>
    </div>
  );
};

const RecipesSelectWindow = ({
  selectedMealIndex,
  recipesData,
  publicRecipesData,
  selectedRecipeIds,
  search,
  onRecipeViewClicked,
  onRecipeClicked,
  onCloseClicked,
  onSearchChanged,
}: {
  selectedMealIndex: number;
  recipesData: FullRecipe[] | undefined;
  publicRecipesData: FullRecipe[] | undefined;
  selectedRecipeIds: string[];
  search: string;
  onRecipeViewClicked: (recipe: FullRecipe) => void;
  onRecipeClicked: (recipe: FullRecipe) => void;
  onCloseClicked?: () => void;
  onSearchChanged: (search: string) => void;
}) => {
  //Recipe search and filter states
  const [showPublicRecipes, setShowPublicRecipes] = useState(true);
  const [recipesToShow, setRecipesToShow] = useState<FullRecipe[] | null>(null);

  /**
   * Filter the recipes to show based on the search and filter states
   */
  useEffect(() => {
    if (!recipesData && !publicRecipesData) {
      return;
    }

    let recipesToShow = recipesData ?? [];

    if (showPublicRecipes) {
      // Merge recipes and public, but remove duplicates from public recipes with same recipe id
      recipesToShow = [
        ...recipesToShow,
        ...(publicRecipesData ?? []).filter(
          (publicRecipe) =>
            !recipesToShow.some((recipe) => recipe.id === publicRecipe.id)
        ),
      ];
    }

    if (search) {
      recipesToShow = recipesToShow.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(search.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.name.toLowerCase().includes(search.toLowerCase())
          ) ||
          recipe.recipeTypes.some((recipeType) =>
            recipeType.name.toLowerCase().includes(search.toLowerCase())
          ) ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          (recipe.createdBy.fullName ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // if (recipeTypeFilter?.length ?? 0 > 0) {
    //   recipesToShow =
    //     recipesToShow?.filter((recipe) =>
    //       recipeTypeFilter?.every((recipeTypeId) =>
    //         recipe.recipeTypes.some(
    //           (recipeType) => recipeType.id === recipeTypeId
    //         )
    //       )
    //     ) || null;
    // }

    setRecipesToShow(recipesToShow);
  }, [recipesData, publicRecipesData, search, showPublicRecipes]);

  return (
    <div className="relative pb-20">
      <div className="fixed w-full min-w-full max-w-[700px] bg-white p-4 lg:w-[600px] lg:min-w-[600px]">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <h3 className="text-lg font-bold">Meal {selectedMealIndex + 1}</h3>
          <div className="flex items-center">
            <p className="mr-2">Show public recipes</p>
            <Switch
              className="mr-4"
              checked={showPublicRecipes}
              onCheckedChange={(checked) => {
                setShowPublicRecipes(checked);
              }}
            />
            <Button className=" " onClick={onCloseClicked}>
              <X />
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <PlainInput
            placeholder="🔎  Search by recipe name, ingredient, or recipe type"
            value={search}
            className="w-full"
            onChange={(e) => {
              onSearchChanged(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="pt-[156px]">
        {recipesToShow?.length === 0 && (
          <div className="flex w-full items-center justify-center gap-4 py-8">
            <div className="rounded bg-white p-6 text-center shadow">
              <h1 className="mb-2 text-2xl font-bold">No recipes found</h1>
              <h2 className="text-gray-600">
                Try changing your search or filter, or create a new recipe
              </h2>
            </div>
          </div>
        )}

        {recipesToShow?.map((recipe) => (
          <SelectRecipeItem
            key={recipe.id + recipe.name}
            recipe={recipe}
            isSelected={selectedRecipeIds.includes(recipe.id)}
            onRecipeViewClicked={() => onRecipeViewClicked(recipe)}
            onClick={() => {
              onRecipeClicked(recipe);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SelectRecipeItem = ({
  recipe,
  isSelected,
  onRecipeViewClicked,
  onClick,
}: {
  recipe: FullRecipe;
  isSelected?: boolean;
  onRecipeViewClicked: () => void;
  onClick: () => void;
}) => {
  return (
    <div
      className={clsx(
        'flex min-w-full flex-1 cursor-pointer overflow-clip border-t last-of-type:border-b'
      )}
    >
      <div
        className="flex max-h-[120px] min-h-[120px] flex-1 hover:bg-gray-100 lg:max-h-[80px] lg:min-h-[80px]"
        onClick={onRecipeViewClicked}
      >
        <img
          className="h-auto w-[100px] min-w-[100px] object-cover"
          src={
            recipe.imageUrl !== ''
              ? recipe.imageUrl ?? ''
              : defaultRecipeImageUrl
          }
          alt={recipe.name}
        />
        <div className="flex w-full flex-col p-2">
          <h3 className="text-sm font-bold">{recipe.name}</h3>

          <p className="mb-1 text-[10px] italic text-slate-500 ">
            Created By {recipe.createdBy.fullName}
          </p>

          <div className="flex flex-wrap gap-1 lg:gap-2">
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

      <div
        className={clsx(
          'flex min-w-[80px] items-center justify-center border-l',
          isSelected ? 'bg-green-50' : 'hover:bg-gray-100'
        )}
        onClick={onClick}
      >
        {isSelected ? (
          <CheckCircle className="text-green-700" />
        ) : (
          <PlusCircle />
        )}
      </div>
    </div>
  );
};

const MealRecipeItem = ({
  recipe,
  index,
  longestMealPlanLength,
  onClick,
}: {
  recipe: FullRecipe;
  index: number;
  longestMealPlanLength: number;
  onClick: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={clsx(
        'flex max-h-[80px] min-h-[80px] flex-1 overflow-clip border-b transition-all ease-in-out last-of-type:rounded-bl ',
        index + 1 < longestMealPlanLength
          ? 'last-of-type:border-b-0 lg:last-of-type:border-b'
          : 'last-of-type:border-b-0'
      )}
      onMouseEnter={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
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
      <div onClick={onClick} className={clsx('p-2')}>
        <div className="cursor-pointer text-red-300 transition-colors ease-in-out hover:text-red-500">
          <X className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
