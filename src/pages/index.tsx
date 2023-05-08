import { type NextPage } from 'next';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { useUser } from '@clerk/nextjs';

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  const recipes = [
    {
      name: 'One-Pot Creamy Chicken Orzo',
      imageUrl:
        'https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_center,w_730,h_913/k%2FPhoto%2FSeries%2F2020-06-Snapshot-5-Quick-Dinners-That-Start-with-Rotisserie-Chicken%2FSnapshot-Rotisserie-Chicken_Cheesy-Orzo-Spinach%2F2020-06-08_AT-K19129',
      recipeTypes: [
        { name: 'Chicken', icon: '🍗' },
        { name: 'Veggie', icon: '🥦' },
        { name: 'Cheesy', icon: '🧀' },
        { name: 'Pasta', icon: '🍝' },
      ],
    },
    {
      name: 'Ground Beef Stuffed Peppers',
      imageUrl:
        'https://www.vindulge.com/wp-content/uploads/2020/04/Stuffed-Peppers-with-Ground-Beef-Cooked-on-the-Grill.jpg',
      recipeTypes: [
        { name: 'Veggie', icon: '🥦' },
        { name: 'Rice', icon: '🍚' },
        { name: 'Beef', icon: '🥩' },
      ],
    },
    {
      name: 'Shrimp Salad',
      imageUrl:
        'https://www.primaverakitchen.com/wp-content/uploads/2018/08/Super-Fresh-Shrimp-Tomato-Salad-Primavera-Kitchen-5.jpg',
      recipeTypes: [
        { name: 'Veggie', icon: '🥦' },
        { name: 'Shrimp', icon: '🍤' },
        { name: 'Salad', icon: '🥗' },
      ],
    },
  ];
  return (
    <div className="flex h-screen w-screen flex-col items-center bg-slate-200 lg:flex-row">
      <div className="flex-1 border-r lg:border-r-slate-400">
        <div className="flex flex-col items-center justify-center py-6">
          <p className="mb-4 text-6xl">🥘 📖</p>
          <h1 className="text-6xl font-bold">Recipe Book</h1>

          <p className="mt-6 max-w-[300px] text-center">
            A simple app to help you organize your recipes and plan your meals
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-y-3 p-6">
          {recipes.map((recipe) => (
            <RecipeCard recipe={recipe} key={recipe.name} />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <p>
            Built by{' '}
            <a
              className="underline hover:scale-110 "
              target="_blank"
              href="https://dylan.clemann.com"
            >
              Dylan Clemann
            </a>
          </p>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="flex w-full max-w-[500px] flex-col items-center justify-center rounded bg-white px-4 py-12 text-center shadow lg:px-8">
            <div className="border-b border-b-slate-300 pb-10">
              <h2 className="text-xl font-bold">
                Browse Recipes created and shared by other users
              </h2>
              <p className="mb-6 text-slate-700">
                No need to sign in or create an account
              </p>

              <Link href="/shared-recipes" passHref>
                <Button className="max-w-96 w-full">Browse Recipes</Button>
              </Link>
            </div>

            <div className="mt-10">
              <h2 className=" text-xl font-bold">
                Create an account to save your own recipes
              </h2>
              <p className="mb-6 text-slate-700">
                And create your own meal plans
              </p>

              {!isSignedIn ? (
                <>
                  <Link href="/signup" passHref>
                    <Button className="max-w-96 w-full">Sign Up</Button>
                  </Link>
                  <p className="mt-6">
                    Already have an account?{' '}
                    <Link
                      href="/sign-in"
                      passHref
                      className="underline hover:scale-110"
                    >
                      Log In
                    </Link>
                  </p>
                </>
              ) : (
                <Link href="/recipes" passHref>
                  <Button className="max-w-96 w-full">
                    You are already signed in. Go to Recipes
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

const RecipeCard = ({
  recipe,
}: {
  recipe: {
    name: string;
    imageUrl: string;
    recipeTypes: { name: string; icon: string }[];
  };
}) => {
  return (
    <div className="m flex w-full  max-w-[400px] flex-1  rounded bg-white shadow-sm transition-all ease-in-out hover:scale-[1.02]">
      <div>
        <img
          className="h-[150px] w-[130px] min-w-[130px] rounded-l object-cover"
          src={recipe.imageUrl}
          alt={recipe.name}
        />
      </div>
      <div className="flex flex-col p-3">
        <h3 className="mb-2 text-lg font-bold">{recipe.name}</h3>

        <div className="flex flex-wrap gap-2">
          {recipe.recipeTypes.map((recipeType) => (
            <div
              className="flex h-6 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-xs tracking-wide "
              key={recipeType.name}
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
