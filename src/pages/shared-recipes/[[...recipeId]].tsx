import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import RecipeCard from '../../components/recipes/recipe-card';
import RecipeDisplay from '../../components/recipes/recipe-display';
import RecipesPageLayout from '../../components/recipes/recipes-page';
import { PlainInput } from '../../components/ui/input-plain';
import { Skeleton } from '../../components/ui/skeleton';
import { type FullRecipe } from '../../models/model';
import { api } from '../../utils/api';

const SharedRecipesPage = () => {
  const router = useRouter();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);

  const [recipesToShow, setRecipesToShow] = useState<FullRecipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);

  const [search, setSearch] = useState('');

  const { data: recipesData, isLoading } =
    api.recipe.getPublicRecipes.useQuery();

  /**
   * If the user navigates to a recipe page, expand the recipe display
   */
  useEffect(() => {
    if (
      router.query.recipeId &&
      router.query.recipeId[0] &&
      recipesData &&
      !firstLoadComplete
    ) {
      setIsExpanded(true);
      setSelectedRecipe(
        recipesData.find((recipe) => recipe.id === router.query.recipeId![0]) ??
          null
      );
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
              ) ||
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              (recipe.createdBy.fullName ?? '')
                .toLowerCase()
                .includes(search.toLowerCase())
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
          <div className="mb-4 flex flex-col flex-wrap items-start justify-between gap-6 pt-16 lg:mb-10 lg:flex-row lg:items-end lg:pt-0">
            <div>
              <h1 className="text-2xl font-bold">Shared Recipes</h1>
              <h2 className="mt-1 text-gray-600">
                Recipes created and shared by other users
              </h2>
            </div>
            <div className="flex w-full flex-col flex-wrap justify-end gap-4 lg:w-auto lg:flex-row">
              <PlainInput
                placeholder="🔎  Search by recipe name, ingredient, type, or creator"
                value={search}
                className="lg:w-[500px] "
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />

              {/* <Link className="w-full" href="/recipes?create=true">
                <Button className="w-full">Create</Button>
              </Link> */}
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
            void router.push('/shared-recipes');
          }}
          onFullscreenClick={() => setIsFullScreen(!isFullScreen)}
        />
      }
    />
  );
};

export default SharedRecipesPage;
