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

  // SSV Network Vesting contract
  // https://forum.ssv.network/t/ssv-dao-partners-ssv-vesting/127
  if (
    params.address.toLowerCase() ===
      '0xb8471180c79a0a69c7790a1ccf62e91b3c3559bf' &&
    params.methodABI?.name === 'totalVestingBalanceOf' &&
    network === 1
  ) {
    return erc20BalanceOf(
      {
        ...params,
        address: '0x9D65fF81a3c488d585bBfb0Bfe3c7707c7917f54'
      },
      1,
      snapshot
    );
  }

  return 0;
}
