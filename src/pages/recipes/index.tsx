import { type Ingredient, type Recipe, type RecipeType } from '@prisma/client';
import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Layout from '../../components/layout';
import RecipeForm from '../../components/recipe-form';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast/use-toast';
import { api } from '../../utils/api';

export type FullRecipe = Recipe & {
  recipeTypes: RecipeType[];
  ingredients: Ingredient[];
};

const RecipesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<FullRecipe | null>(null);

  const {
    data: recipes,
    isLoading,
    refetch: refetchRecipes,
  } = api.recipe.getRecipes.useQuery(undefined, {
    onSuccess: (data) => {
      if (selectedRecipe) {
        setSelectedRecipe(
          data.find((recipe) => recipe.id === selectedRecipe.id) || null
        );
      }
    },
  });

  const { toast, dismiss } = useToast();

  return (
    <Layout>
      <div className="flex">
        <div className="min-w-[550px] flex-grow p-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold">Recipes</h1>
              <h2 className="mt-1 text-xl text-gray-600">
                Your collection of recipes
              </h2>
            </div>
            <div>
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

          <div className="mt-10">
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
          className={clsx(
            `relative h-screen max-h-screen max-w-[700px] overflow-y-auto bg-white shadow-lg transition-all duration-500 ease-in-out`,
            selectedRecipe || isCreating || editingRecipe
              ? 'w-[700px] min-w-[700px]'
              : 'w-0 min-w-0'
          )}
        >
          {selectedRecipe && !editingRecipe && (
            <RecipeDisplay
              recipe={selectedRecipe}
              onClose={() => setSelectedRecipe(null)}
              onEditClick={() => setEditingRecipe(selectedRecipe)}
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
      className="flex max-h-[150px] min-w-[400px] max-w-[600px] flex-1 cursor-pointer rounded bg-white shadow-sm transition-all ease-in-out hover:scale-[1.02]"
      onClick={onClick}
    >
      <div>
        <img
          className="h-[150px] w-[150px] min-w-[150px] rounded-l object-cover"
          src={recipe.imageUrl!}
          alt={recipe.name}
        />
      </div>
      <div className="flex flex-col  p-4">
        <h3 className="mb-2 text-xl font-bold">{recipe.name}</h3>

        <div className="flex flex-wrap gap-2">
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
    </div>
  );
};

const RecipeDisplay = ({
  recipe,
  onClose,
  onEditClick,
}: {
  recipe: FullRecipe;
  onClose: () => void;
  onEditClick: () => void;
}) => {
  return (
    <>
      <div className="absolute right-0 top-0 p-4">
        <button
          className="rounded-full bg-gray-100 p-2 transition-all ease-in-out hover:bg-gray-200"
          onClick={() => onClose()}
        >
          <ArrowRight></ArrowRight>
        </button>
      </div>
      <img
        className="h-[300px] w-full object-cover object-center"
        src={recipe.imageUrl!}
        alt=""
      />
      <div className="flex flex-col p-4">
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
              <div className="w-20">
                {ingredient.quantity} {ingredient.unit}
              </div>
              {ingredient.name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
