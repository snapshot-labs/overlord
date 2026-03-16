import erc20BalanceOf from './erc20-balance-of';
import { StrategyParams } from './index';

export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  const value =
    (await erc20BalanceOf(params, network, snapshot)) /
    (params.weight ?? params.coeff);
  return Number.isFinite(value) ? value : 0;
}
