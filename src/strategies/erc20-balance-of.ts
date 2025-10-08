import { StrategyParams } from './index';
import { getTokenPriceAtTimestamp } from '../helpers/coingecko';
import { getTokenDecimals } from '../helpers/token';

const DEFAULT_DECIMAL = 18;

// Mapping of equivalent tokens (vested, locked, wrapped, etc ...) with 1:1 ratio
const MAPPED_EQUIVALENT_TOKENS: { [address: string]: string } = {
  // Vote locked Aura (vlAura) -> Aura
  // https://docs.aura.finance/aura/usdaura/vote-locking
  // ETH mainnet
  '0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac':
    '1:0xc0c293ce456ff0ed870add98a0828dd4d2903dbf',
  // Base
  '0x9e1f4190f1a8fe0cd57421533decb57f9980922e':
    '1:0xc0c293ce456ff0ed870add98a0828dd4d2903dbf'
};

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
  const [tokenNetwork, tokenAddress] = MAPPED_EQUIVALENT_TOKENS[
    params.address.toLowerCase()
  ]?.split(':') ?? [network, params.address];

  const tokenDecimals = await getTokenDecimals(network, params.address);
  const price = await getTokenPriceAtTimestamp(
    Number(tokenNetwork),
    tokenAddress,
    snapshot
  );

  return price / Math.pow(10, tokenDecimals - decimals);
}
