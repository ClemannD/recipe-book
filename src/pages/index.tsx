/* eslint-disable @next/next/no-img-element */
import { useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { CalendarRange, Globe2, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import recipePageImage from './recipes-page.png';
import NavbarMobile from '../components/navbar-mobile';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

type RecipeType = {
  name: string;
  icon: string;
};

const defaultRecipeTypes: RecipeType[] = [
  {
    name: 'Breakfast',
    icon: '🍳',
  },
  {
    name: 'Beef',
    icon: '🥩',
  },
  {
    name: 'Chicken',
    icon: '🍗',
  },
  {
    name: 'Pork',
    icon: '🐷',
  },
  {
    name: 'Fish',
    icon: '🐟',
  },
  {
    name: 'Veggies',
    icon: '🥦',
  },
  {
    name: 'Dessert',
    icon: '🍨',
  },
  {
    name: 'Potato',
    icon: '🥔',
  },
  {
    name: 'Pasta',
    icon: '🍝',
  },
  {
    name: 'Soup',
    icon: '🍲',
  },
  {
    name: 'Salad',
    icon: '🥗',
  },
  {
    name: 'Sandwich',
    icon: '🥪',
  },
  {
    name: 'Sauce',
    icon: '🥣',
  },
  {
    name: 'Shrimp',
    icon: '🍤',
  },
  {
    name: 'Turkey',
    icon: '🦃',
  },
  {
    name: 'Rice',
    icon: '🍚',
  },
  {
    name: 'Asian',
    icon: '🍱',
  },
  {
    name: 'Mexican',
    icon: '🌮',
  },
  {
    name: 'Italian',
    icon: '🍕',
  },
  {
    name: 'Cheesy',
    icon: '🧀',
  },
  {
    name: 'Bread',
    icon: '🍞',
  },
  {
    name: 'Mediterranean',
    icon: '🥙',
  },
  {
    name: 'Indian',
    icon: '🍛',
  },
  {
    name: 'American',
    icon: '🍔',
  },
  {
    name: 'Fruit',
    icon: '🍎',
  },
  {
    name: 'Seafood',
    icon: '🦞',
  },
  {
    name: 'Drink',
    icon: '🍹',
  },
];

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  const [highlightedRecipeTypes, setHighlightedRecipeTypes] = useState<
    RecipeType[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedRecipeTypes((prev) => {
        if (prev.length === 3) {
          return [];
        } else {
          const randomIndex = Math.floor(
            Math.random() * defaultRecipeTypes.length
          );

          if (prev.includes(defaultRecipeTypes[randomIndex]!)) {
            return prev;
          } else {
            return [...prev, defaultRecipeTypes[randomIndex] as RecipeType];
          }
        }
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-slate-50">
      <NavbarMobile />
      <div className="hidden w-full border-b bg-white lg:block">
        <div className="container flex h-20 items-center justify-between">
          <h1 className="font-merri text-3xl font-bold">
            🥘 📖 <span className="ml-3">Recipe Book</span>
          </h1>

          <div className="flex gap-4">
            <Link href="/shared-recipes" passHref>
              <Button variant="ghost">
                <Globe2 className="mr-2" /> Shared Recipes
              </Button>
            </Link>
            {isSignedIn && (
              <>
                <Link href="/recipes" passHref>
                  <Button variant="ghost">
                    <UtensilsCrossed className="mr-2" /> Your Recipes
                  </Button>
                </Link>
                <Link href="/" passHref>
                  <Button variant="ghost">
                    <CalendarRange className="mr-2" /> Meal Plans
                  </Button>
                </Link>
              </>
            )}
            <Link href="/sign-in" passHref className="ml-6">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container flex flex-col items-center justify-between  lg:mb-20 lg:flex-row">
        <div className="py-20 text-center lg:w-[50%] lg:py-56 lg:pr-20 lg:text-left">
          <h1 className="mb-4 font-merri text-4xl font-bold">
            The easiest way to store and share your{' '}
            <span className="bg-gradient-to-r from-[#E6AF37] to-[#F87666] bg-clip-text font-black text-transparent">
              Recipes
            </span>
          </h1>
          <p className="text-gray-600">
            With <b>Recipe Book</b>, you can store and organize your recipes,
            share them with friends, and create meal plans all in one
            easy-to-use app.
          </p>

          <div className="mt-10">
            <Link href="/sign-up" passHref>
              <Button className="">Get Started Now</Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link
              href="/shared-recipes"
              className="text-xs font-light text-slate-500 underline transition-colors ease-in-out hover:text-slate-600"
            >
              Browse shared recipes
            </Link>
          </div>
        </div>

        <div className="-mx-4 pb-20 lg:-mr-36 lg:max-w-[70%] lg:pb-0">
          <Image
            priority
            src={recipePageImage}
            className="h-auto w-full rounded-lg border shadow-lg"
            alt=""
          />
        </div>
      </div>

      <div className="relative mb-10 w-full overflow-hidden">
        <div className="mb-6 text-center">
          <h2 className="font-merri text-2xl">
            Tag your recipes for easy organization
          </h2>
        </div>
        <div className="-mx-10 flex flex-wrap justify-center gap-x-2 gap-y-1 lg:gap-x-3 lg:gap-y-2">
          {defaultRecipeTypes.map((recipeType, index) => (
            <div
              className={clsx(
                'flex h-6 w-auto items-center justify-center rounded-full border bg-slate-100 p-2 tracking-wide transition-all duration-200 ease-in-out lg:h-8 lg:text-lg',
                highlightedRecipeTypes.includes(recipeType) &&
                  'scale-105 border-transparent bg-slate-950 text-white'
              )}
              key={recipeType.name}
            >
              {recipeType.icon}{' '}
              <span className="ml-2 font-medium  ">{recipeType.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="relative mb-10 w-full overflow-hidden">
        <div className="mb-6 text-center">
          <h2 className="font-merri text-2xl">
            Create Meal Plans for the week ahead
          </h2>
        </div>
      </div> */}

      <div className="border-t bg-white p-3">
        <div className="w-full text-center text-xs text-slate-400 ">
          Created By{' '}
          <Link
            href="https://dylan.clemann.com"
            target="_blank"
            className="hover:underline"
          >
            Dylan Clemann
          </Link>{' '}
          –{' '}
          <Link
            href="https://www.freeprivacypolicy.com/live/272f9fd6-3762-4220-916a-2af5c643ae85"
            target="_blank"
            className="hover:underline"
          >
            Privacy Policy
          </Link>{' '}
          – © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Home;
