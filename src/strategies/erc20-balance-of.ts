import { StrategyParams } from './index';
import { getTokenPriceAtTimestamp } from '../helpers/coingecko';
import { getTokenDecimals } from '../helpers/token';

const DEFAULT_DECIMAL = 18;

/**
 * ERC20 balance-of strategy that calculates the unit price of a token in USD.
 *
 * @param params - Strategy parameters containing token address and optional decimals
 * @param params.address - The ERC20 token contract address
 * @param params.decimals - Optional decimals for unit conversion (defaults to 18)
 * @param network - The blockchain network ID
 * @param snapshot - Unix timestamp in seconds for the price snapshot
 * @returns Promise resolving to the token unit price in USD
 *
 * @remarks
 * This strategy fetches the token's price from CoinGecko and adjusts it based on decimal differences
 * between the token's actual decimals and the desired unit decimals.
 *
 * The calculation formula is: `price / 10^(tokenDecimals - params.decimals)`
 * - If token has 18 decimals and params.decimals is 18: no adjustment
 * - If token has 6 decimals and params.decimals is 18: divides by 10^-12 (multiplies by 10^12)
 * - If token has 18 decimals and params.decimals is 6: divides by 10^12
 *
 * Error handling:
 * - Throws Error if params.address is missing
 * - Returns 0 on error, except for connectivity issues when fetching token decimals or CoinGecko price
 */
export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  if (!params.address) {
    throw new Error('Address is required for erc20-balance-of strategy');
  }

  const decimals = params.decimals ?? DEFAULT_DECIMAL;

  const tokenDecimals = await getTokenDecimals(network, params.address);
  const price = await getTokenPriceAtTimestamp(network, params.address, snapshot);

  return price / Math.pow(10, tokenDecimals - decimals);
}
