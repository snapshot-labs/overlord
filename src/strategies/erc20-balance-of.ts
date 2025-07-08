import { getTokenPriceAtTimestamp } from '../helpers/coingecko';
import { getTokenDecimals } from '../helpers/rpc';

interface Params {
  address: string;
  symbol?: string;
  decimals?: number;
}

export default async function getValue(params: Params, network: number, snapshot: number) {
  const decimals = params.decimals ?? 18;

  const tokenDecimals = await getTokenDecimals(network, params.address);
  const price = await getTokenPriceAtTimestamp(network, params.address, snapshot);

  return price / Math.pow(10, tokenDecimals - decimals);
}
