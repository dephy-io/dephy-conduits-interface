import { useEffect, useState } from "react";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";

import { getMarketDevices, type DeviceProp } from "@/lib/api";

import Device from "@/components/device";

export default function Home() {
  const [devices, setDevices] = useState<DeviceProp[]>([]);

  const { data: devicesData } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => getMarketDevices(),
  });

  useEffect(() => {
    if (devicesData) {
      setDevices(devicesData as unknown as DeviceProp[]);
    }
  }, [devicesData]);

  return (
    <>
      <Head>
        <title>Dephy Conduits</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container gap-12 px-4 py-16 md:min-w-[960px]">
          <div className="grid gap-4 text-white md:grid-cols-2 md:gap-8">
            {devices.map((device: DeviceProp, i: number) => (
              <Device key={i} data={device} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
