import Head from 'next/head';
import { Button } from './ui/button';

const Layout = (props: { children: React.ReactNode; title?: string }) => {
  return (
    <>
      <Head>
        <title>{props.title ?? 'Home'} | Recipe Book</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>
              <text y=%22.9em%22 font-size=%2290%22>
                🥘
              </text>
            </svg>"
        ></link>
      </Head>

      <div className="flex flex-col lg:flex-row">
        <Navbar />
        <NavbarMobile />

        <div className="flex-grow overflow-x-hidden">{props.children}</div>
      </div>
    </>
  );
};

export default Layout;

import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { api } from '../utils/api';
import Input from './forms/input';
import Navbar from './navbar';
import NavbarMobile from './navbar-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export function HouseholdDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: household,
    isFetched,
    refetch,
  } = api.household.getCurrentUserHousehold.useQuery();

  const { mutate: createHousehold, isLoading: isCreatingHousehold } =
    api.household.createHousehold.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  useEffect(() => {
    if (isFetched) {
      setIsOpen(!household);
    }
  }, [household, isFetched]);

  const householdFormSchema = z.object({
    householdName: z.string().min(1),
  });

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Household</DialogTitle>
          <DialogDescription>
            A household is a group of people who share recipes and meal plans.
            Recipes made under a household are private to the household by
            default, but can be set to be shared publicly.
            <br />
            <br />
            Once you create a household, you can invite others to join (This
            feature is coming soon).
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            householdName: '',
          }}
          validationSchema={toFormikValidationSchema(householdFormSchema)}
          onSubmit={(values) => {
            createHousehold(values);
          }}
        >
          <Form>
            <Input label="🏡 Household Name" name="householdName"></Input>

            <DialogFooter>
              <Button type="submit" isSubmitting={isCreatingHousehold}>
                Create
              </Button>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
