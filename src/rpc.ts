import express from 'express';
import { validateRequest } from './middleware/validation';
import getStrategiesValue from './strategies';

const router = express.Router();

router.post('/', validateRequest, async function (req, res) {
  const validatedData = (req as any).validatedData!;
  const { network, snapshot, strategies } = validatedData.params;

  const result = await getStrategiesValue(parseInt(network), snapshot, strategies);
  res.json({
    jsonrpc: '2.0',
    result,
    id: validatedData.id
  });
});

export default router;
