import erc20BalanceOf from './erc20-balance-of';
import multichain from './multichain';
import uni from './uni';
import { toInteger } from '../helpers/utils';

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

async function getValue(param: Params): Promise<Result> {
  const result: Result = new Array(param.strategies.length).fill(0);
  let processed = 0;
  let hasError = false;

  if (!param.strategies.length) {
    return [];
  }

  // Execute all fetch in parallel
  // but return early as soon as one fetch fails
  return new Promise(resolve => {
    param.strategies.forEach(async (strategy, index) => {
      try {
        let network = 1;

        try {
          network = toInteger(strategy.network ?? param.network);
        } catch {
          result[index] = 0;
          processed++;

          if (processed === param.strategies.length && !hasError) {
            resolve(result);
          }
          return;
        }

        const value = await (strategies[strategy.name]?.(
          strategy.params,
          network,
          param.snapshot
        ) ?? 0);

        result[index] = value;
        processed++;

        if (processed === param.strategies.length && !hasError) {
          resolve(result);
        }
      } catch {
        // check to avoid multiple calls to resolve
        if (!hasError) {
          hasError = true;
          resolve([]);
        }
      }
    });
  });
}

export default function getStrategiesValue(
  params: Params[]
): Promise<Result[]> {
  return Promise.all(params.map(getValue));
}
