import { StrategyParams } from './index';
import { getTokenPriceAtTimestamp } from '../helpers/coingecko';

const DEFAULT_DECIMAL = 18;

export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  const decimals = params.decimals ?? DEFAULT_DECIMAL;
  const price = await getTokenPriceAtTimestamp(network, null, snapshot);

  return price / Math.pow(10, DEFAULT_DECIMAL - decimals);
}
