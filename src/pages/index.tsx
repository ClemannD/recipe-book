import { type NextPage } from 'next';

import { api } from '~/utils/api';
import Layout from '../components/layout';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import Input from '../components/forms/input';
import Button, { ButtonSize } from '../components/button';

const Home: NextPage = () => {
  const { data: household, isLoading } =
    api.household.getCurrentUserHousehold.useQuery();

  console.log(household);

  const householdFormSchema = z.object({
    householdName: z.string().min(1),
  });

  return (
    <>
      <Layout>
        <main>
          {!household && !isLoading && (
            <div className="flex flex-col items-center justify-center">
              <div className="mt-10  w-96 rounded-sm bg-white p-4 shadow-lg">
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
                    console.log(values);
                  }}
                >
                  <Form>
                    <Input
                      label="🏡 Household Name"
                      name="householdName"
                    ></Input>

                    <Button type="submit" size={ButtonSize.Block}>
                      Create
                    </Button>
                  </Form>
                </Formik>
              </div>
            </div>
          )}
        </main>
      </Layout>
    </>
  );
};

export default Home;
