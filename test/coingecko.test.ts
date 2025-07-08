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
});
