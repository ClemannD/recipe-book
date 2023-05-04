import { type Ingredient, type Recipe, type RecipeType } from '@prisma/client';
import clsx from 'clsx';
import { Expand, Minimize, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import RecipeForm from '../../components/recipe-form';
import { Button } from '../../components/ui/button';
import { PlainInput } from '../../components/ui/input-plain';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast/use-toast';
import { api } from '../../utils/api';
import { cn } from '../../utils/cn';

export type FullRecipe = Recipe & {
  recipeTypes: RecipeType[];
  ingredients: Ingredient[];
};

const RecipesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<FullRecipe | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [search, setSearch] = useState('');
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<string[] | null>(
    null
  );
  const [recipes, setRecipes] = useState<FullRecipe[] | null>(null);

  const {
    data: recipesData,
    isLoading,
    refetch: refetchRecipes,
  } = api.recipe.getRecipes.useQuery();

  const { data: recipeTypes, isLoading: recipeTypesIsLoading } =
    api.recipeType.getRecipeTypes.useQuery();

  useEffect(() => {
    setIsExpanded(!!selectedRecipe);

    setSelectedRecipe(
      recipesData?.find((recipe) => recipe.id === selectedRecipe?.id) ?? null
    );
  }, [recipesData, selectedRecipe]);

  useEffect(() => {
    if (recipesData) {
      setRecipes(recipesData);
    }
  }, [recipesData]);

  useEffect(() => {
    if (recipesData) {
      let recipesToShow = recipesData;

      if (search) {
        recipesToShow =
          recipesData?.filter(
            (recipe) =>
              recipe.name.toLowerCase().includes(search.toLowerCase()) ||
              recipe.ingredients.some((ingredient) =>
                ingredient.name.toLowerCase().includes(search.toLowerCase())
              ) ||
              recipe.recipeTypes.some((recipeType) =>
                recipeType.name.toLowerCase().includes(search.toLowerCase())
              )
          ) || null;
      }

      if (recipeTypeFilter?.length ?? 0 > 0) {
        recipesToShow =
          recipesToShow?.filter((recipe) =>
            recipeTypeFilter?.every((recipeTypeId) =>
              recipe.recipeTypes.some(
                (recipeType) => recipeType.id === recipeTypeId
              )
            )
          ) || null;
      }

      setRecipes(recipesToShow);
    }
  }, [recipesData, search, recipeTypeFilter]);

  const { toast, dismiss } = useToast();

  return (
    <Layout>
      <div className="relative flex">
        <div
          className={clsx(
            `max-h-screen flex-grow overflow-y-auto p-10 transition-all duration-300 ease-in-out`,
            false ? 'w-0 min-w-0 overflow-hidden' : 'w-[550px] overflow-y-auto'
          )}
        >
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-bold">Recipes</h1>
              <h2 className="mt-1 text-gray-600">Your collection of recipes</h2>
            </div>
            <div className="flex flex-grow justify-end gap-4">
              <PlainInput
                placeholder="🔎 Search"
                value={search}
                className="w-96"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />

              <Button
                onClick={() => {
                  if (editingRecipe) {
                    toast({
                      title: `You are currently ${
                        isCreating ? 'creating' : 'editing'
                      } a recipe`,
                      description: 'Are you sure you want to switch recipes?',
                      duration: 5000,

                      action: (
                        <Button
                          onClick={() => {
                            setIsCreating(true);
                            setSelectedRecipe(null);
                            setEditingRecipe(null);
                            dismiss();
                          }}
                        >
                          Discard
                        </Button>
                      ),
                    });
                    return;
                  }

                  setIsCreating(true);
                  setEditingRecipe(null);
                  setSelectedRecipe(null);
                }}
              >
                Create
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {recipeTypesIsLoading &&
              Array.from(Array(20).keys()).map((i) => (
                <Skeleton className="h-6 w-24 rounded-full" key={i} />
              ))}

            {recipeTypes?.map((recipeType) => (
              <div
                className={clsx(
                  'flex h-6 w-auto cursor-pointer items-center justify-center rounded-full  p-2 text-sm tracking-wide transition-all ease-in-out hover:scale-105',
                  recipeTypeFilter?.includes(recipeType.id)
                    ? 'bg-slate-900 text-white'
                    : 'bg-white'
                )}
                key={recipeType.id + recipeType.name + recipeType.icon}
                onClick={() => {
                  if (recipeTypeFilter?.includes(recipeType.id)) {
                    setRecipeTypeFilter(
                      recipeTypeFilter?.filter((id) => id !== recipeType.id)
                    );
                  } else {
                    setRecipeTypeFilter([
                      ...(recipeTypeFilter || []),
                      recipeType.id,
                    ]);
                  }
                }}
              >
                {recipeType.icon}{' '}
                <span className="ml-2 text-xs font-medium ">
                  {recipeType.name}
                </span>
              </div>
            ))}
          </div>

          <div className="">
            <div className={clsx('flex flex-wrap gap-4')}>
              {isLoading &&
                Array.from(Array(20).keys()).map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[150px] min-w-[400px] max-w-[600px] flex-1"
                  />
                ))}

              {recipes?.map((recipe) => (
                <RecipeCard
                  key={recipe.id + recipe.name}
                  recipe={recipe}
                  onClick={() => {
                    if (editingRecipe || isCreating) {
                      toast({
                        title: `You are currently ${
                          isCreating ? 'creating' : 'editing'
                        } a recipe`,
                        description: 'Are you sure you want to switch recipes?',
                        duration: 5000,

                        action: (
                          <Button
                            onClick={() => {
                              setEditingRecipe(null);
                              setIsCreating(false);
                              setSelectedRecipe(recipe);
                              dismiss();
                            }}
                          >
                            Discard
                          </Button>
                        ),
                      });
                      return;
                    }

                    setSelectedRecipe(recipe);
                    setIsExpanded(true);
                  }}
                />
              ))}
              {/* Hack because I want flex wrap but with all elements to maintain their size */}
              <div className="h-1 min-w-[400px] max-w-[600px] flex-1"></div>
              <div className="h-1 min-w-[400px] max-w-[600px] flex-1"></div>
              <div className="h-1 min-w-[400px] max-w-[600px] flex-1"></div>
            </div>
          </div>
        </div>

        {/* Dummy component to help with positioning */}
        <div
          className={cn(
            clsx(
              `h-screen max-h-screen max-w-[700px] transition-all duration-300 ease-in-out`,
              isExpanded || isCreating || editingRecipe || isFullScreen
                ? 'w-[600px] min-w-[600px]'
                : 'w-0 min-w-0'
            )
          )}
        ></div>

        <div
          className={cn(
            clsx(
              `absolute top-0  h-screen max-h-screen  max-w-[700px] overflow-y-auto bg-white shadow-lg transition-all duration-300 ease-in-out`,
              isExpanded || isCreating || editingRecipe
                ? isFullScreen
                  ? ' right-0  w-full min-w-full'
                  : ' right-0 w-[600px] min-w-[600px]'
                : 'right-[-600px] w-[600px] min-w-[600px]'
            )
          )}
        >
          {!editingRecipe && (
            <RecipeDisplay
              recipe={selectedRecipe}
              isFullscreen={isFullScreen}
              onClose={() => {
                setIsExpanded(false);
                setIsFullScreen(false);
              }}
              onEditClick={() => setEditingRecipe(selectedRecipe)}
              onFullscreenClick={() => setIsFullScreen(!isFullScreen)}
            />
          )}

          {editingRecipe && !isCreating && (
            <RecipeForm
              recipe={editingRecipe}
              onClose={() => setEditingRecipe(null)}
              onSuccess={async () => {
                setEditingRecipe(null);
                await refetchRecipes();
              }}
            />
          )}

          {isCreating && !editingRecipe && (
            <RecipeForm
              onClose={() => setIsCreating(false)}
              onSuccess={async () => {
                setIsCreating(false);
                await refetchRecipes();
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecipesPage;

const RecipeCard = ({
  recipe,
  onClick,
}: {
  recipe: FullRecipe;
  onClick: () => void;
}) => {
  return (
    <div
      className="m flex min-w-[400px] flex-1 cursor-pointer rounded bg-white shadow-sm transition-all ease-in-out hover:scale-[1.02]"
      onClick={onClick}
    >
      <div>
        <img
          className="h-[150px] w-[130px] min-w-[130px] rounded-l object-cover"
          src={recipe.imageUrl!}
          alt={recipe.name}
        />
      </div>
      <div className="flex flex-col p-3">
        <h3 className="mb-2 text-lg font-bold">{recipe.name}</h3>

        <div className="flex flex-wrap gap-2">
          {recipe.recipeTypes.map((recipeType) => (
            <div
              className="flex h-6 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-xs tracking-wide "
              key={recipeType.id + recipeType.name + recipeType.icon}
            >
              {recipeType.icon}{' '}
              <span className="ml-2 text-xs font-medium ">
                {recipeType.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RecipeDisplay = ({
  recipe,
  isFullscreen,
  onClose,
  onEditClick,
  onFullscreenClick,
}: {
  recipe: FullRecipe | null;
  isFullscreen?: boolean;
  onClose: () => void;
  onEditClick: () => void;
  onFullscreenClick: () => void;
}) => {
  return (
    recipe && (
      <>
        <div className="absolute right-0 top-0 p-4">
          <button
            className="rounded-full bg-gray-100 p-2 transition-all ease-in-out hover:bg-gray-200"
            onClick={() => onFullscreenClick()}
          >
            {isFullscreen ? <Minimize></Minimize> : <Expand></Expand>}
          </button>
        </div>
        <div className="absolute left-0 top-0 p-4">
          <button
            className="rounded-full bg-gray-100 p-2 transition-all ease-in-out hover:bg-gray-200"
            onClick={() => onClose()}
          >
            <X></X>
          </button>
        </div>

        <div
          className={clsx(
            'flex',
            isFullscreen ? 'flex-row' : 'flex-col'
            // 'items-center justify-center h-screen max-h-screen transition-all duration-500 ease-in-out'
          )}
        >
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={clsx(
                ' object-cover object-center',
                isFullscreen
                  ? 'h-auto max-h-[500px] w-full'
                  : 'h-[400px] w-full '
              )}
              src={recipe.imageUrl!}
              alt=""
            />
            <div className="mt-4 flex flex-col px-4">
              <div className="flex items-center justify-between">
                <h2 className="mb-3 text-2xl font-bold">{recipe.name}</h2>
                <Button variant={'secondary'} onClick={() => onEditClick()}>
                  Edit
                </Button>
              </div>
              <div className="mb-6 flex flex-wrap gap-2">
                {recipe.recipeTypes.map((recipeType) => (
                  <div
                    className="flex h-6 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-sm tracking-wide "
                    key={recipeType.id + recipeType.name + recipeType.icon}
                  >
                    {recipeType.icon}{' '}
                    <span className="ml-2 text-xs font-medium ">
                      {recipeType.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {recipe.instructions && (
              <div className="mb-4 px-4">
                <h3
                  className={clsx(
                    ' font-bold text-slate-700',
                    isFullscreen ? 'mb-4 text-2xl' : 'mb-2 text-xl'
                  )}
                >
                  Instructions
                </h3>
                <p
                  className={clsx(
                    'whitespace-pre-wrap',
                    isFullscreen ? 'text-base' : 'text-sm'
                  )}
                >
                  {recipe.instructions}
                </p>
              </div>
            )}
          </div>
          <div className={clsx(isFullscreen ? 'flex-1' : '')}>
            <div className={clsx(isFullscreen ? 'p-10 pt-20' : 'px-4 pb-20')}>
              <h3
                className={clsx(
                  ' font-bold text-slate-700',
                  isFullscreen ? 'mb-4 text-2xl' : 'mb-2 text-xl'
                )}
              >
                Ingredients
              </h3>

              <div>
                {recipe.ingredients.map((ingredient) => (
                  <div
                    className="flex items-end border-b border-gray-200 px-4 py-2 first-of-type:border-t"
                    key={ingredient.id + ingredient.name}
                  >
                    <div className="mr-2 w-10 text-right ">
                      {/* convert decimal ingredient.quantity to nearest fraction */}
                      {ingredient.quantity && (
                        <span className="text-sm ">
                          {roundToCleanFraction(ingredient.quantity)}
                        </span>
                      )}{' '}
                    </div>
                    <div className="mr-8 w-10 text-sm text-slate-500">
                      {ingredient.unit}
                    </div>
                    {ingredient.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

/**
 * This monstrosity comes from ChatGPT. The prompt was:
 * "Code only. Code in typescript. Give me a function which will take in a number and round it to the nearest clean fraction.
 * It should display 1.5 as "1 1/2" and should display 1 as "1" and should display 1.33 as "1 1/3" and it should display 0.33 as "1/3".
 * It should round weird fractions to the nearest clean fraction. That is to say, 0.555555 should show as "1/2".  1.625452 should show as "1 2/3""
 *
 * I had to make some slight modifications to make it work still.
 */
function roundToCleanFraction(num: number): string {
  const EPSILON = 0.00000000001;
  const whole = Math.floor(num); // 0
  const fraction = num - whole; // 0.5

  const fractions = [
    { fraction: 0, name: '' },
    { fraction: 1 / 10, name: '1/10' },
    { fraction: 2 / 10, name: '2/10' },
    { fraction: 3 / 10, name: '3/10' },
    { fraction: 7 / 10, name: '7/10' },
    { fraction: 9 / 10, name: '9/10' },

    { fraction: 1 / 8, name: '1/8' },
    { fraction: 3 / 8, name: '3/8' },
    { fraction: 5 / 8, name: '5/8' },
    { fraction: 7 / 8, name: '7/8' },

    { fraction: 1 / 6, name: '1/6' },
    { fraction: 5 / 6, name: '5/6' },

    { fraction: 1 / 5, name: '1/5' },
    { fraction: 2 / 5, name: '2/5' },
    { fraction: 3 / 5, name: '3/5' },
    { fraction: 4 / 5, name: '4/5' },

    { fraction: 1 / 4, name: '1/4' },
    { fraction: 3 / 4, name: '3/4' },

    { fraction: 1 / 3, name: '1/3' },
    { fraction: 2 / 3, name: '2/3' },

    { fraction: 1 / 2, name: '1/2' },
    { fraction: 1, name: '' },
  ];

  // handle whole number case
  if (Math.abs(fraction) < EPSILON) {
    return `${whole}`;
  }

  // find the nearest clean fraction
  let smallestDifference = Infinity;
  let closestFraction = fractions[0];
  for (let i = 0; i < fractions.length; i++) {
    const fractionValue = fractions[i]!.fraction;
    const difference = Math.abs(fractionValue - fraction);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestFraction = fractions[i];
    }
  }

  // handle negative number case
  if (num < 0) {
    return `-${whole} ${closestFraction!.name}`;
  }

  // handle mixed number case
  if (whole > 0) {
    return `${whole} ${closestFraction!.name}`;
  }

  // handle proper fraction case
  return closestFraction!.name;
}
