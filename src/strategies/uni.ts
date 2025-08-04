import erc20BalanceOf from './erc20-balance-of';
import { StrategyParams } from './index';

export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  if (network !== 1) return 0;

  return erc20BalanceOf(
    {
      ...params,
      address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
    },
    network,
    snapshot
  );
}
