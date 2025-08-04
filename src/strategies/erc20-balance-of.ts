import { StrategyParams } from './index';
import { getTokenPriceAtTimestamp } from '../helpers/coingecko';
import { getTokenDecimals } from '../helpers/token';

const DEFAULT_DECIMAL = 18;

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
