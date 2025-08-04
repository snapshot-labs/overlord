import express from 'express';
import { rpcError, rpcSuccess } from './helpers/utils';
import { validateRequest } from './middleware/validation';
import getStrategiesValue from './strategies';

const router = express.Router();

router.post('/', validateRequest, async function (req, res) {
  const {
    params: { network, snapshot, strategies },
    id = 0
  } = req.body;

  try {
    return rpcSuccess(res, await getStrategiesValue(network, snapshot, strategies), id);
  } catch (err) {
    return rpcError(res, 500, err, id);
  }
});

export default router;
