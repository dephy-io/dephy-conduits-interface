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
  address: "0xEdeE6f1E0315d0872CF824A71BC9d5E3Ef5f0b10",
  abi: MarketplaceABI.abi
}