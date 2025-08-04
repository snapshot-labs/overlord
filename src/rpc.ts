import express from 'express';
import { rpcError, rpcSuccess } from './helpers/utils';
import getValue from './strategies';

const router = express.Router();

// Validation middleware
function validateRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { method, params, id = 0 } = req.body;

  if (!method) {
    return rpcError(res, 400, 'Method is required', id);
  }

  if (method !== 'get_value_by_strategy') {
    return rpcError(res, 400, 'Method not allowed', id);
  }

  if (!params) {
    return rpcError(res, 400, 'Params is required', id);
  }

  const { network, snapshot, strategies } = params;

  if (!network) {
    return rpcError(res, 400, 'Network is required', id);
  }

  if (!snapshot) {
    return rpcError(res, 400, 'Snapshot is required', id);
  }

  if (!strategies) {
    return rpcError(res, 400, 'Strategies is required', id);
  }

  next();
}

router.post('/', validateRequest, async function (req, res) {
  const {
    params: { network, snapshot, strategies },
    id = 0
  } = req.body;

  try {
    return rpcSuccess(res, await getValue(network, snapshot, strategies), id);
  } catch (err) {
    return rpcError(res, 500, err, id);
  }
});

export default router;
