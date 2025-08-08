import express from 'express';
import { ZodError } from 'zod';

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad Request',
  500: 'Internal Server Error'
};

export function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: express.NextFunction
) {
  const id = req.body?.id ?? 0;

  let code = 500;
  if (err instanceof ZodError) {
    code = 400;
  }

  const message = HTTP_STATUS_MESSAGES[code] || 'unauthorized';
  let errorData = err;

  if (err instanceof ZodError) {
    errorData = err.issues.map(issue => ({
      path: issue.path,
      code: issue.code,
      message: issue.message
    }));
  }

  res.status(code).json({
    jsonrpc: '2.0',
    error: {
      code,
      message,
      data: errorData
    },
    id
  });
}
