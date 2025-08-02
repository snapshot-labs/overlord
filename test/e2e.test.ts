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
        network: 1,
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            network: '1',
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: 18,
              symbol: 'UNI'
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
        network: 8453,
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            network: '8453',
            params: {
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              decimals: 6,
              symbol: 'USDC'
            }
          },
          {
            name: 'erc20-balance-of',
            network: '8453',
            params: {
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              decimals: 5,
              symbol: 'USDC'
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
      error: 'Method not found'
    });
  });
});
