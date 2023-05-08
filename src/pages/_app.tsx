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
      </Head>
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
    </>
  );
}

export default api.withTRPC(MyApp);
