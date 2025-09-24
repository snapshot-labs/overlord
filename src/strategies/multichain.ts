import getStrategiesValue, { NestedStrategyParams } from './index';

export default async function getValue(
  params: NestedStrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  if (
    !params.strategies ||
    !Array.isArray(params.strategies) ||
    params.strategies.length === 0
  )
    return 0;

  const vpValueByStrategy = await getStrategiesValue([
    {
      network,
      snapshot,
      strategies: params.strategies
    }
  ]);

  if (!vpValueByStrategy?.[0]?.length) return 0;

  return Math.min(...vpValueByStrategy[0]);
}
