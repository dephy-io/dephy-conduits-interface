import axios from 'axios'

import { env } from '@/env';

export interface DeviceProp {
  name?: string;
  image?: string;
  chain_id: number;
  device: string;
  product: string;
  token_id: string;
  listing_info?: {
    chain_id: number;
    tx_hash: string;
    block_number: number;
    device: string;
    owner: string;
    min_rental_days: string;
    max_rental_days: string;
    rent_currency: string;
    daily_rent: string;
    rent_recipient: string;
    listing_status: number;
  };
  rental_info?: {
    chain_id: number;
    tx_hash: string;
    block_number: number;
    device: string;
    access_id: string;
    access_url: string;
    tenant: string;
    start_time: string;
    end_time: string;
    rental_days: string;
    total_paid_rent: string;
    rental_status: number;
  };
}

export interface ApiResponse {
  data: {
    data: DeviceProp[];
  };
}

export const getMarketDevices = async (chainId = 84532) => {
  const res = await axios.get<ApiResponse>(
    `${env.NEXT_PUBLIC_API_URL}/api/v1/devices/market?chain_id=${chainId}`,
  );

  return res.data.data;
}

export const getRentDevices = async (wallet: `0x${string}`, chainId = 84532) => {
  const res = await axios.get<ApiResponse>(
    `${env.NEXT_PUBLIC_API_URL}/api/v1/devices/renting?chain_id=${chainId}&wallet=${wallet}`,
  );

  return res.data.data;
}

export const getListDevices = async (wallet: `0x${string}`, chainId = 84532) => {
  const res = await axios.get<ApiResponse>(
    `${env.NEXT_PUBLIC_API_URL}/api/v1/devices/listing?chain_id=${chainId}&wallet=${wallet}`,
  );

  return res.data.data;
}