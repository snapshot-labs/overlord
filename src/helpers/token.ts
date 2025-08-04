import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { withCache } from './cache';

export async function getTokenDecimals(network: number, address: string): Promise<number> {
  return withCache(`decimals:${network}:${address}`, async () => {
    const url = `https://brovider.xyz/${network}`;
    const provider = new StaticJsonRpcProvider(url, network);
    const contract = new Contract(address, ['function decimals() view returns (uint8)'], provider);

    return await contract.decimals();
  });
}
