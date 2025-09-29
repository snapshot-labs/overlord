import express, { Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler';
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

  describe('Strategy execution validation', () => {
    it('should execute single erc20-balance-of strategy', async () => {
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

    it('should execute multiple strategies with different decimals', async () => {
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
  });

  describe('Method parameter validation', () => {
    it('should return error for unknown method', async () => {
      const payload = {
        method: 'unknown_method',
        params: {},
        id: 833045074
      };

      const response = await request(app).post('/').send(payload).expect(400);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 833045074
      });
    });

    it('should return error when method is missing', async () => {
      const payload = {
        params: {
          network: '1',
          snapshot: 1640998800,
          strategies: []
        },
        id: 857498
      };

      const response = await request(app).post('/').send(payload).expect(400);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 857498
      });
    });
  });

  it('should return error when params is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      id: 833045888
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 833045888
    });
  });

  it('should return error when strategies is missing', async () => {
    const payload = {
      method: 'get_value_by_strategy',
      params: {
        network: '1',
        snapshot: 1640998800
      },
      id: 882731
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 882731
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
      id: 359894
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 359894
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
      id: 7066
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 7066
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
      id: 9158
    };

    const response = await request(app).post('/').send(payload).expect(400);

    expect(response.body).toMatchObject({
      jsonrpc: '2.0',
      error: {
        code: 400,
        message: 'Bad Request'
      },
      id: 9158
    });
  });

  describe('Snapshot parameter validation', () => {
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
        id: 5681
      };

      const response = await request(app).post('/').send(payload).expect(400);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 5681
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
        id: 4925
      };

      const response = await request(app).post('/').send(payload).expect(400);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 4925
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
        id: 3847
      };

      const response = await request(app).post('/').send(payload).expect(400);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 3847
      });
    });
  });

  describe('Decimals parameter validation', () => {
    it('should accept decimals as a valid string number', async () => {
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
                decimals: '18'
              }
            }
          ]
        },
        id: 7190
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept decimals as string "0" (boundary)', async () => {
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
                decimals: '0'
              }
            }
          ]
        },
        id: 3565
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept decimals as string "255" (boundary)', async () => {
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
                decimals: '255'
              }
            }
          ]
        },
        id: 8748
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept decimals as number 0 (boundary)', async () => {
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
                decimals: 0
              }
            }
          ]
        },
        id: 4121
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept decimals as number 255 (boundary)', async () => {
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
                decimals: 255
              }
            }
          ]
        },
        id: 3598
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should reject decimals as string "256" (out of range)', async () => {
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
                decimals: '256'
              }
            }
          ]
        },
        id: 247707
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 247707
      });
    });

    it('should reject decimals as string "-1" (negative)', async () => {
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
                decimals: '-1'
              }
            }
          ]
        },
        id: 5394
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 5394
      });
    });

    it('should reject decimals as non-numeric string', async () => {
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
                decimals: 'abc'
              }
            }
          ]
        },
        id: 1307
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 1307
      });
    });

    it('should reject decimals as string with leading zeros like "018"', async () => {
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
                decimals: '018'
              }
            }
          ]
        },
        id: 2477
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 2477
      });
    });

    it('should reject decimals as number 256 (out of range)', async () => {
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
        id: 2010
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 2010
      });
    });

    it('should reject decimals as negative number -1', async () => {
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
        id: 8827
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 8827
      });
    });
  });

  describe('Network parameter validation', () => {
    it('should return error when root network is missing', async () => {
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
        id: 2134
      };

      const response = await request(app).post('/').send(payload).expect(400);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 2134
      });
    });

    it('should accept root network as a number', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: 1,
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
        id: 8330
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept root network as a valid string', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: '137',
          snapshot: 1640998800,
          strategies: [
            {
              name: 'erc20-balance-of',
              params: {
                address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
                decimals: 18
              }
            }
          ]
        },
        id: 6158
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept strategy network as a number', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: '1',
          snapshot: 1640998800,
          strategies: [
            {
              name: 'erc20-balance-of',
              network: 137,
              params: {
                address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
                decimals: 18
              }
            }
          ]
        },
        id: 8330
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should accept strategy network as a string', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: '1',
          snapshot: 1640998800,
          strategies: [
            {
              name: 'erc20-balance-of',
              network: '137',
              params: {
                address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
                decimals: 18
              }
            }
          ]
        },
        id: 6158
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });

    it('should reject root network as non-numeric string', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: 'ethereum',
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
        id: 6111
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 6111
      });
    });

    it('should reject root network as zero or negative', async () => {
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
        id: 5377
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 5377
      });
    });

    it('should reject strategy network as non-numeric string', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: '1',
          snapshot: 1640998800,
          strategies: [
            {
              name: 'erc20-balance-of',
              network: 'polygon',
              params: {
                address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
                decimals: 18
              }
            }
          ]
        },
        id: 8574
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 8574
      });
    });

    it('should reject strategy network as negative number', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: '1',
          snapshot: 1640998800,
          strategies: [
            {
              name: 'erc20-balance-of',
              network: -1,
              params: {
                address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
                decimals: 18
              }
            }
          ]
        },
        id: 1815
      };

      const response = await request(app).post('/').send(payload).expect(400);
      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: {
          code: 400,
          message: 'Bad Request'
        },
        id: 1815
      });
    });

    it('should accept nested strategy network in multichain', async () => {
      const payload = {
        method: 'get_value_by_strategy',
        params: {
          network: '1',
          snapshot: 1640998800,
          strategies: [
            {
              name: 'multichain',
              params: {
                strategies: [
                  {
                    name: 'erc20-balance-of',
                    network: '137',
                    params: {
                      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
                      decimals: 18
                    }
                  },
                  {
                    name: 'erc20-balance-of',
                    network: 42161,
                    params: {
                      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
                      decimals: 18
                    }
                  }
                ]
              }
            }
          ]
        },
        id: 9388
      };

      const response = await request(app).post('/').send(payload).expect(200);
      expect(response.body.result).toBeDefined();
    });
  });
});
