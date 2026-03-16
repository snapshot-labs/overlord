import getValue from '../../src/strategies/erc20-balance-of-weighted';

jest.mock('../../src/strategies/erc20-balance-of', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(100)
}));

describe('erc20-balance-of-weighted strategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should divide price by weight', async () => {
    const result = await getValue(
      { address: '0x123', weight: 0.5 } as any,
      1,
      1640998800
    );
    expect(result).toBe(200);
  });

  it('should divide price by coeff when weight is missing', async () => {
    const result = await getValue(
      { address: '0x123', coeff: 2 } as any,
      1,
      1640998800
    );
    expect(result).toBe(50);
  });

  it('should return 0 when weight and coeff are missing', async () => {
    const result = await getValue({ address: '0x123' } as any, 1, 1640998800);
    expect(result).toBe(0);
  });

  it('should return 0 when weight is 0', async () => {
    const result = await getValue(
      { address: '0x123', weight: 0 } as any,
      1,
      1640998800
    );
    expect(result).toBe(0);
  });
});
