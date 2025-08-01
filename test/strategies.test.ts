// @ts-ignore
import { describe, expect, it } from 'bun:test';
import { strategies } from '../src/strategies';

describe('Strategies', () => {
  it('should export all strategies from the strategies folder', () => {
    expect(strategies).toBeDefined();
    expect(typeof strategies).toBe('object');

    // Check that expected strategies are exported
    expect(strategies['erc20-balance-of']).toBeDefined();

    // Check that each strategy is a function
    expect(typeof strategies['erc20-balance-of']).toBe('function');
  });

  it('should execute erc20-balance-of strategy with specific parameters', async () => {
    const result = await strategies['erc20-balance-of'](
      {
        address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        decimals: 18,
        symbol: 'UNI'
      },
      1,
      1640998800
    );
    expect(result).toMatchSnapshot();
  });

  it('should execute erc20-balance-of strategy with 6 decimals parameter on Base USDC', async () => {
    const result = await strategies['erc20-balance-of'](
      {
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 6,
        symbol: 'USDC'
      },
      8453,
      1640998800
    );
    expect(result).toMatchSnapshot();
  });

  it('should convert price when param decimals differ from token decimals', async () => {
    const result = await strategies['erc20-balance-of'](
      {
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 5, // USDC has 6 decimals, but we're using 5
        symbol: 'USDC'
      },
      8453,
      1640998800
    );
    expect(result).toMatchSnapshot();
  });

  it('should handle 0 decimals parameter correctly', async () => {
    const result = await strategies['erc20-balance-of'](
      {
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 0, // USDC has 6 decimals, but we're using 0
        symbol: 'USDC'
      },
      8453,
      1640998800
    );
    expect(result).toMatchSnapshot();
  });
});
