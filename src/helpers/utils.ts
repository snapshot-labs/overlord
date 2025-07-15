import { strategies as s } from '../strategies';

export async function getVpValueByStrategy(
  network: number,
  start: number,
  strategies: Array<{ name: string; network: string; params: any }>
): Promise<number[]> {
  return await Promise.all(
    strategies.map((strategy: any) =>
      s[strategy.name]
        ? s[strategy.name](strategy.params, parseInt(strategy.network) || network, start)
        : 0
    )
  );
}
