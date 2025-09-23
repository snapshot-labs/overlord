import erc20BalanceOf from './erc20-balance-of';
import multichain from './multichain';
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
  network?: string;
  params?: StrategyParams | NestedStrategyParams | { [key: string]: any };
}

type Params = {
  network: string | number;
  snapshot: number;
  strategies: StrategyConfig[];
};

type Result = number[];

type StrategyFunction = (
  params: any,
  network: number,
  snapshot: number
) => Promise<number>;

const strategies: Record<string, StrategyFunction> = {
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

async function executeStrategies(param: Params): Promise<Result> {
  return Promise.all(
    param.strategies.map(
      strategy =>
        strategies[strategy.name]?.(
          strategy.params,
          Number(strategy.network ? strategy.network : param.network),
          param.snapshot
        ) ?? 0
    )
  );
}

export default function getStrategiesValue(
  params: Params[]
): Promise<Result[]> {
  return Promise.all(params.map(executeStrategies));
}
