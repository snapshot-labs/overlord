import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { withCache } from './cache';

/**
 * Fetches the number of decimals for an ERC20 token on a specific network.
 *
 * @param network - The blockchain network ID
 * @param address - The token contract address
 * @returns Promise resolving to the number of decimals for the token
 *
 * @remarks
 * This function uses the brovider.xyz RPC endpoint to query the token contract.
 * Results are cached to avoid redundant RPC calls for the same token.
 *
 * Errors from the RPC provider or contract call are not caught and will bubble up to the caller.
 * Common error scenarios include:
 * - Network not supported by the RPC provider
 * - Invalid token address
 * - Contract does not implement decimals() function
 * - RPC provider connection issues
 */
export async function getTokenDecimals(network: number, address: string): Promise<number> {
  return withCache(`decimals:${network}:${address}`, async () => {
    const url = `https://brovider.xyz/${network}`;
    const provider = new StaticJsonRpcProvider(url, network);
    const contract = new Contract(address, ['function decimals() view returns (uint8)'], provider);

    return await contract.decimals();
  });
}
