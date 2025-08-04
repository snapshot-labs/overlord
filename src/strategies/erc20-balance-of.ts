import { StrategyParams } from './index';
import { getTokenPriceAtTimestamp } from '../helpers/coingecko';
import { getTokenDecimals } from '../helpers/token';

export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  const decimals = params.decimals ?? 18;

  if (decimals < 0 || decimals > 255 || !Number.isInteger(decimals)) return 0;

  try {
    const tokenDecimals = await getTokenDecimals(network, params.address);
    const price = await getTokenPriceAtTimestamp(network, params.address, snapshot);

    return price / Math.pow(10, tokenDecimals - decimals);
  } catch {
    // Silently handle errors
    return 0;
  }
}
