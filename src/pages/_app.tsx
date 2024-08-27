import { type ReactElement, type ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import type { AppProps, AppType } from "next/app";
import type { NextPage } from "next";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import Layout from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";
import ClientProvider from "@/context/ClientProvider";
import { wagmiConfig } from "@/lib/wagmiConfig";

const queryClient = new QueryClient();

import "@/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ClientProvider>
          <main className={GeistSans.className}>
            {getLayout(<Component {...pageProps} />)}
          </main>
          <Toaster />
        </ClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default MyApp;
