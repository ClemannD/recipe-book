import { useRouter } from 'next/router';
import { type FullRecipe } from '../../models/model';

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
      className="flex min-h-[100px] min-w-[300px] flex-1 cursor-pointer rounded bg-white shadow-sm transition-all ease-in-out hover:scale-[1.02] max-[430px]:flex-col lg:max-h-[150px] lg:min-h-[150px] lg:min-w-[400px]"
      onClick={() => {
        if (navigateOnClick) {
          if (isOnPublicPage) {
            void router.replace(`/shared-recipes/${recipe.id}`);
          } else {
            void router.push(`/recipes/${recipe.id}`);
          }
        }

        onClick();
      }}
    >
      <img
        className="h-auto w-[130px] min-w-[130px] rounded-l object-cover max-[430px]:h-[125px] max-[430px]:w-full"
        src={recipe.imageUrl!}
        alt={recipe.name}
      />
      <div className="flex w-full flex-col p-3">
        <div className="flex w-full justify-between">
          <h3 className="font-bold md:text-lg">{recipe.name}</h3>
          {recipe.isPublic && !isOnPublicPage && (
            <div className="ml-2 mt-1 flex h-5 w-5 min-w-[20px] items-center justify-center rounded bg-slate-800  text-xs font-medium text-white">
              P
            </div>
          )}
        </div>
        <p className="mb-3 text-[10px] italic text-slate-500 ">
          Created By {recipe.createdBy.fullName}
        </p>

        <div className="flex flex-wrap gap-2">
          {recipe.recipeTypes.map((recipeType) => (
            <div
              className="flex h-4 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-[10px] tracking-wide  "
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
