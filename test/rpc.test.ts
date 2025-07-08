// @ts-ignore
import { describe, expect, it } from 'bun:test';
import { getTokenDecimals } from '../src/helpers/rpc';

describe('getTokenDecimals', () => {
  it('should get token decimals for UNI token on Ethereum', async () => {
    const result = await getTokenDecimals(
      1, // Ethereum mainnet
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' // UNI token address
    );
    expect(result).toMatchSnapshot();
  });

  it('should get token decimals for USDC token on Base', async () => {
    const result = await getTokenDecimals(
      8453, // Base network
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' // USDC token address
    );
    expect(result).toMatchSnapshot();
  });
});
