import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RecipeCard from '../../components/recipes/recipe-card';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { Button } from '../../components/ui/button';
import { PlainInput } from '../../components/ui/input-plain';
import { Skeleton } from '../../components/ui/skeleton';
import { type FullRecipe } from '../../models/model';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';

const SharedRecipesPage = () => {
  const router = useRouter();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [recipesToShow, setRecipesToShow] = useState<FullRecipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);

  const [search, setSearch] = useState('');

  const { data: recipesData, isLoading } =
    api.recipe.getPublicRecipes.useQuery();

  /**
   * Updates the selected recipe when the recipes data changes (e.g. when a recipe is created/updated)
   */
  useEffect(() => {
    setIsExpanded(!!selectedRecipe);

    setSelectedRecipe(
      recipesData?.find((recipe) => recipe.id === selectedRecipe?.id) ?? null
    );
  }, [recipesData, selectedRecipe]);

  useEffect(() => {
    if (router.query.recipe && recipesData) {
      setIsExpanded(true);
      setSelectedRecipe(
        recipesData?.find((recipe) => recipe.id === router.query.recipe) ?? null
      );
    }
  }, [recipesData, router.query.create, router.query.recipe]);

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

      setRecipesToShow(recipesToShow);
    }
  }, [recipesData, search]);

  return (
    <RecipesPageLayout
      isExpanded={isExpanded}
      isFullScreen={isFullScreen}
      leftChildren={
        <>
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-bold">Shared Recipes</h1>
              <h2 className="mt-1 text-gray-600">
                Recipes created and shared by other users
              </h2>
            </div>
            <div className="flex flex-grow justify-end gap-4">
              <PlainInput
                placeholder="🔎  Search, by recipe name, ingredient, or recipe type"
                value={search}
                className="w-96"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />

              <Link href="/recipes?create=true">
                <Button>Create</Button>
              </Link>
            </div>
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
                  isOnPublicPage
                  recipe={recipe}
                  onClick={() => {
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
        <RecipeDisplay
          recipe={selectedRecipe}
          isOnPublicPage={true}
          isFullscreen={isFullScreen}
          onClose={() => {
            setIsExpanded(false);
            setIsFullScreen(false);
          }}
          onFullscreenClick={() => setIsFullScreen(!isFullScreen)}
        />
      }
    />
  );
};

export default SharedRecipesPage;
