import Head from "next/head";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Unlist from "@/components/unlist";
import List from "@/components/list";
import Rent from "@/components/rent";

export default function Me() {
  return (
    <>
      <Head>
        <title>Dephy Conduits</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container gap-12 px-4 py-16 md:min-w-[960px]">
          <Tabs defaultValue="unlist" className="text-white">
            <TabsList className="w-full justify-around bg-card text-white">
              <TabsTrigger value="unlist">Unlist</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="rent">Rent</TabsTrigger>
            </TabsList>
            <TabsContent value="unlist">
              <Unlist />
            </TabsContent>
            <TabsContent value="list">
              <List />
            </TabsContent>
            <TabsContent value="rent">
              <Rent />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
