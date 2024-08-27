import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAccount } from "wagmi";

import { getListDevices, type DeviceProp } from "@/lib/api";

import Device, { Type } from "@/components/device";

export default function List() {
  const { isConnected, address } = useAccount();
  const [devices, setDevices] = useState<DeviceProp[]>([]);

  const { data: devicesData } = useQuery({
    queryKey: ["list", address],
    queryFn: async () => getListDevices(address!),
    enabled: isConnected,
  });

  useEffect(() => {
    if (devicesData) {
      setDevices(devicesData as unknown as DeviceProp[]);
    }
  }, [devicesData]);

  return (
    <>
      <main>
        <div className="container gap-12 px-4 py-16 md:min-w-[960px]">
          <div className="grid gap-4 text-white md:grid-cols-2 md:gap-8">
            {devices.map((device: DeviceProp, i: number) => (
              <Device key={i} data={device} type={Type.LIST} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
