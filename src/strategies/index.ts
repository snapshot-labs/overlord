import erc20BalanceOf from './erc20-balance-of';
import multichain from './multichain';
import uni from './uni';

const STRATEGIES = {
  'erc20-balance-of': erc20BalanceOf,
  'erc20-balance-of-delegation': erc20BalanceOf,
  'erc20-balance-of-with-delegation': erc20BalanceOf,
  'erc20-votes': erc20BalanceOf,
  'erc20-votes-with-override': erc20BalanceOf,
  'comp-like-votes': erc20BalanceOf,
  uni,
  multichain,
  delegation: multichain,
  'with-delegation': multichain
};

export default async function getValue(
  network: number,
  start: number,
  strategies: Array<{ name: string; network: string; params: any }>
): Promise<number[]> {
  return await Promise.all(
    strategies.map((strategy: any) =>
      STRATEGIES[strategy.name]
        ? STRATEGIES[strategy.name](strategy.params, parseInt(strategy.network) || network, start)
        : 0
    )
  );
}
