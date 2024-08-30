/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useState, useEffect } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Marketplace_Contract } from "@/lib/config";
import { type DeviceProp } from "@/lib/api";
import { useClient } from "@/context/ClientProvider";

const formSchema = z.object({
  device: z.string(),
  rentalDays: z.string(),
  more: z.boolean(),
});

export enum Type {
  MARKET = "market",
  UNLIST = "unlist",
  LIST = "list",
  RENT = "rent",
}

const relistFormSchema = z.object({
  device: z.string(),
  minRentalDays: z.string(),
  maxRentalDays: z.string(),
  dailyRent: z.string(),
});

export default function Device({
  data,
  type = Type.MARKET,
}: {
  data: DeviceProp;
  type?: Type;
}) {
  const { isConnected, address } = useAccount();
  const { getMetadata } = useClient();
  const { toast } = useToast();

  const [device, setDevice] = useState<DeviceProp>(data);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [marketOpen, setMarketOpen] = useState(false);
  const [relistOpen, setRelistOpen] = useState(false);

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

  const getDeviceWithNameAndSymbol = useCallback(
    async (device: DeviceProp) => {
      const res = await getMetadata(
        device.product as `0x${string}`,
        BigInt(device.token_id),
        // "0x4fEA711d4dBd69F8368Cce56f36b5601155C9EBF",
        // BigInt(4524),
      );

      setDevice({ ...device, name: res?.name ?? "", image: res?.image ?? "" });
    },
    [getMetadata],
  );

  useEffect(() => {
    getDeviceWithNameAndSymbol(data);
  }, [data, getDeviceWithNameAndSymbol]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device: "",
      rentalDays: "1",
      more: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (address && device?.listing_info) {
      const price = new Decimal(device?.listing_info?.daily_rent)
        .mul(values.rentalDays)
        .toNumber();

      const data = {
        abi: Marketplace_Contract.abi,
        address: Marketplace_Contract.address as `0x${string}`,
        value: BigInt(price),
        functionName: "rent",
        args: [
          values.device,
          address,
          BigInt(values.rentalDays),
          BigInt(price),
        ],
        // gas: parseGwei("20"),
      };

      if (values.more) {
        data.functionName = "payRent";
        data.args = [values.device, BigInt(price)];
      }

      writeContract(data);

      setMarketOpen(false);
    }
  }

  const handleTrigger = (device: DeviceProp, more = false) => {
    form.setValue("device", device.device);

    if (more) {
      form.setValue(
        "rentalDays",
        `${
          Number(device.listing_info?.max_rental_days) -
          Number(device.rental_info?.rental_days)
        }` ?? "1",
      );
      form.setValue("more", true);
    } else {
      form.setValue("rentalDays", device.listing_info?.min_rental_days ?? "1");
      form.setValue("more", false);
    }
  };

  const delist = () => {
    writeContract({
      abi: Marketplace_Contract.abi,
      address: Marketplace_Contract.address as `0x${string}`,
      functionName: "delist",
      args: [device.device],
    });
  };

  const endLease = () => {
    writeContract({
      abi: Marketplace_Contract.abi,
      address: Marketplace_Contract.address as `0x${string}`,
      functionName: "endLease",
      args: [device.device],
    });
  };

  const relistForm = useForm<z.infer<typeof relistFormSchema>>({
    resolver: zodResolver(relistFormSchema),
    defaultValues: {
      device: "",
      minRentalDays: "1",
      maxRentalDays: "30",
      dailyRent: "0.0001",
    },
  });

  const onRelistFormSubmit = async (
    values: z.infer<typeof relistFormSchema>,
  ) => {
    const price = new Decimal(values.dailyRent).mul(10 ** 18).toNumber();
    const data = {
      abi: Marketplace_Contract.abi,
      address: Marketplace_Contract.address as `0x${string}`,
      functionName: "relist",
      args: [
        values.device,
        BigInt(values.minRentalDays),
        BigInt(values.maxRentalDays),
        "0x0000000000000000000000000000000000000000",
        BigInt(price),
        address,
      ],
    };

    console.log("data", data);
    writeContract(data);

    setRelistOpen(false);
  };

  const handleRelistTrigger = (device: DeviceProp) => {
    relistForm.setValue("device", device.device);
  };

  const withdraw = () => {
    writeContract({
      abi: Marketplace_Contract.abi,
      address: Marketplace_Contract.address as `0x${string}`,
      functionName: "withdraw",
      args: [device.device],
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">
          {device.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <div className="flex justify-center text-2xl font-bold text-orange-400">
          <img className="max-w-[200px]" src={device.image} alt={device.name} />
        </div>
        <div className="mt-2 text-xs leading-6 text-[#9DC8B9]">
          <div>address: {device.device}</div>
          {device?.listing_info ? (
            <div>
              <div>owner: {device.listing_info.owner}</div>
              <div className="mt-5 flex flex-col justify-around gap-4 sm:flex-row">
                <div className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  rental duration:
                  {device.listing_info.min_rental_days} -
                  {device.listing_info.max_rental_days} days
                </div>
                {/* <div>currency: {device.listing_info.rent_currency}</div> */}
                <div className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  price:{" "}
                  {new Decimal(device.listing_info.daily_rent)
                    .div(10 ** 18)
                    .toString()}
                  ETH/Day
                </div>
              </div>
            </div>
          ) : null}
          {device?.rental_info?.rental_status ? (
            <>
              <div className="mt-5">
                <div>
                  rent duration:
                  {new Date(
                    Number(device.rental_info.start_time) * 1000,
                  ).toLocaleDateString()}
                  -
                  {new Date(
                    Number(device.rental_info.end_time) * 1000,
                  ).toLocaleDateString()}
                </div>
              </div>
              <div>
                total paid rent:{" "}
                {new Decimal(device.rental_info.total_paid_rent)
                  .div(10 ** 18)
                  .toString()}
              </div>
            </>
          ) : null}
        </div>
        <CardFooter className="mt-10 flex justify-center">
          {isConnected && type === Type.MARKET ? (
            <Dialog open={marketOpen} onOpenChange={setMarketOpen}>
              <DialogTrigger>
                <div
                  className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:opacity-80"
                  onClick={() => handleTrigger(device)}
                >
                  Rent
                </div>
              </DialogTrigger>
              <DialogContent className="text-white">
                <DialogHeader>
                  <DialogTitle>Rent Device</DialogTitle>
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
                      name="rentalDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rental Days</FormLabel>
                          <FormControl>
                            <Input placeholder="rental days" {...field} />
                          </FormControl>
                          <FormDescription>
                            {device?.listing_info?.min_rental_days} -
                            {device?.listing_info?.max_rental_days} days
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <div>Prepaid Rent</div>
                      <div>
                        {device?.listing_info
                          ? new Decimal(device.listing_info.daily_rent)
                              .div(10 ** 18)
                              .mul(form.getValues("rentalDays"))
                              .toString()
                          : "0"}
                        ETH
                      </div>
                    </div>
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

          {/* {isConnected && type === Type.RENT ? (
            <Dialog>
              <DialogTrigger>
                <div
                  className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:opacity-80"
                  onClick={() => handleTrigger(device, true)}
                >
                  Pay Rent
                </div>
              </DialogTrigger>
              <DialogContent className="text-white">
                <DialogHeader>
                  <DialogTitle>Rent Device</DialogTitle>
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
                      name="rentalDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rental Days</FormLabel>
                          <FormControl>
                            <Input placeholder="rental days" {...field} />
                          </FormControl>
                          <FormDescription>
                            {device?.listing_info?.min_rental_days} -
                            {device?.listing_info?.max_rental_days} days
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <div>Prepaid Rent</div>
                      <div>
                        {device?.listing_info
                          ? new Decimal(device.listing_info.daily_rent)
                              .div(10 ** 18)
                              .mul(form.getValues("rentalDays"))
                              .toString()
                          : "0"}
                        ETH
                      </div>
                    </div>
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
          ) : null} */}

          {isConnected && type === Type.LIST ? (
            <div className="flex flex-col gap-4 px-4">
              {!device.rental_info?.rental_status ||
              Number(device.rental_info?.end_time) * 1000 < Date.now() ? (
                <AlertDialog>
                  <AlertDialogTrigger className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80">
                    Withdraw
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80"
                        onClick={withdraw}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}

              {!device.rental_info?.rental_status ||
              Number(device.rental_info?.end_time) * 1000 < Date.now() ? (
                <AlertDialog>
                  <AlertDialogTrigger className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80">
                    Delist
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80"
                        onClick={delist}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}

              {!device.rental_info?.rental_status ||
              Number(device.rental_info?.end_time) * 1000 < Date.now() ? (
                <Dialog open={relistOpen} onOpenChange={setRelistOpen}>
                  <DialogTrigger>
                    <div
                      className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:opacity-80"
                      onClick={() => handleRelistTrigger(device)}
                    >
                      Relist
                    </div>
                  </DialogTrigger>
                  <DialogContent className="text-white">
                    <DialogHeader>
                      <DialogTitle>Relist Device</DialogTitle>
                    </DialogHeader>
                    <Form {...relistForm}>
                      <form
                        onSubmit={relistForm.handleSubmit(onRelistFormSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={relistForm.control}
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
                          control={relistForm.control}
                          name="minRentalDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rental Days</FormLabel>
                              <FormControl>
                                <Input placeholder="rental days" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={relistForm.control}
                          name="maxRentalDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rental Days</FormLabel>
                              <FormControl>
                                <Input placeholder="rental days" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <div>Daily Rent</div>
                          <div>0.0001ETH</div>
                        </div>
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

              {device.rental_info?.rental_status &&
              Number(device.rental_info?.end_time) * 1000 < Date.now() ? (
                <AlertDialog>
                  <AlertDialogTrigger className="lt-sm:text-xs lt-sm:p-3 mr-5 flex w-full cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80">
                    End lease
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="lt-sm:text-xs lt-sm:p-3 flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap bg-orange-400 px-5 py-3.5 text-base font-normal text-black hover:bg-orange-400 hover:opacity-80"
                        onClick={endLease}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          ) : null}
        </CardFooter>
      </CardContent>
    </Card>
  );
}
