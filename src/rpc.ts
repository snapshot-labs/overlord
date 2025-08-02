import express from 'express';
import { getVpValueByStrategy, rpcError, rpcSuccess } from './helpers/utils';

const router = express.Router();

router.post('/', async function (req, res) {
  const { method, params, id = 0 } = req.body;
  const { network, snapshot, strategies } = params || {};

  if (method === 'get_value_by_strategy') {
    try {
      const result = await getVpValueByStrategy(network, snapshot, strategies);

      return rpcSuccess(res, result, id);
    } catch (err) {
      return rpcError(res, 500, err, id);
    }
  }

  return res.status(400).json({ error: 'Method not found' });
});

export default router;
