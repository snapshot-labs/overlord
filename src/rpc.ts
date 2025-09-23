import express from 'express';
import { validateRequest } from './middleware/validation';
import getStrategiesValue from './strategies';

const router = express.Router();

router.post('/', validateRequest, async function (req, res) {
  const validatedData = (req as any).validatedData!;

  res.json({
    jsonrpc: '2.0',
    result: await getStrategiesValue(validatedData.params),
    id: validatedData.id
  });
});

export default router;
