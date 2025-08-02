import { Response } from 'express';
import { strategies as s } from '../strategies';

export async function getVpValueByStrategy(
  network: number,
  start: number,
  strategies: Array<{ name: string; network: string; params: any }>
): Promise<number[]> {
  return await Promise.all(
    strategies.map((strategy: any) =>
      s[strategy.name]
        ? s[strategy.name](strategy.params, parseInt(strategy.network) || network, start)
        : 0
    )
  );
}

export function rpcSuccess(res: Response, result: any, id: number) {
  res.json({
    jsonrpc: '2.0',
    result,
    id
  });
}

export function rpcError(res: Response, code: number, e: unknown, id: number) {
  res.status(code).json({
    jsonrpc: '2.0',
    error: {
      code,
      message: 'unauthorized',
      data: e
    },
    id
  });
}
