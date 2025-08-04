import express from 'express';
import { z } from 'zod';
import { rpcError } from '../helpers/utils';

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// Forward declaration for recursive strategy schema
const StrategyConfigSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().min(1, 'Strategy name is required'),
    network: z
      .string()
      .regex(/^\d+$/, 'Network must be a valid positive integer string')
      .optional(),
    params: z
      .looseObject({
        address: z
          .string()
          .regex(EVM_ADDRESS_REGEX, 'Address must be a valid EVM address')
          .optional(),
        decimals: z.number().int().min(0).max(255).optional(),
        strategies: z
          .array(StrategyConfigSchema)
          .min(1, 'At least one strategy is required')
          .optional()
      })
      .optional()
  })
);

const RpcParamsSchema = z.object({
  network: z.string().regex(/^\d+$/, 'Network must be a valid positive integer string'),
  snapshot: z.number().int().positive('Snapshot must be a positive integer'),
  strategies: z.array(StrategyConfigSchema).min(1, 'At least one strategy is required')
});

const RpcRequestSchema = z.object({
  method: z.literal('get_value_by_strategy'),
  params: RpcParamsSchema,
  id: z.number().optional().default(0)
});

export function validateRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    (req as any).validatedData = RpcRequestSchema.parse(req.body);

    next();
  } catch (error) {
    return rpcError(res, 400, error, req.body?.id ?? 0);
  }
}
