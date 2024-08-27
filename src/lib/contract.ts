import {
  sendTransaction,
  signMessage,
  writeContract,
  readContract,
  waitForTransactionReceipt,
} from "@wagmi";
import { type PublicClient } from 'viem'

import MarketplaceABI from '@/lib/abi/Marketplace.json'
import AccessTokenABI from '@/lib/abi/AccessToken.json'
import AccessTokenFactoryABI from '@/lib/abi/AccessTokenFactory.json'

import { wagmiConfig } from "@/lib/wagmiConfig";

const Marketplace_Address = '0xC6B5c98FD8A8C9d8aa2B0f79a66EC55b0D2dad69'
const AccessTokenFactory_Address = '0x34D22CbdCD41E06af4BDB87BFc67c58E83DcE922'