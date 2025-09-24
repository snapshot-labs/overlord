import { getTokenPriceAtTimestamp } from '../src/helpers/coingecko';
import { getTokenDecimals } from '../src/helpers/token';
import getValue from '../src/strategies/erc20-balance-of';

jest.mock('../src/helpers/coingecko');
jest.mock('../src/helpers/token');

const mockedGetTokenPriceAtTimestamp =
  getTokenPriceAtTimestamp as jest.MockedFunction<
    typeof getTokenPriceAtTimestamp
  >;
const mockedGetTokenDecimals = getTokenDecimals as jest.MockedFunction<
  typeof getTokenDecimals
>;

describe('erc20-balance-of strategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful scenarios', () => {
    it('should calculate price with no decimal adjustment (18 decimals)', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(100);

      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(100); // 100 / 10^(18-18) = 100 / 1 = 100
      expect(mockedGetTokenDecimals).toHaveBeenCalledWith(
        1,
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
      );
      expect(mockedGetTokenPriceAtTimestamp).toHaveBeenCalledWith(
        1,
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        1640998800
      );
    });

    it('should calculate price with decimal adjustment (token: 6, params: 18)', async () => {
      mockedGetTokenDecimals.mockResolvedValue(6);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(100);

      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(100000000000000); // 100 / 10^(6-18) = 100 / 10^-12 = 100 * 10^12
    });

    it('should calculate price with decimal adjustment (token: 18, params: 6)', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(100);

      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 6 },
        1,
        1640998800
      );

      expect(result).toBe(0.0000000001); // 100 / 10^(18-6) = 100 / 10^12
    });

    it('should use default decimals when not provided', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(100);

      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
        1,
        1640998800
      );

      expect(result).toBe(100); // Default is 18 decimals
    });

    it('should handle decimal as string number', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(100);

      const result = await getValue(
        {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: '6' as any
        },
        1,
        1640998800
      );

      expect(result).toBe(0.0000000001);
    });
  });

  describe('error handling', () => {
    it('should return 0 for undefined address', async () => {
      const result = await getValue(
        { address: undefined as any, decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should return 0 for invalid address', async () => {
      const result = await getValue(
        { address: 'invalid-address', decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should return 0 for negative decimals', async () => {
      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: -1 },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should return 0 for decimals > 255', async () => {
      const result = await getValue(
        {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: 256
        },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should return 0 for invalid decimal value', async () => {
      const result = await getValue(
        {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: 'invalid' as any
        },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should return 0 for floating point decimals', async () => {
      const result = await getValue(
        {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: 18.5
        },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should return 0 for floating point decimals as string', async () => {
      const result = await getValue(
        {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          decimals: '18.5' as any
        },
        1,
        1640998800
      );

      expect(result).toBe(0);
      expect(mockedGetTokenDecimals).not.toHaveBeenCalled();
      expect(mockedGetTokenPriceAtTimestamp).not.toHaveBeenCalled();
    });

    it('should propagate errors from getTokenDecimals', async () => {
      mockedGetTokenDecimals.mockRejectedValue(new Error('Network error'));

      await expect(
        getValue(
          {
            address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
            decimals: 18
          },
          1,
          1640998800
        )
      ).rejects.toThrow('Network error');
    });

    it('should propagate errors from getTokenPriceAtTimestamp', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockRejectedValue(new Error('API error'));

      await expect(
        getValue(
          {
            address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
            decimals: 18
          },
          1,
          1640998800
        )
      ).rejects.toThrow('API error');
    });
  });

  describe('edge cases', () => {
    it('should handle price of 0', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(0);

      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(0);
    });

    it('should handle very small prices with precision', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(0.00000001);

      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(0.00000001);
    });

    it('should handle checksummed and non-checksummed addresses', async () => {
      mockedGetTokenDecimals.mockResolvedValue(18);
      mockedGetTokenPriceAtTimestamp.mockResolvedValue(100);

      // Test with lowercase address
      const result = await getValue(
        { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
        1,
        1640998800
      );

      expect(result).toBe(100);
      // getAddress should normalize it to checksummed version
      expect(mockedGetTokenDecimals).toHaveBeenCalledWith(
        1,
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
      );
    });
  });
});
