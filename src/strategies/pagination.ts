import getStrategiesValue from './index';

export default async function getValue(
  params: any,
  network: number,
  snapshot: number
): Promise<number> {
  if (!params.strategy) return 0;

  return (await getStrategiesValue(network, snapshot, [params.strategy]))[0];
}
