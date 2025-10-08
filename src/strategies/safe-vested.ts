import erc20BalanceOf from './erc20-balance-of';
import { StrategyParams } from './index';

export default async function getValue(
  params: StrategyParams,
  _network: number,
  snapshot: number
): Promise<number> {
  return erc20BalanceOf(
    {
      ...params,
      address: '0x5afe3855358e112b5647b952709e6165e1c1eeee'
    },
    1,
    snapshot
  );
}
