import getValue from '../../src/strategies/eth-balance';

jest.mock('../../src/helpers/coingecko', () => ({
  getEthPriceAtTimestamp: jest.fn().mockResolvedValue(1000)
}));

describe('eth-balance strategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return base price when decimals is 18 (default)', async () => {
    const result = await getValue({} as any, 1, 1640998800);
    expect(result).toBe(1000);
  });

  it('should return base price when decimals is explicitly set to 18', async () => {
    const result = await getValue({ decimals: 18 } as any, 1, 1640998800);
    expect(result).toBe(1000);
  });

  it('should scale price correctly when decimals is less than 18', async () => {
    const result = await getValue({ decimals: 6 } as any, 1, 1640998800);
    expect(result).toBe(1e-9);
  });

  it('should scale price correctly when decimals is greater than 18', async () => {
    const result = await getValue({ decimals: 20 } as any, 1, 1640998800);
    expect(result).toBe(100000);
  });

  it('should handle edge case with decimals = 0', async () => {
    const result = await getValue({ decimals: 0 } as any, 1, 1640998800);
    expect(result).toBe(1e-15);
  });
});
