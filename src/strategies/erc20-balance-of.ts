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
    '1:0xc0c293ce456ff0ed870add98a0828dd4d2903dbf',
  // Parallel sPRL1 -> PRL
  // https://docs.parallel.best/governance/sprl
  // ETH mainnet
  '0xead729472f82e5ec2ff4e691d67633077c1b5901':
    '1:0x6c0aeceedc55c9d55d8b99216a670d85330941c3',
  // Polygon
  '0xdb7be3a50bdf5641757ebea38e8014e1f0aa9475':
    '1:0x6c0aeceedc55c9d55d8b99216a670d85330941c3',
  // Base
  '0x01fa35fde0e813e2d6687660a74a313d8d922e48':
    '1:0x6c0aeceedc55c9d55d8b99216a670d85330941c3',
  // Sonic
  '0x7df74bbb6f82ec1bcb1562a30ef5bf5c326e2811':
    '1:0x6c0aeceedc55c9d55d8b99216a670d85330941c3',
  // Vote locked CVX (vlCVX) -> CVX
  // https://docs.convexfinance.com/convexfinance/products/vote-locking
  // ETH mainnet
  '0x72a19342e8f1838460ebfccef09f6585e32db86e':
    '1:0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
  // ETH mainnet (old)
  '0xd18140b4b819b895a3dba5442f959fa44994af50':
    '1:0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
  // Shapeshift staked FOX -> FOX
  // Arbitrum
  '0xac2a4fd70bcd8bab0662960455c363735f0e2b56':
    '1:0xc770eefad204b5180df6a14ee197d99d808ee52d'
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
  ]?.split(':') ?? [String(network), params.address];

  const price = await getTokenPriceAtTimestamp(
    Number(tokenNetwork),
    tokenAddress,
    snapshot
  );

  if (price === 0) {
    return 0;
  }

  const tokenDecimals = await getTokenDecimals(
    Number(tokenNetwork),
    tokenAddress
  );

  return price / Math.pow(10, tokenDecimals - decimals);
}
