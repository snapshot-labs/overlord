import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

const cache = new Map<string, number>();

export async function getTokenDecimals(network: number, address: string): Promise<number> {
  const key = `${network}:${address}`;

  if (cache.has(key)) return cache.get(key)!;

  const url = `https://brovider.xyz/${network}`;
  const provider = new StaticJsonRpcProvider(url, network);
  const contract = new Contract(address, ['function decimals() view returns (uint8)'], provider);

  const decimals = await contract.decimals();

  cache.set(key, decimals);

  return decimals;
}
