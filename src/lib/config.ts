import { bscTestnet, baseSepolia, type Chain } from "viem/chains";

import MarketplaceABI from "@/lib/abi/Marketplace_ABI.json";

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
  address: "0xe250f5d46395E42c9955E16CAc6C9dacCdD3B7dB",
  abi: MarketplaceABI.abi
}