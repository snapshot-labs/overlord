import { beforeAll, describe, expect, it } from 'bun:test';
import express, { Express } from 'express';
import request from 'supertest';
import rpcRouter from '../src/rpc';

describe('E2E API Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Create Express app with same middleware as main app
    app = express();
    app.use(express.json({ limit: '4mb' }));
    app.use(express.urlencoded({ limit: '4mb', extended: false }));

    // Mount the RPC router
    app.use('/', rpcRouter);
  });

  it('should execute get_value_by_strategy with erc20-balance-of strategy', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            network: '1',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18
            }
          }
        ]
      },
      id: 1
    };

    const response = await request(app).post('/').send(payload).expect(200);

    expect(response.body.result).toMatchSnapshot();
  });

  it('should execute get_value_by_strategy with multiple strategies', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '8453',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            network: '8453',
            params: {
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              decimals: 6
            }
          },
          {
            name: 'erc20-balance-of',
            network: '8453',
            params: {
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              decimals: 5
            }
          }
        ]
      },
      id: 2
    };

    const response = await request(app).post('/').send(payload).expect(200);

    expect(response.body.result).toMatchSnapshot();
  });

  it('should return error for unknown method', async () => {
    const payload = {
      method: 'unknown_method',
      params: {},
      id: 3
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 3
    });
  });

  it('should return error when method is missing', async () => {
    const payload = {
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: []
      },
      id: 4
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 4
    });
  });

  it('should return error when params is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      id: 5
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 5
    });
  });

  it('should return error when network is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: { address: '0x123' }
          }
        ]
      },
      id: 6
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 6
    });
  });

  it('should return error when snapshot is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        strategies: [
          {
            name: 'erc20-balance-of',
            params: { address: '0x123' }
          }
        ]
      },
      id: 7
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 7
    });
  });

  it('should return error when strategies is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800
      },
      id: 8
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 8
    });
  });

  it('should return error when strategy name is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18
            }
          }
        ]
      },
      id: 9
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 9
    });
  });

  it('should return error when address is not a valid EVM address', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: 'invalid-address',
              decimals: 18
            }
          }
        ]
      },
      id: 10
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 10
    });
  });

  it('should return error when network is not a number', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: 'invalid',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18
            }
          }
        ]
      },
      id: 11
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 11
    });
  });

  it('should return error when snapshot is not a number', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 'invalid',
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18
            }
          }
        ]
      },
      id: 12
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 12
    });
  });

  it('should return error when decimals is not a valid number', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 'invalid'
            }
          }
        ]
      },
      id: 13
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 13
    });
  });

  it('should return error when network is zero or negative', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: -1,
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18
            }
          }
        ]
      },
      id: 14
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 14
    });
  });

  it('should return error when snapshot is zero or negative', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 0,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18
            }
          }
        ]
      },
      id: 15
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 15
    });
  });

  it('should return error when decimals is out of range (>255)', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 256
            }
          }
        ]
      },
      id: 16
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 16
    });
  });

  it('should return error when decimals is negative', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: -1
            }
          }
        ]
      },
      id: 17
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 17
    });
  });

  it('should return error when nested strategies array is empty', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'multichain',
            params: {
              strategies: []
            }
          }
        ]
      },
      id: 18
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 18
    });
  });
});
