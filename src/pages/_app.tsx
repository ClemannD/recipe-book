import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '~/styles/globals.css';
import { api } from '~/utils/api';
import { Toaster } from '../components/ui/toast/toaster';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';
import { NavbarStateProvider } from '../utils/context/navbarState.context';

const publicPages = [
  '/sign-in/[[...index]]',
  '/sign-up/[[...index]]',
  '/',
  '/shared-recipes',
  '/shared-recipes/[[...recipeId]]',
];

function MyApp({ Component, pageProps }: AppProps) {
  // Get the pathname
  const { pathname } = useRouter();

  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);

  // If the current route is listed as public, render it directly
  // Otherwise, use Clerk to require authentication
  return (
    <>
      <Analytics />
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        ></meta>
        <meta property="og:title" content="Recipe Book"></meta>
        <meta
          property="og:description"
          content="A simple app for storing and sharing recipes"
        ></meta>
        <meta property="og:type" content="website"></meta>
        <meta property="og:url" content="https://recipes.clemann.app/"></meta>
        <meta
          property="og:image"
          content="https://recipes.clemann.app/recipe-book-cover.png"
        ></meta>
      </Head>
      <NavbarStateProvider>
        <ClerkProvider {...pageProps}>
          {isPublicPage ? (
            <>
              <Component {...pageProps} />
              <Toaster />
            </>
          ) : (
            <>
              <SignedIn>
                <Toaster />
                <Component {...pageProps} />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}
        </ClerkProvider>
      </NavbarStateProvider>
    </>
  );
}

export default api.withTRPC(MyApp);
