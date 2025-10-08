import contractCall from './contract-call';
import erc20BalanceOf from './erc20-balance-of';
import ethBalance from './eth-balance';
import erc20BalanceOfWeighted from './erc20-balance-of-weighted';
import multichain from './multichain';
import pagination from './pagination';
import safeVested from './safe-vested';
import uni from './uni';

export interface StrategyParams {
  address: string;
  decimals?: number;
  [key: string]: any;
}

export interface NestedStrategyParams {
  strategies: StrategyConfig[];
  [key: string]: any;
}

export interface StrategyConfig {
  name: string;
  network?: number;
  params?: StrategyParams | NestedStrategyParams | { [key: string]: any };
}

type StrategyFunction = (
  params: any,
  network: number,
  snapshot: number
) => Promise<number>;

const strategies: Record<string, StrategyFunction> = {
  'erc20-balance-of': erc20BalanceOf,
  'erc20-balance-of-delegation': erc20BalanceOf,
  'erc20-balance-of-with-delegation': erc20BalanceOf,
  'erc20-balance-of-weighted': erc20BalanceOfWeighted,
  'erc20-balance-of-coeff': erc20BalanceOfWeighted,
  'erc20-votes': erc20BalanceOf,
  'erc20-votes-with-override': erc20BalanceOf,
  'eth-balance': ethBalance,
  'comp-like-votes': erc20BalanceOf,
  uni,
  multichain,
  pagination,
  delegation: multichain,
  'safe-vested': safeVested,
  'with-delegation': multichain,
  'contract-call': contractCall
};

export default function getStrategiesValue(
  network: number,
  start: number,
  strategiesConfig: StrategyConfig[]
): Promise<number[]> {
  return Promise.all(
    strategiesConfig.map(
      (strategy: StrategyConfig) =>
        strategies[strategy.name]?.(
          strategy.params,
          strategy.network ?? network,
          start
        ) ?? 0
    )
  );
}
