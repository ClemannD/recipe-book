/* eslint-disable @next/next/no-img-element */
import { useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { defaultRecipeImageUrl } from '../constants';
import { Globe2 } from 'lucide-react';

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen w-screen bg-slate-50">
      <div className="w-full border-b bg-white">
        <div className="container flex h-20 items-center justify-between">
          <h1 className="font-merri text-3xl font-bold">
            🥘 📖 <span className="ml-3">Recipe Book</span>
          </h1>

          <div className="flex gap-10">
            <Link href="/shared-recipes" passHref>
              <Button variant="ghost">
                <Globe2 className="mr-2" /> Shared Recipes
              </Button>
            </Link>
            <Link href="/sign-in" passHref>
              <Button>Sign In / Sign up</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container flex justify-between py-20">
        <div className="py-20">
          <p className="font-bold">
            The easiest way to organize, save, and share recipes
          </p>
          <br />
          <p className="">With Recipe Book, you can:</p>
          <br />
          <ul className="max-w-lg list-disc pl-5">
            <li>
              Find recipes from a variety of sources, including cookbooks,
              websites, and even your own personal collection.
            </li>
            <br />
            <li>
              Save recipes that you love so you can easily find them again
              later.
            </li>
            <br />
            <li>
              Share recipes with your household so everyone can see what&apos;s
              for dinner.
            </li>
            <br />
            <li>
              Recipe Book is the perfect way to stay organized in the kitchen
              and make mealtime more enjoyable for everyone.
            </li>
          </ul>
        </div>
        <div className="flex-grow pl-8">
          <img
            src="https://recipes.clemann.app/recipes-page.png"
            className="h-auto w-full rounded-lg shadow-lg"
            alt=""
          />
        </div>
      </div>
    </div>
    // <div className="flex h-screen w-screen flex-col items-center bg-slate-50 lg:flex-row">
    //   <div className="flex-1 border-r lg:border-r-slate-400">
    //     <div className="flex flex-col items-center justify-center py-6 pt-12 lg:pt-6">
    //       <p className="mb-4 text-6xl">🥘 📖</p>
    //       <h1 className="font-merri text-6xl font-bold">Recipe Book</h1>

    //       <p className="mt-6 max-w-[300px] text-center">
    //         A simple app to help you organize your recipes and plan your meals
    //       </p>
    //     </div>

    //     <div className="hidden flex-col items-center justify-center gap-y-3 p-6 lg:flex">
    //       {/* {recipes.map((recipe) => (
    //         <RecipeCard recipe={recipe} key={recipe.name} />
    //       ))} */}
    //     </div>

    //     <div className="hidden flex-col items-center justify-center py-6 lg:flex">
    //       <p>
    //         Built by{' '}
    //         <a
    //           className="underline hover:scale-110 "
    //           target="_blank"
    //           href="https://dylan.clemann.com"
    //         >
    //           Dylan Clemann
    //         </a>
    //       </p>
    //     </div>
    //   </div>

    //   <div className="flex-1">
    //     <div className="flex flex-col items-center justify-center py-6">
    //       <div className="flex w-full max-w-[500px] flex-col items-center justify-center rounded border bg-white px-4 py-12 text-center lg:px-8">
    //         <div className="border-b border-b-slate-300 pb-10">
    //           <h2 className="text-xl font-bold">
    //             Browse Recipes created and shared by other users
    //           </h2>
    //           <p className="mb-6 text-slate-700">
    //             No need to sign in or create an account
    //           </p>

    //           <Link href="/shared-recipes" passHref>
    //             <Button className="max-w-96 w-full">Browse Recipes</Button>
    //           </Link>
    //         </div>

    //         <div className="mt-10">
    //           <h2 className=" text-xl font-bold">
    //             Create an account to save your own recipes
    //           </h2>
    //           <p className="mb-6 text-slate-700">
    //             And create your own meal plans
    //           </p>

    //           {!isSignedIn ? (
    //             <>
    //               <Link href="/sign-up" passHref>
    //                 <Button className="max-w-96 w-full">Sign Up</Button>
    //               </Link>
    //               <p className="mt-6">
    //                 Already have an account?{' '}
    //                 <Link
    //                   href="/sign-in"
    //                   passHref
    //                   className="underline hover:scale-110"
    //                 >
    //                   Log In
    //                 </Link>
    //               </p>
    //             </>
    //           ) : (
    //             <Link href="/recipes" passHref>
    //               <Button className="max-w-96 w-full">
    //                 You are already signed in. Go to Recipes
    //               </Button>
    //             </Link>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Home;

// const RecipeCard = ({
//   recipe,
// }: {
//   recipe: {
//     name: string;
//     imageUrl: string;
//     recipeTypes: { name: string; icon: string }[];
//     path: string;
//   };
// }) => {
//   return (
//     <Link href={recipe.path}>
//       <div className="m flex w-full  max-w-[400px] flex-1  rounded border bg-white transition-all ease-in-out hover:scale-[1.02]">
//         <div>
//           <img
//             className="h-[150px] w-[130px] min-w-[130px] rounded-l object-cover"
//             src={
//               recipe.imageUrl !== ''
//                 ? recipe.imageUrl ?? ''
//                 : defaultRecipeImageUrl
//             }
//             alt={recipe.name}
//           />
//         </div>
//         <div className="flex flex-col p-3">
//           <h3 className="mb-2 text-lg font-bold">{recipe.name}</h3>

//           <div className="flex flex-wrap gap-2">
//             {recipe.recipeTypes.map((recipeType) => (
//               <div
//                 className="flex h-6 w-auto items-center justify-center rounded-full bg-slate-200 p-2 text-xs tracking-wide "
//                 key={recipeType.name}
//               >
//                 {recipeType.icon}{' '}
//                 <span className="ml-2 text-xs font-medium ">
//                   {recipeType.name}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };
