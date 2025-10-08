import erc20BalanceOf from './erc20-balance-of';
import { StrategyParams } from './index';

export default async function getValue(
  params: StrategyParams,
  network: number,
  snapshot: number
): Promise<number> {
  // Safe Locking contract
  // https://github.com/safe-global/safe-locking
  if (
    params.address.toLowerCase() ===
      '0x0a7cb434f96f65972d46a5c1a64a9654dc9959b2' &&
    params.methodABI?.name === 'getUserTokenBalance' &&
    network === 1
  ) {
    return erc20BalanceOf(
      {
        ...params,
        address: '0x5afe3855358e112b5647b952709e6165e1c1eeee'
      },
      1,
      snapshot
    );
  }

  return 0;
}
