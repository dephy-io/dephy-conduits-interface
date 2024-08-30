/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Decimal } from "decimal.js";
import {
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { getUnlistDevices } from "@/queries";
import { useClient } from "@/context/ClientProvider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Marketplace_Contract } from "@/lib/config";
import { getListDevices, type DeviceProp } from "@/lib/api";

interface Device {
  name?: string;
  image?: string;
  address: string;
  id: string;
  owner: string;
  product: {
    address: string;
    name: string;
    symbol: string;
    vendor: string;
  };
  tokenId: bigint;
}

const formSchema = z.object({
  device: z.string(),
  product: z.string(),
  tokenId: z.string(),
  minRentalDays: z.string(),
  maxRentalDays: z.string(),
  rentCurrency: z.string(),
  dailyRent: z.string(),
  accessUrl: z.string(),
});

export default function Unlist() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract } = useWriteContract();
  const { chain, gqlClient, getMetadata } = useClient();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: "Confirming",
      });
    }
  }, [isConfirming, toast]);

  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Confirmed",
      });
    }
  }, [isConfirmed, toast]);

  const { data } = useQuery({
    queryKey: ["unlist", address, hash],
    queryFn: async () => getUnlistDevices(gqlClient!, address!, chain.id),
    enabled: !!gqlClient && !!address,
  });

  const { data: devicesData } = useQuery({
    queryKey: ["list", address, hash],
    queryFn: async () => getListDevices(address!),
    enabled: isConnected,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device: "",
      product: "",
      tokenId: "",
      minRentalDays: "1",
      maxRentalDays: "30",
      rentCurrency: "ETH",
      dailyRent: "0.0001",
      accessUrl: "",
    },
  });

  const getDevicesWithNameAndSymbol = useCallback(
    async (devices: Device[]) => {
      const promises = devices?.map(async (device) => {
        const res = await getMetadata(
          device.product.address as `0x${string}`,
          BigInt(device.tokenId as bigint),
        );

        return { ...device, name: res?.name ?? "", image: res?.image ?? "" };
      });

      const ps = await Promise.all(promises!);

      setDevices(ps);
    },
    [getMetadata],
  );

  useEffect(() => {
    if (data?.Device && devicesData) {
      const _devices = devicesData as unknown as DeviceProp[];
      const listed = _devices.map(({ device }) => device.toLowerCase());
      const devices = data.Device.filter(
        ({ address }) => !listed.includes(address),
      );

      getDevicesWithNameAndSymbol(devices as Device[]);
    }
  }, [data, getDevicesWithNameAndSymbol, devicesData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (address) {
      // const approvedTo = await viemClient.readContract({
      //   abi: erc721Abi,
      //   address: values.product as `0x${string}`,
      //   functionName: "getApproved",
      //   args: [BigInt(values.tokenId)],
      // });

      // if (approvedTo !== Marketplace_Contract.address) {
      //   const approvalData = {
      //     abi: erc721Abi,
      //     address: values.product as `0x${string}`,
      //     functionName: "approve" as unknown as never,
      //     args: [Marketplace_Contract.address, BigInt(values.tokenId)],
      //   };

      //   writeContract(approvalData);
      // } else {
      const price = new Decimal(values.dailyRent).mul(10 ** 18).toNumber();
      const data = {
        abi: Marketplace_Contract.abi,
        address: Marketplace_Contract.address as `0x${string}`,
        functionName: "list",
        args: [
          values.device,
          BigInt(values.minRentalDays),
          BigInt(values.maxRentalDays),
          "0x0000000000000000000000000000000000000000",
          BigInt(price),
          address,
          values.accessUrl,
        ],
      };

      writeContract(data);

      setOpen(false);
    }
  }

  const handleTrigger = (device: Device) => {
    form.setValue("device", device.address);
    form.setValue("tokenId", `${device.tokenId}`);
    form.setValue("product", device.product.address);
  };

  return (
    <>
      <main>
        <div className="container gap-12 px-4 py-16 md:min-w-[960px]">
          <div className="grid gap-4 text-white md:grid-cols-2 md:gap-8">
            {devices.map((device: Device, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">
                    {device.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="flex justify-center text-2xl font-bold text-orange-400">
                    <img
                      className="max-w-[200px]"
                      src={device.image}
                      alt={device.name}
                    />
                  </div>
                  <div className="mt-2 text-xs leading-6 text-[#9DC8B9]">
                    <div>address: {device.address}</div>
                  </div>
                </CardContent>
                <CardFooter className="mt-10 flex justify-center">
                  {isConnected ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger>
                        <div
                          className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:opacity-80"
                          onClick={() => handleTrigger(device)}
                        >
                          List
                        </div>
                      </DialogTrigger>
                      <DialogContent className="text-white">
                        <DialogHeader>
                          <DialogTitle>List Device</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                          >
                            <FormField
                              control={form.control}
                              name="device"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Device</FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled
                                      placeholder="device address"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="minRentalDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rental Days</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="rental days"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="maxRentalDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rental Days</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="rental days"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="dailyRent"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Daily Rent</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="daily rent"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="accessUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Access Url</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="access url"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* <div>
                              <div>Daily Rent</div>
                              <div>0.0001ETH</div>
                            </div> */}
                            <Button
                              className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80"
                              type="submit"
                            >
                              Submit
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  ) : null}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
