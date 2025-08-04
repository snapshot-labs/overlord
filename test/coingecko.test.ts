// @ts-ignore
import { describe, expect, it } from 'bun:test';
import { getTokenPriceAtTimestamp } from '../src/helpers/coingecko';

describe('getTokenPriceAtTimestamp', () => {
  it('should execute getTokenPriceAtTimestamp with specific parameters', async () => {
    const result = await getTokenPriceAtTimestamp(
      1,
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      1640998800
    );
    expect(result).toMatchSnapshot();
  });

  it('should return 0 when the address is not valid', async () => {
    const result = await getTokenPriceAtTimestamp(
      1,
      '0x0000000000000000000000000000000000000000',
      1640998800
    );
    expect(result).toBe(0);
  });

  it('should return 0 when the network is not supported', async () => {
    const result = await getTokenPriceAtTimestamp(
      999999,
      '0xa0b86a33e6776d02b6c7c2b5c04b67a8e6e6e7e7',
      1640998800
    );
    expect(result).toBe(0);
  });

  it('should return 0 when timestamp is way in the future', async () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
    const result = await getTokenPriceAtTimestamp(
      1,
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      futureTimestamp
    );
    expect(result).toBe(0);
  });
});
