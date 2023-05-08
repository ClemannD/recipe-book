import clsx from 'clsx';
import { Expand, Minimize, X } from 'lucide-react';
import { type FullRecipe } from '../../models/model';
import { roundToCleanFraction } from '../../utils/round-fraction';
import { Button } from '../ui/button';

const RecipeDisplay = ({
  recipe,
  isFullscreen,
  isOnPublicPage = false,
  onClose,
  onEditClick = () => {},
  onFullscreenClick,
}: {
  recipe: FullRecipe | null;
  isFullscreen?: boolean;
  isOnPublicPage?: boolean;
  onClose: () => void;
  onEditClick?: () => void;
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
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className=" text-2xl font-bold">{recipe.name} </h2>
                  <p className="text-xs italic text-slate-500">
                    Created By {recipe.createdBy.fullName} - Last Updated{' '}
                    {new Date(recipe.updatedAt).toLocaleString()}
                  </p>
                </div>

                {!isOnPublicPage && (
                  <div className="flex items-center gap-4">
                    {recipe.isPublic && (
                      <div className="rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white">
                        Public
                      </div>
                    )}
                    <Button variant={'secondary'} onClick={() => onEditClick()}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              <div></div>

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

export default RecipeDisplay;
