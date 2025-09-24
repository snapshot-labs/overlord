import { getAddress } from '@ethersproject/address';
import { StrategyParams } from './index';
import { getTokenPriceAtTimestamp } from '../helpers/coingecko';
import { getTokenDecimals } from '../helpers/token';
import { toInteger } from '../helpers/utils';

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
 * - Returns 0 on payload error
 * - Throws on temporary issues, when another call may yield a different result
 */
export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  let address = '';
  let decimals = DEFAULT_DECIMAL;

  try {
    address = getAddress(params.address);
  } catch {
    return 0;
  }

  try {
    decimals = toInteger(params.decimals ?? DEFAULT_DECIMAL);
    if (decimals < 0 || decimals > 255) return 0;
  } catch {
    return 0;
  }

  const tokenDecimals = await getTokenDecimals(network, address);
  const price = await getTokenPriceAtTimestamp(network, address, snapshot);

  return price / Math.pow(10, tokenDecimals - decimals);
}
