import express from 'express';
import { z } from 'zod';

export const BATCH_MAX_LIMIT = 100;

const RpcParamsSchema = z.object({
  network: z.union([z.string(), z.number()]),
  snapshot: z.number().int().positive('Snapshot must be a positive integer'),
  strategies: z
    .array(z.looseObject({}))
    .min(1, 'At least one strategy is required')
});

const RpcRequestSchema = z.object({
  method: z.literal('get_value_by_strategy'),
  params: z
    .array(RpcParamsSchema)
    .min(1, 'At least one proposal param is required')
    .max(
      BATCH_MAX_LIMIT,
      `A maximum of ${BATCH_MAX_LIMIT} proposals param are allowed`
    ),
  id: z.number().optional().default(0)
});

export async function validateRequest(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) {
  (req as any).validatedData = await RpcRequestSchema.parseAsync(req.body);
  next();
}
