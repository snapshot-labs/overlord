import { getVpValueByStrategy } from '../helpers/utils';

interface Params {
  strategies: any[];
}

export default async function getValue(params: Params, network: number, snapshot: number) {
  if (!params.strategies || !Array.isArray(params.strategies) || params.strategies.length === 0)
    return 0;

  const vpValueByStrategy = await getVpValueByStrategy(network, snapshot, params.strategies);

  return Math.min(...vpValueByStrategy);
}
