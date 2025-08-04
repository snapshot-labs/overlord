import { Response } from 'express';

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad Request',
  500: 'Internal Server Error'
};

export function rpcSuccess(res: Response, result: any, id: number) {
  res.json({
    jsonrpc: '2.0',
    result,
    id
  });
}

export function rpcError(res: Response, code: number, e: unknown, id: number) {
  const message = HTTP_STATUS_MESSAGES[code] || 'unauthorized';

  res.status(code).json({
    jsonrpc: '2.0',
    error: {
      code,
      message,
      data: e
    },
    id
  });
}
