import express from 'express';
import { rpcError, rpcSuccess } from './helpers/utils';
import { validateRequest } from './middleware/validation';
import getStrategiesValue from './strategies';

const router = express.Router();

router.post('/', validateRequest, async function (req, res) {
  const validatedData = (req as any).validatedData!;
  const { network, snapshot, strategies } = validatedData.params;
  const id = validatedData.id;

  try {
    return rpcSuccess(res, await getStrategiesValue(parseInt(network), snapshot, strategies), id);
  } catch (err) {
    return rpcError(res, 500, err, id);
  }
});

export default router;
