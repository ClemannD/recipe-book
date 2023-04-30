import { type NextPage } from 'next';

import { Form, Formik } from 'formik';
import { BarLoader } from 'react-spinners';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { api } from '~/utils/api';
import Button, { ButtonSize } from '../components/button';
import Input from '../components/forms/input';
import Layout from '../components/layout';
import RecipeForm from '../components/recipe-form';
import { useState } from 'react';

const Home: NextPage = () => {
  const { data: household, isLoading } =
    api.household.getCurrentUserHousehold.useQuery();

  console.log(household);

  const householdFormSchema = z.object({
    householdName: z.string().min(1),
  });

  const { mutate: createHousehold, isLoading: isCreatingHousehold } =
    api.household.createHousehold.useMutation({
      onSuccess: () => {},
    });

  const [isSideExpanded, setIsSideExpanded] = useState(false);

  return (
    <>
      <Layout>
        <main className="h-full w-full">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <BarLoader />
            </div>
          )}

          {!household && !isLoading && (
            <div className="flex flex-col items-center justify-center">
              <div className="mt-20  w-96 rounded-sm bg-zinc-50 p-4 ">
                <h1 className="text-2xl font-bold">
                  You are not in a household
                </h1>
                <p className="mb-3">Please create one</p>

                <Formik
                  initialValues={{
                    householdName: '',
                  }}
                  validationSchema={toFormikValidationSchema(
                    householdFormSchema
                  )}
                  onSubmit={(values) => {
                    createHousehold(values);
                  }}
                >
                  <Form>
                    <Input
                      label="🏡 Household Name"
                      name="householdName"
                    ></Input>

                    <Button
                      type="submit"
                      size={ButtonSize.Block}
                      isSubmitting={isCreatingHousehold}
                    >
                      Create
                    </Button>
                  </Form>
                </Formik>
              </div>
            </div>
          )}

          {household && !isLoading && (
            <div className="flex h-full">
              <div className="min-w-[700px] p-10">
                <div className="mb-10">
                  <h1 className="text-4xl">{household?.name}</h1>
                </div>

                <RecipeList
                  toggleIsSideExpanded={() =>
                    setIsSideExpanded(!isSideExpanded)
                  }
                />
              </div>

              <div
                className={`

                bg-white 
                
                ${isSideExpanded ? 'flex-grow' : 'w-0'}

                transition-all
                duration-300

                
              
              `}
              >
                <div
                  className={`
                  p-10
                  `}
                >
                  {isSideExpanded && <RecipeForm />}
                </div>
              </div>
            </div>
          )}
        </main>
      </Layout>
    </>
  );
};

export default Home;

const RecipeList = ({
  toggleIsSideExpanded,
}: {
  toggleIsSideExpanded: (isExpanded: boolean) => void;
}) => {
  const { data: recipes, isLoading } = api.recipe.getRecipes.useQuery();

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl">Recipes</h2>
        <Button clickHandler={toggleIsSideExpanded}>Create Recipe</Button>
      </div>
      <div className="w-full flex-grow bg-white ">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <BarLoader />
          </div>
        )}

        {!isLoading &&
          recipes?.map((recipe) => (
            <div
              key={recipe.id}
              className="border-b p-4 last-of-type:border-none"
            >
              <h3 className="text-xl font-bold">{recipe.name}</h3>
              <p className="text-gray-500">{recipe.instructions}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
