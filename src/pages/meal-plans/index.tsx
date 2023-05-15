import clsx from 'clsx';
import { CheckCircle, PlusCircle, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { Button } from '../../components/ui/button';
import { FullRecipe } from '../../models/model';
import { api } from '../../utils/api';
import { PlainInput } from '../../components/ui/input-plain';
import Label from '../../components/forms/label';
import { Switch } from '../../components/ui/switch';

interface MealFormMeal {
  id: string;
  recipes: FullRecipe[];
}

interface MealPlan {
  id: string;
  meals: MealFormMeal[];
}

const CreateMealPlanPage = () => {
  // const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(
    null
  );

  // Data fetching
  const {
    data: recipesData,
    // isLoading,
  } = api.recipe.getRecipes.useQuery();

  const { data: publicRecipesData, isLoading: isLoadingPublicRecipes } =
    api.recipe.getPublicRecipes.useQuery();

  const [mealPlan, setMealPlan] = useState<MealPlan>({
    id: '',
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

  return (
    <RecipesPageLayout
      isExpanded={selectedMealIndex !== null}
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
              {/* <Button
                onClick={() => {
                  setIsExpanded(true);
                }}
              >
                Create
              </Button> */}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <MealPlanForm
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
            />
          </div>
        </>
      }
      rightChildren={
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
          onCloseClicked={() => {
            setSelectedMealIndex(null);
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
      }
    ></RecipesPageLayout>
  );
};

export default CreateMealPlanPage;

const RecipesSelectWindow = ({
  selectedMealIndex,
  recipesData,
  publicRecipesData,
  selectedRecipeIds,
  onRecipeClicked,
  onCloseClicked,
}: {
  selectedMealIndex: number;
  recipesData: FullRecipe[] | undefined;
  publicRecipesData: FullRecipe[] | undefined;
  selectedRecipeIds: string[];
  onRecipeClicked: (recipe: FullRecipe) => void;
  onCloseClicked?: () => void;
}) => {
  //Recipe search and filter states
  const [search, setSearch] = useState('');
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
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="pt-[132px]">
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
            onClick={() => {
              onRecipeClicked(recipe);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const MealPlanForm = ({
  mealPlan,
  onAddRecipeToMealClicked,
  onAddMealClicked,
  onRemoveMealClicked,
  onRemoveRecipeFromMealClicked,
}: {
  mealPlan: MealPlan;
  onAddRecipeToMealClicked: (mealIndex: number) => void;
  onAddMealClicked: () => void;
  onRemoveMealClicked: (index: number) => void;
  onRemoveRecipeFromMealClicked: (mealIndex: number, recipeId: string) => void;
}) => {
  return (
    <div className="w-full">
      {/* <div className="w-full rounded bg-white p-4 shadow"> */}
      <div className="mb-4 flex justify-between">
        <h2>New Meal Plan</h2>

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
        {mealPlan.meals.map((meal, index) => (
          <div
            key={index}
            className=" min-w-full flex-1 rounded bg-white shadow lg:min-w-[450px]"
          >
            <div className="">
              <div className="flex items-center justify-between p-3">
                <h3 className="text-lg font-bold">Meal {index + 1}</h3>
                <div className="flex gap-1 text-gray-500">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onAddRecipeToMealClicked(index);
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
                      onRemoveMealClicked(index);
                    }}
                  >
                    <XCircle />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col">
                {meal.recipes.map((recipe) => (
                  <MealRecipeItem
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => {
                      onRemoveRecipeFromMealClicked(index, recipe.id);
                    }}
                  />
                ))}

                {
                  //If there are no recipes in this meal, show a message
                  meal.recipes.length === 0 && (
                    <div className="mb-5 flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          onAddRecipeToMealClicked(index);
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

        <div className="flex h-[120px] min-w-full flex-1 items-center justify-center rounded bg-white shadow  lg:lg:min-w-[450px]">
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

const SelectRecipeItem = ({
  recipe,
  isSelected,
  onClick,
}: {
  recipe: FullRecipe;
  isSelected?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={clsx(
        'flex max-h-[120px] min-h-[120px] min-w-full flex-1 cursor-pointer overflow-clip  border-t transition-all ease-in-out last-of-type:border-b lg:max-h-[80px] lg:min-h-[80px]',
        isSelected ? 'bg-green-50' : 'hover:bg-gray-100'
      )}
      onClick={() => {
        onClick();
      }}
    >
      <img
        className="h-auto w-[100px] min-w-[100px]  object-cover"
        src={recipe.imageUrl!}
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
      <div className="flex min-w-[80px] items-center justify-center">
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
  onClick,
}: // isSelected,
{
  recipe: FullRecipe;
  // isSelected?: boolean;
  onClick: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={clsx(
        'flex max-h-[80px] min-h-[80px] flex-1 overflow-clip border-t transition-all ease-in-out last-of-type:rounded-bl'
        // isSelected ? 'bg-green-50' : 'hover:bg-gray-100'
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
        src={recipe.imageUrl!}
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
      <div
        onClick={onClick}
        className={clsx(
          'flex cursor-pointer items-center justify-center  p-3 ',
          isHovering ? 'flex' : 'hidden'
        )}
      >
        <Button size="icon" variant="ghost" className="text-red-300">
          <X />
        </Button>
      </div>
    </div>
  );
};

// export function SelectRecipesDialog({
//   mealPlan,
//   recipesData,
//   publicRecipesData,
//   onRecipeSelect,
// }: {
//   mealPlan?: FullMealPlan;
//   recipesData: FullRecipe[];
//   publicRecipesData: FullRecipe[];
//   onRecipeSelect: (recipe: FullRecipe) => void;
// }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const [search, setSearch] = useState('');

//   // Recipe states
//   const [recipesToShow, setRecipesToShow] = useState<FullRecipe[] | null>(null);

//   /**
//    * Filter the recipes to show based on the search and filter states
//    */
//   useEffect(() => {
//     if (recipesData) {
//       let recipesToShow = recipesData;

//       if (search) {
//         recipesToShow =
//           recipesData?.filter(
//             (recipe) =>
//               recipe.name.toLowerCase().includes(search.toLowerCase()) ||
//               recipe.ingredients.some((ingredient) =>
//                 ingredient.name.toLowerCase().includes(search.toLowerCase())
//               ) ||
//               recipe.recipeTypes.some((recipeType) =>
//                 recipeType.name.toLowerCase().includes(search.toLowerCase())
//               )
//           ) || null;
//       }

//       // if (recipeTypeFilter?.length ?? 0 > 0) {
//       //   recipesToShow =
//       //     recipesToShow?.filter((recipe) =>
//       //       recipeTypeFilter?.every((recipeTypeId) =>
//       //         recipe.recipeTypes.some(
//       //           (recipeType) => recipeType.id === recipeTypeId
//       //         )
//       //       )
//       //     ) || null;
//       // }

//       setRecipesToShow(recipesToShow);
//     }
//   }, [recipesData, search]);

//   return (
//     <Dialog open={isOpen}>
//       <DialogContent className="sm:max-w-[1000px]">
//         <DialogHeader>
//           <DialogTitle>Select Recipes For Meal</DialogTitle>
//           <DialogDescription>
//             A meal may have multiple recipes
//           </DialogDescription>
//         </DialogHeader>

//         <div className={clsx('flex flex-wrap gap-4')}>
//           {recipesToShow?.length === 0 && (
//             <div className="flex w-full items-center justify-center gap-4 py-8">
//               <div className="rounded bg-white p-6 text-center shadow">
//                 <h1 className="mb-2 text-2xl font-bold">No recipes found</h1>
//                 <h2 className="text-gray-600">
//                   Try changing your search or filter, or create a new recipe
//                 </h2>
//               </div>
//             </div>
//           )}

//           {recipesToShow?.map((recipe) => (
//             <RecipeCard
//               key={recipe.id + recipe.name}
//               recipe={recipe}
//               onClick={() => {}}
//             />
//           ))}
//           {/* Hack because I want flex wrap but with all elements to maintain their size */}
//           <div className="h-1 min-w-[400px] max-w-[600px] flex-1"></div>
//           <div className="h-1 min-w-[400px] max-w-[600px] flex-1"></div>
//           <div className="h-1 min-w-[400px] max-w-[600px] flex-1"></div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
