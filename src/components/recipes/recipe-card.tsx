/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { type FullRecipe } from '../../models/model';
import { defaultRecipeImageUrl } from '../../constants';

const RecipeCard = ({
  recipe,
  isOnPublicPage = false,
  navigateOnClick = true,
  onClick,
}: {
  recipe: FullRecipe;
  isOnPublicPage?: boolean;
  navigateOnClick?: boolean;
  onClick: () => void;
}) => {
  const router = useRouter();

  return (
    <div
      className="flex max-h-[110px] min-h-[110px] min-w-[300px] flex-1 cursor-pointer rounded border bg-white transition ease-in-out hover:scale-[1.02] lg:min-w-[400px]"
      onClick={() => {
        if (navigateOnClick) {
          if (isOnPublicPage) {
            void router.replace(`/shared-recipes/${recipe.id}`, undefined, {
              scroll: false,
            });
          } else {
            void router.replace(`/recipes/${recipe.id}`, undefined, {
              scroll: false,
            });
          }
        }

        onClick();
      }}
    >
      <img
        className="h-auto w-[100px] min-w-[100px] rounded-l object-cover "
        src={
          recipe.imageUrl !== '' ? recipe.imageUrl ?? '' : defaultRecipeImageUrl
        }
        alt={recipe.name}
      />
      <div className="line flex w-full flex-col p-3">
        <div className="flex w-full justify-between">
          <h3 className="line-clamp-2 font-bold leading-[1.2em] md:text-lg lg:leading-[1.2em]">
            {recipe.name}
          </h3>
          {recipe.isPublic && !isOnPublicPage && (
            <div className="ml-2 flex h-4 w-4 min-w-[16px] items-center justify-center rounded bg-slate-800  text-[10px] font-medium text-white">
              P
            </div>
          )}
        </div>
        <p className="mb-2 text-[10px] italic text-slate-500 ">
          Created By {recipe.createdBy.fullName}
        </p>

        <div className="line-clamp-2 flex flex-wrap gap-1 gap-y-1 ">
          {recipe.recipeTypes.map((recipeType) => (
            <div
              className="flex h-4 w-auto items-center justify-center rounded-full border bg-slate-100 p-2 text-[10px] tracking-wide"
              key={recipeType.id + recipeType.name + recipeType.icon}
            >
              {recipeType.icon}{' '}
              <span className="ml-2 text-[10px] font-medium  ">
                {recipeType.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
