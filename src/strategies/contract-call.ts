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

  // AAVE effective balance from Liquidity Pool
  if (
    params.address.toLowerCase() ===
      '0xC0259c59D9f980E3b5e2574cD78C9A9Bc6A8E3fc' &&
    params.methodABI?.name === 'balanceOf' &&
    params.network === 1
  ) {
    return erc20BalanceOf(
      {
        ...params,
        address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'
      },
      1,
      snapshot
    );
  }

  return 0;
}
