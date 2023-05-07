import clsx from 'clsx';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import RecipeCard from '../../components/recipes/recipe-card';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipeForm from '../../components/recipes/recipe-form';
import { Button } from '../../components/ui/button';
import { PlainInput } from '../../components/ui/input-plain';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast/use-toast';
import { type FullRecipe } from '../../models/model';
import { api } from '../../utils/api';
import { cn } from '../../utils/cn';
import RecipesPageLayout from '../../components/recipes/recipes-page';

const RecipesPage = () => {
  const { toast, dismiss } = useToast();

  // Window control states
  const [isCreating, setIsCreating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  /**
   * Updates the selected recipe when the recipes data changes (e.g. when a recipe is created/updated)
   */
  useEffect(() => {
    setIsExpanded(!!selectedRecipe);

    setSelectedRecipe(
      recipesData?.find((recipe) => recipe.id === selectedRecipe?.id) ?? null
    );
  }, [recipesData, selectedRecipe]);

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

  return (
    <RecipesPageLayout
      isExpanded={isExpanded}
      isFullScreen={isFullScreen}
      leftChildren={
        <>
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
        </>
      }
    />
  );
};

export default RecipesPage;
