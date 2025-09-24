import getStrategiesValue from '../src/strategies';
import erc20BalanceOf from '../src/strategies/erc20-balance-of';

jest.mock('../src/strategies/erc20-balance-of');

const mockedErc20BalanceOf = erc20BalanceOf as jest.MockedFunction<
  typeof erc20BalanceOf
>;

describe('Strategies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute multiple strategy sets and return mocked values', async () => {
    // Mock the strategies to return sequential values
    mockedErc20BalanceOf
      .mockResolvedValueOnce(1) // First strategy in first set
      .mockRejectedValueOnce(new Error('Token price fetch failed')) // Second strategy throws error
      .mockResolvedValueOnce(2) // Second set, valid strategy
      .mockResolvedValueOnce(3) // Third set, first strategy
      .mockResolvedValueOnce(4) // Third set, second strategy
      .mockResolvedValueOnce(5); // Fourth set
    const result = await getStrategiesValue([
      {
        network: '100', // Gnosis
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            params: {
              address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
              decimals: 6
            }
          },
          {
            name: 'erc20-balance-of',
            network: 100 as any,
            params: {
              address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // Will throw error
              decimals: 18
            }
          }
        ]
      },
      {
        network: '56', // BSC
        snapshot: 1640998800,
        strategies: [
          {
            name: 'invalid-strategy-name',
            network: 56 as any,
            params: {
              address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
              decimals: 18
            }
          },
          {
            name: 'erc20-balance-of',
            params: {
              address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
              decimals: '18' as any
            }
          }
        ]
      },
      {
        network: '1',
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-balance-of',
            network: 137 as any, // network as number (Polygon)
            params: {
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              decimals: '18' as any // decimals as string
            }
          },
          {
            name: 'erc20-balance-of-delegation',
            // no network key - will use parent network
            params: {
              address: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
              decimals: 6 // decimals as number
            }
          }
        ]
      },
      {
        network: 10 as any, // network as number (Optimism)
        snapshot: 1640998800,
        strategies: [
          {
            name: 'erc20-votes',
            network: '8453', // network as string (Base)
            params: {
              address: '0x4200000000000000000000000000000000000006',
              decimals: 18 // decimals as number
            }
          }
        ]
      }
    ]);

    // Verify the mocked values are returned correctly
    expect(result).toEqual([
      [], // First set: error in strategy causes empty array
      [0, 2], // Second set: invalid strategy returns 0, valid returns 2
      [3, 4], // Third strategy set returns 3 and 4
      [5] // Fourth strategy set returns 5
    ]);

    // With parallel processing, all strategies start in parallel, so we expect 6 calls
    // (even though the first set returns empty due to error, both strategies in that set are called)
    expect(mockedErc20BalanceOf).toHaveBeenCalledTimes(6);

    // First call - first strategy in first set
    expect(mockedErc20BalanceOf).toHaveBeenNthCalledWith(
      1,
      { address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', decimals: 6 },
      100, // Gnosis network (uses parent)
      1640998800
    );

    // Second call - second strategy in first set (throws error)
    expect(mockedErc20BalanceOf).toHaveBeenNthCalledWith(
      2,
      { address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', decimals: 18 },
      100, // Gnosis network
      1640998800
    );

    // Third call - valid strategy in second set
    expect(mockedErc20BalanceOf).toHaveBeenNthCalledWith(
      3,
      { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: '18' },
      56, // BSC network
      1640998800
    );

    // Fourth call - network 137 as number, decimals as string
    expect(mockedErc20BalanceOf).toHaveBeenNthCalledWith(
      4,
      { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: '18' },
      137, // Should be converted to number
      1640998800
    );

    // Fifth call - no network key, uses parent network 1
    expect(mockedErc20BalanceOf).toHaveBeenNthCalledWith(
      5,
      { address: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', decimals: 6 },
      1, // Uses parent network
      1640998800
    );

    // Sixth call - network 8453 as string, decimals as number
    expect(mockedErc20BalanceOf).toHaveBeenNthCalledWith(
      6,
      { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
      8453, // Should be converted to number
      1640998800
    );
  });
});
