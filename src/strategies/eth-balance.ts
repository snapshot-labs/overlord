import { StrategyParams } from './index';
import { getEthPriceAtTimestamp } from '../helpers/coingecko';

const DEFAULT_DECIMAL = 18;

export default async function getValue(
  params: StrategyParams,
  _network: number,
  snapshot: number
): Promise<number> {
  const decimals = params.decimals ?? DEFAULT_DECIMAL;
  const price = await getEthPriceAtTimestamp(snapshot);

  return price / Math.pow(10, DEFAULT_DECIMAL - decimals);
}
