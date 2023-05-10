import Layout from '../../components/layout';

const MealPlansPage = () => {
  return (
    <Layout>
      <div className="p-4 pt-20 lg:p-10 lg:pt-10">
        <div>
          <h1 className="text-2xl font-bold">Meal Plans</h1>
          <h2 className="mt-1 text-gray-600">Plan your meals for the week</h2>
        </div>

        <div className="flex w-full items-center justify-center gap-4 py-8">
          <div className="rounded bg-white p-6 text-center shadow">
            <h1 className="mb-2 text-2xl font-bold">
              This page is a work in progress
            </h1>
            <h2 className="text-gray-600">Check back soon</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MealPlansPage;
