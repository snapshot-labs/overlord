import express, { Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler';
import { BATCH_MAX_LIMIT } from '../src/middleware/validation';
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

    // Add error handler middleware
    app.use(errorHandler);
  });

  it('should execute get_value_by_strategy with multiple requests', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: [
        {
          network: '1',
          snapshot: 1720900800,
          strategies: [
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
                decimals: 18
              }
            },
            {
              name: 'erc20-balance-of',
              network: 1,
              params: {
                // This should fail as it's an EOA address
                address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                decimals: 6
              }
            }
          ]
        }, // Return [] as one of the strategy throw
        {
          network: '137',
          snapshot: 1718400000,
          strategies: [
            {
              name: 'erc20-balance-of',
              network: 137,
              params: {
                address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                decimals: 6
              }
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                decimals: '18'
              }
            }
          ]
        }, // Both strategies valid
        {
          network: '56',
          snapshot: 1715808000,
          strategies: [
            {
              // will return 0 for unknown strategy
              name: 'unknown-strategy',
              network: 56,
              params: {
                address: '0x55d398326f99059ff775485246999027b3197955',
                decimals: '18'
              }
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                decimals: 18
              }
            }
          ]
        },
        {
          network: '56',
          snapshot: 1715808000,
          strategies: [
            {
              // will return 0 for invalid network
              name: 'erc20-balance-of',
              network: 'hello',
              params: {
                address: '0x55d398326f99059ff775485246999027b3197955',
                decimals: '18'
              }
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                decimals: 18
              }
            }
          ]
        },
        {
          network: '56',
          snapshot: 1715808000,
          strategies: [
            {
              // will return 0 for invalid decimals
              name: 'erc20-balance-of',
              params: {
                address: '0x55d398326f99059ff775485246999027b3197955',
                decimals: 'abc-18'
              }
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                decimals: 18
              }
            }
          ]
        },
        {
          network: '56',
          snapshot: 1715808000,
          strategies: [
            {
              // will return 0 for missing address
              name: 'erc20-balance-of',
              network: 'hello',
              params: {
                decimals: '18'
              }
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                decimals: 18
              }
            }
          ]
        },
        {
          network: '56',
          snapshot: 1715808000,
          strategies: [
            {
              // will return 0 for invalid address
              name: 'erc20-balance-of',
              params: {
                address: 'hello-0x55d398326f99059ff775485246999027b3197955',
                decimals: '18'
              }
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                decimals: 18
              }
            }
          ]
        },
        {
          network: '56',
          snapshot: 1715808000,
          strategies: [
            {
              // will return 0 for missing params
              name: 'erc20-balance-of'
            },
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                decimals: 18
              }
            }
          ]
        },
        {
          network: 42161,
          snapshot: 1722499200,
          strategies: [
            {
              name: 'erc20-balance-of',
              network: '42161',
              params: {
                address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
                decimals: 6
              }
            }
          ]
        } // This is valid, ensure that n+1 requests work fine, when n is failing
      ],
      id: 19
    };

    const response = await request(app).post('/').send(payload).expect(200);

    expect(response.body.result).toMatchSnapshot();
  }, 30e3);

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
      params: [
        {
          snapshot: 1720900800,
          strategies: [
            {
              name: 'erc20-balance-of',
              params: { address: '0x123' }
            }
          ]
        }
      ],
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
      params: [
        {
          network: '1',
          strategies: [
            {
              name: 'erc20-balance-of',
              params: { address: '0x123' }
            }
          ]
        }
      ],
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

  it('should return error when params array exceeds maximum limit', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: Array(BATCH_MAX_LIMIT + 1).fill({
        network: '1',
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
      }),
      id: 19
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 19
    });
  });
});
