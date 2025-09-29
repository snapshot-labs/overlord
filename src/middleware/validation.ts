import express from 'express';
import { z } from 'zod';

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const StrategyConfigSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().min(1, 'Strategy name is required'),
    network: z
      .union([
        z
          .string()
          .regex(
            /^[1-9]\d*$/,
            'Network must be a valid positive integer string'
          ),
        z.number().int().positive('Network must be a positive integer')
      ])
      .transform(val => (typeof val === 'string' ? parseInt(val) : val))
      .optional(),
    params: z
      .looseObject({
        address: z
          .string()
          .regex(EVM_ADDRESS_REGEX, 'Address must be a valid EVM address')
          .optional(),
        decimals: z
          .union([
            z.number().int().min(0).max(255),
            z
              .string()
              .regex(
                /^(0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])$/,
                'Decimals must be between 0 and 255'
              )
          ])
          .transform(val => (typeof val === 'string' ? parseInt(val) : val))
          .optional(),
        strategies: z
          .array(StrategyConfigSchema)
          .min(1, 'At least one strategy is required')
          .optional()
      })
      .optional()
  })
);

const RpcParamsSchema = z.object({
  network: z
    .union([
      z
        .string()
        .regex(/^[1-9]\d*$/, 'Network must be a valid positive integer string'),
      z.number().int().positive('Network must be a positive integer')
    ])
    .transform(val => (typeof val === 'string' ? parseInt(val) : val)),
  snapshot: z.number().int().positive('Snapshot must be a positive integer'),
  strategies: z
    .array(StrategyConfigSchema)
    .min(1, 'At least one strategy is required')
});

const RpcRequestSchema = z.object({
  method: z.literal('get_value_by_strategy'),
  params: RpcParamsSchema,
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
