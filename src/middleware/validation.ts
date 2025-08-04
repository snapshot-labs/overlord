import express from 'express';
import { rpcError } from '../helpers/utils';

function validateRequired(value: any, field: string): string | null {
  return !value ? `${field} is required` : null;
}

function validateMethod(method: string): string | null {
  if (!method) return 'Method is required';
  if (method !== 'get_value_by_strategy') return 'Method not allowed';
  return null;
}

function validateParams(params: any): string | null {
  if (!params) return 'Params is required';

  const requiredFields = ['network', 'snapshot', 'strategies'];
  for (const field of requiredFields) {
    const error = validateRequired(params[field], field);
    if (error) return error;
  }

  return null;
}

export function validateRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { method, params, id = 0 } = req.body;

  const methodError = validateMethod(method);
  if (methodError) {
    return rpcError(res, 400, methodError, id);
  }

  const paramsError = validateParams(params);
  if (paramsError) {
    return rpcError(res, 400, paramsError, id);
  }

  next();
}
