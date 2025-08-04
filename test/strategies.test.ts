// @ts-ignore
import { describe, expect, it } from 'bun:test';
import getStrategiesValue from '../src/strategies';

describe('Strategies', () => {
  it('should execute erc20-balance-of strategy with specific parameters', async () => {
    const result = await getStrategiesValue(1, 1640998800, [
      {
        name: 'erc20-balance-of',
        network: '1',
        params: {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: 18
        }
      }
    ]);
    expect(result).toMatchSnapshot();
  });

  it('should execute erc20-balance-of strategy with 6 decimals parameter on Base USDC', async () => {
    const result = await getStrategiesValue(8453, 1640998800, [
      {
        name: 'erc20-balance-of',
        network: '8453',
        params: {
          address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          decimals: 6
        }
      }
    ]);
    expect(result).toMatchSnapshot();
  });

  it('should convert price when param decimals differ from token decimals', async () => {
    const result = await getStrategiesValue(8453, 1640998800, [
      {
        name: 'erc20-balance-of',
        network: '8453',
        params: {
          address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          decimals: 5 // USDC has 6 decimals, but we're using 5
        }
      }
    ]);
    expect(result).toMatchSnapshot();
  });

  it('should handle 0 decimals parameter correctly', async () => {
    const result = await getStrategiesValue(8453, 1640998800, [
      {
        name: 'erc20-balance-of',
        network: '8453',
        params: {
          address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          decimals: 0 // USDC has 6 decimals, but we're using 0
        }
      }
    ]);
    expect(result).toMatchSnapshot();
  });

  it('should throw error for invalid address parameter', async () => {
    await expect(
      getStrategiesValue(1, 1640998800, [
        {
          name: 'erc20-balance-of',
          network: '1',
          params: {
            address: '0xinvalid',
            decimals: 18
          }
        }
      ])
    ).rejects.toThrow();
  });

  it('should throw error for invalid network parameter', async () => {
    await expect(
      getStrategiesValue(99999, 1640998800, [
        {
          name: 'erc20-balance-of',
          network: '99999',
          params: {
            address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
            decimals: 18
          }
        }
      ])
    ).rejects.toThrow();
  });

  it('should return 0 for unsupported strategy name', async () => {
    const result = await getStrategiesValue(1, 1640998800, [
      {
        name: 'unsupported-strategy',
        network: '1',
        params: {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: 18
        }
      }
    ]);
    expect(result).toEqual([0]);
  });

  it('should execute multiple strategies', async () => {
    const result = await getStrategiesValue(1, 1640998800, [
      {
        name: 'erc20-balance-of',
        network: '1',
        params: {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: 18
        }
      },
      {
        name: 'erc20-balance-of-delegation',
        network: '1',
        params: {
          address: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
          decimals: 18
        }
      }
    ]);
    expect(result).toMatchSnapshot();
    expect(result).toHaveLength(2);
  });
});
