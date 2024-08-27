import { bscTestnet, baseSepolia, type Chain } from "viem/chains";

import MarketplaceABI from "@/lib/abi/Marketplace.json";

import BNBLogo from '@/assets/bnb-logo.svg'
import BaseLogo from '@/assets/base-logo.svg'

export type ChainProp = Chain & {
  title?: string
  logo?: never
}

export const chains = [
  {
    ...bscTestnet,
    logo: BNBLogo as unknown as never,
    title: 'BSC Testnet',
  },
  {
    ...baseSepolia,
    logo: BaseLogo as unknown as never,
    title: 'Base Sepolia'
  }
]


export const Marketplace_Contract = {
  address: "0xC6B5c98FD8A8C9d8aa2B0f79a66EC55b0D2dad69",
  abi: MarketplaceABI.abi
}