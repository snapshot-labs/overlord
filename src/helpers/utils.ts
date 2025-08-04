import { Response } from 'express';

export function rpcSuccess(res: Response, result: any, id: number) {
  res.json({
    jsonrpc: '2.0',
    result,
    id
  });
}

export function rpcError(res: Response, code: number, e: unknown, id: number) {
  const defaultMessage = code === 500 ? 'Internal server error' : 'unauthorized';
  const message = e instanceof Error ? e.message : typeof e === 'string' ? e : defaultMessage;
  const data = typeof e === 'string' ? undefined : e;

  res.status(code).json({
    jsonrpc: '2.0',
    error: {
      code,
      message,
      data
    },
    id
  });
}
