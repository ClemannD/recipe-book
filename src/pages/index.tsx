import { type NextPage } from "next";

import { api } from "~/utils/api";
import Layout from "../components/layout";

const Home: NextPage = () => {
  const { data } = api.household.getAll.useQuery();

  console.log(data);

  return (
    <>
      <Layout>
        <main className="flex min-h-screen  bg-gradient-to-b from-[#c9e2f0] to-[#f5f5f5]"></main>
      </Layout>
    </>
  );
};

export default Home;
