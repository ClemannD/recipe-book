import { type FullRecipe } from '../../models/model';

const RecipeCard = ({
  recipe,
  isOnPublicPage = false,
  onClick,
}: {
  recipe: FullRecipe;
  isOnPublicPage?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex flex-1 cursor-pointer rounded bg-white shadow-sm transition-all ease-in-out hover:scale-[1.02] max-[330px]:flex-col lg:min-w-[400px]"
      onClick={onClick}
    >
      <div>
        <img
          className="h-[150px] w-[130px] min-w-[130px] rounded-l object-cover"
          src={recipe.imageUrl!}
          alt={recipe.name}
        />
      </div>
      <div className="flex w-full flex-col p-3">
        <div className="flex w-full justify-between">
          <h3 className="mb-2 font-bold md:text-lg">{recipe.name}</h3>
          {recipe.isPublic && !isOnPublicPage && (
            <div className="ml-2 mt-1 flex h-5 w-5 min-w-[20px] items-center justify-center rounded bg-slate-800  text-xs font-medium text-white">
              P
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {recipe.recipeTypes.map((recipeType) => (
            <div
              className="flex h-4 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-[10px] tracking-wide md:h-6 md:text-xs "
              key={recipeType.id + recipeType.name + recipeType.icon}
            >
              {recipeType.icon}{' '}
              <span className="ml-2 text-[10px] font-medium md:text-xs ">
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
