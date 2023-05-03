import { type Ingredient, type Recipe, type RecipeType } from '@prisma/client';
import clsx from 'clsx';
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Maximize,
  Minimize,
} from 'lucide-react';
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
  const [fullScreen, setFullScreen] = useState(false);

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

  const {
    data: recipeTypes,
    // isLoading,
    // refetch,
  } = api.recipeType.getRecipeTypes.useQuery();

  useEffect(() => {
    if (selectedRecipe) {
      setSelectedRecipe(
        recipesData?.find((recipe) => recipe.id === selectedRecipe.id) || null
      );
    }
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
      <div className="flex">
        <div
          className={clsx(
            `max-h-screen  flex-grow overflow-y-auto p-10`,
            fullScreen
              ? 'hidden w-0 min-w-0 overflow-hidden'
              : 'min-w-[550px] overflow-y-auto'
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
                  setIsCreating(true);
                  setSelectedRecipe(null);
                }}
              >
                Create
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
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
            <div
              className={clsx(
                // `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3`
                'flex flex-wrap gap-4'
                // selectedRecipe ? '!grid-cols-2' : ''
              )}
            >
              {isLoading && (
                <>
                  <Skeleton className="h-24 min-w-[400px] max-w-[600px] flex-1" />
                  <Skeleton className="h-24 min-w-[400px] max-w-[600px] flex-1" />
                  <Skeleton className="h-24 min-w-[400px] max-w-[600px] flex-1" />
                  <Skeleton className="h-24 min-w-[400px] max-w-[600px] flex-1" />
                  <Skeleton className="h-24 min-w-[400px] max-w-[600px] flex-1" />
                </>
              )}

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
        <div
          className={cn(
            clsx(
              `relative h-screen max-h-screen max-w-[700px] overflow-y-auto bg-white shadow-lg transition-all duration-500 ease-in-out`,
              selectedRecipe || isCreating || editingRecipe
                ? fullScreen
                  ? 'w-full min-w-full transition-none'
                  : 'w-[600px] min-w-[600px]'
                : 'w-0 min-w-0'
            )
          )}
        >
          {selectedRecipe && !editingRecipe && (
            <RecipeDisplay
              recipe={selectedRecipe}
              isFullscreen={fullScreen}
              onClose={() => {
                setSelectedRecipe(null);
                setFullScreen(false);
              }}
              onEditClick={() => setEditingRecipe(selectedRecipe)}
              onFullscreenClick={() => setFullScreen(!fullScreen)}
            />
          )}

          {editingRecipe && (
            <RecipeForm
              recipe={editingRecipe}
              onClose={() => setEditingRecipe(null)}
              onSuccess={async () => {
                setEditingRecipe(null);
                await refetchRecipes();
              }}
            />
          )}

          {isCreating && (
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
      className="flex max-h-[130px] min-w-[400px] flex-1 cursor-pointer rounded bg-white shadow-sm transition-all ease-in-out hover:scale-[1.02]"
      onClick={onClick}
    >
      <div>
        <img
          className="h-[130px] w-[130px] min-w-[130px] rounded-l object-cover"
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
  recipe: FullRecipe;
  isFullscreen?: boolean;
  onClose: () => void;
  onEditClick: () => void;
  onFullscreenClick: () => void;
}) => {
  return (
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
          <ArrowLeft></ArrowLeft>
        </button>
      </div>

      <img
        className="h-[400px] w-full object-cover object-center"
        src={recipe.imageUrl!}
        alt=""
      />
      <div className="flex flex-col p-4 pb-20">
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
        {recipe.instructions && (
          <>
            <h3 className="mb-2 text-xl font-bold text-slate-700">
              Instructions
            </h3>
            <p className="whitespace-pre-wrap text-sm">{recipe.instructions}</p>
          </>
        )}

        <h3 className="mb-2 mt-6 text-xl font-bold text-slate-700">
          Ingredients
        </h3>

        <div>
          {recipe.ingredients.map((ingredient) => (
            <div
              className="flex items-center border-b border-gray-200 px-4 py-2 first-of-type:border-t"
              key={ingredient.id + ingredient.name}
            >
              <div className="mr-4 w-10 text-right ">
                {/* convert decimal ingredient.quantity to nearest fraction */}
                {ingredient.quantity && (
                  <span className="text-sm text-gray-500">
                    {convertNumberToFractionIfNeeded(ingredient.quantity)}
                  </span>
                )}{' '}
              </div>
              <div className="mr-8 w-10 ">{ingredient.unit}</div>
              {ingredient.name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// display a decimal as a fraction
// 1.5 should show as 1 1/2
// 1 should show as 1
const convertNumberToFractionIfNeeded = (decimal: number) => {
  const wholeNumber = Math.floor(decimal);
  const remainder = decimal - wholeNumber;
  const fraction = convertDecimalToFraction(remainder);

  return fraction
    ? wholeNumber
      ? `${wholeNumber} ${fraction}`
      : fraction
    : wholeNumber;
};

const convertDecimalToFraction = (decimal: number) => {
  // if not a decimal, return
  if (decimal % 1 === 0) {
    return decimal;
  }

  const tolerance = 1.0e-6;
  let h1 = 1;
  let h2 = 0;
  let k1 = 0;
  let k2 = 1;
  let b = decimal;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

  return `${h1}/${k1}`;
};
