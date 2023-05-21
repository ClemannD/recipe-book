import clsx from 'clsx';
import { useEffect, useState } from 'react';
import RecipeCard from '../../components/recipes/recipe-card';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipeForm from '../../components/recipes/recipe-form';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { Button } from '../../components/ui/button';
import { PlainInput } from '../../components/ui/input-plain';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast/use-toast';
import { type FullRecipe } from '../../models/model';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';
import { PlusCircle } from 'lucide-react';

const RecipesPage = () => {
  const { toast, dismiss } = useToast();
  const router = useRouter();

  // Window control states
  const [isCreating, setIsCreating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);

  // Recipe states
  const [recipesToShow, setRecipesToShow] = useState<FullRecipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<FullRecipe | null>(null);

  // Search and filter states
  const [search, setSearch] = useState('');
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<string[] | null>(
    null
  );

  // Data fetching
  const {
    data: recipesData,
    isLoading,
    refetch: refetchRecipes,
  } = api.recipe.getRecipes.useQuery();

  const { data: recipeTypes, isLoading: recipeTypesIsLoading } =
    api.recipeType.getRecipeTypes.useQuery();

  useEffect(() => {
    if (!!router.query.create) {
      setIsCreating(true);
      setIsExpanded(true);
    } else if (
      router.query.recipeId &&
      router.query.recipeId[0] &&
      recipesData &&
      !firstLoadComplete
    ) {
      const foundRecipe =
        recipesData.find((recipe) => recipe.id === router.query.recipeId![0]) ??
        null;

      if (foundRecipe) {
        setIsExpanded(true);
        setSelectedRecipe(foundRecipe);
      } else {
        void router.push('/recipes');
      }
      setFirstLoadComplete(true);
    }
  }, [recipesData, router.query]);

  /**
   * Filter the recipes to show based on the search and filter states
   */
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

      setRecipesToShow(recipesToShow);
    }
  }, [recipesData, search, recipeTypeFilter]);

  const createRecipeClickHandler = () => {
    if (editingRecipe) {
      toast({
        title: `You are currently ${
          isCreating ? 'creating' : 'editing'
        } a recipe`,
        description: 'Are you sure you want to switch recipes?',
        duration: 5000,

        action: (
          <Button
            variant={'destructive'}
            onClick={() => {
              setIsCreating(true);
              setSelectedRecipe(null);
              setEditingRecipe(null);
              setIsExpanded(true);

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
    setIsExpanded(true);
  };

  return (
    <RecipesPageLayout
      isExpanded={isExpanded}
      isFullScreen={isFullScreen}
      leftChildren={
        <>
          <div className="mb-4 flex flex-col flex-wrap items-start justify-between gap-6 md:flex-row md:items-end lg:mb-10">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <div>
                <h1 className="text-2xl font-bold">Recipes</h1>
                <h2 className="mt-1 text-gray-600">
                  Your collection of recipes
                </h2>
              </div>
              <Button
                className="lg:hidden"
                variant="outline"
                onClick={createRecipeClickHandler}
              >
                <PlusCircle />
              </Button>
            </div>
            <div className="flex w-full flex-col flex-wrap justify-end gap-4 lg:w-auto lg:flex-row">
              <PlainInput
                placeholder="🔎  Search by recipe name, ingredient, or recipe type"
                value={search}
                className="lg:w-[400px]"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />

              <Button
                className="hidden lg:block"
                onClick={createRecipeClickHandler}
              >
                Create
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-1">
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
                    : 'border bg-white'
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

          <div className={clsx('flex flex-wrap gap-2 lg:gap-4')}>
            {isLoading &&
              Array.from(Array(20).keys()).map((i) => (
                <Skeleton
                  key={i}
                  className="h-[150px] min-w-[400px] max-w-[600px] flex-1"
                />
              ))}

            {recipesToShow?.length === 0 && (
              <div className="flex w-full items-center justify-center gap-4 py-8">
                <div className="rounded border bg-white p-6 text-center">
                  <h1 className="mb-2 text-2xl font-bold">No recipes found</h1>
                  <h2 className="text-gray-600">
                    Try changing your search or filter, or create a new recipe
                  </h2>
                </div>
              </div>
            )}

            {recipesToShow?.map((recipe) => (
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
                          variant={'destructive'}
                          onClick={() => {
                            setEditingRecipe(null);
                            setIsCreating(false);
                            setSelectedRecipe(recipe);
                            setIsExpanded(true);

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
            <div className="h-1 min-w-[300px] max-w-[600px] flex-1"></div>
            <div className="h-1 min-w-[300px] max-w-[600px] flex-1"></div>
            <div className="h-1 min-w-[300px] max-w-[600px] flex-1"></div>
          </div>
        </>
      }
      rightChildren={
        <>
          {!editingRecipe && (
            <RecipeDisplay
              recipe={selectedRecipe}
              isFullscreen={isFullScreen}
              onClose={() => {
                setIsExpanded(false);
                setIsFullScreen(false);
                void router.push('/recipes');
              }}
              onEditClick={() => setEditingRecipe(selectedRecipe)}
              onFullscreenClick={() => setIsFullScreen(!isFullScreen)}
            />
          )}

          {editingRecipe && !isCreating && (
            <RecipeForm
              recipe={editingRecipe}
              onClose={() => {
                if (editingRecipe) {
                  toast({
                    title: `You are currently editing a recipe`,
                    description: 'Are you sure you want to close?',
                    duration: 5000,

                    action: (
                      <Button
                        variant={'destructive'}
                        onClick={() => {
                          setEditingRecipe(null);
                          setIsCreating(false);
                          setSelectedRecipe(null);
                          setIsExpanded(false);

                          dismiss();
                        }}
                      >
                        Discard
                      </Button>
                    ),
                  });
                  return;
                }
                setEditingRecipe(null);
              }}
              onSuccess={async () => {
                setEditingRecipe(null);
                await refetchRecipes();
                setSelectedRecipe(
                  recipesData?.find(
                    (recipe) => recipe.id === selectedRecipe?.id
                  ) ?? null
                );
              }}
              onDelete={async () => {
                setEditingRecipe(null);
                await refetchRecipes();
                setSelectedRecipe(null);
                setIsExpanded(false);
              }}
            />
          )}

          {isCreating && !editingRecipe && (
            <RecipeForm
              onClose={() => {
                if (isCreating) {
                  toast({
                    title: `You are currently creating a recipe`,
                    description: 'Are you sure you want to close?',
                    duration: 5000,

                    action: (
                      <Button
                        variant={'destructive'}
                        onClick={() => {
                          setEditingRecipe(null);
                          setIsCreating(false);
                          setSelectedRecipe(null);
                          setIsExpanded(false);

                          dismiss();
                        }}
                      >
                        Discard
                      </Button>
                    ),
                  });
                  return;
                }
                setIsExpanded(false);
                setIsCreating(false);
              }}
              onSuccess={async () => {
                setIsCreating(false);
                setIsExpanded(false);
                await refetchRecipes();
                setSelectedRecipe(
                  recipesData?.find(
                    (recipe) => recipe.id === selectedRecipe?.id
                  ) ?? null
                );
              }}
            />
          )}
        </>
      }
    />
  );
};

export default RecipesPage;
