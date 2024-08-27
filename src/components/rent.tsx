import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAccount } from "wagmi";

import { getRentDevices, type DeviceProp } from "@/lib/api";

import Device, { Type } from "@/components/device";

export default function Rent() {
  const { isConnected, address } = useAccount();
  const [devices, setDevices] = useState<DeviceProp[]>([]);

  const { data: devicesData } = useQuery({
    queryKey: ["rent", address],
    queryFn: async () => getRentDevices(address!),
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
              <Device key={i} data={device} type={Type.RENT} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
