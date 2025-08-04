# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is @snapshot-labs/overlord, a JSON-RPC server that provides token unit pricing in USD for snapshot strategies at specified block timestamps across 200+ blockchain networks. The service fetches historical token prices from CoinGecko's Pro API.

## Architecture

The codebase follows a modular architecture:

1. **Express Server** (`src/index.ts`): Main entry point with CORS, JSON middleware, and route setup
2. **JSON-RPC Router** (`src/rpc.ts`): Handles `get_value_by_strategy` method with request validation
3. **Strategy System** (`src/strategies/`): Pluggable pricing strategies with unified interface
4. **CoinGecko Integration** (`src/helpers/coingecko.ts`): API client with platform ID mappings for 200+ networks
5. **Token Helpers** (`src/helpers/token.ts`): ERC20 token utilities for decimal conversion
6. **Utilities** (`src/helpers/utils.ts`): RPC response helpers and common functions

### Strategy Architecture

Strategies implement the signature: `(params: any, network: number, snapshot: number) => Promise<number>`

- **Core Strategy**: `erc20-balance-of` - Fetches token prices and handles decimal conversion
- **Composite Strategies**: `multichain`, `uni` - Handle complex scenarios with multiple tokens/networks
- **Strategy Aliases**: Multiple strategy names map to the same implementation (e.g., all ERC20 variants use `erc20-balance-of`)

## Development Commands

```bash
# Build TypeScript to dist/
bun run build

# Type checking without emit
bun run typecheck

# Run tests with Bun test runner
bun test

# Run specific test file
bun test test/strategies.test.ts

# Update test snapshots
bun test --update-snapshots

# Lint code
bun run lint

# Auto-fix lint issues (run after each file edit)
bun run lint:fix

# Development server with watch mode
bun run dev

# Production server
bun run start
```

## Environment Requirements

- **COINGECKO_API_KEY**: Required Pro API key for CoinGecko price data
- **PORT**: Optional server port (defaults to 3000)
- **COMMIT_HASH**: Optional commit hash for version endpoint

## Network Support

The service supports 200+ blockchain networks via CoinGecko platform IDs defined in `src/helpers/coingecko.ts:PLATFORM_IDS`. Key networks include:
- Ethereum (1), Polygon (137), BSC (56)
- Arbitrum One (42161), Optimism (10), Base (8453)
- Avalanche (43114), and many others

## Testing Strategy

- Uses Bun's built-in test runner with snapshot testing
- Tests are organized by functionality: strategies, coingecko, token helpers, e2e
- Snapshots ensure consistent API responses across changes
- Tests use real token addresses and network IDs for integration testing

## JSON-RPC API

Single endpoint: `POST /` with method `get_value_by_strategy`

Request format:
```json
{
  "method": "get_value_by_strategy",
  "params": {
    "network": 1,
    "snapshot": 1640998800,
    "strategies": [
      {
        "name": "erc20-balance-of",
        "network": "1",
        "params": {
          "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
          "decimals": 18
        }
      }
    ]
  },
  "id": 1
}
```

Returns array of USD unit prices corresponding to each strategy in the same order.

## Code Patterns

- **Error Handling**: Uses `rpcError()` and `rpcSuccess()` helpers for consistent JSON-RPC responses
- **Caching**: CoinGecko responses are cached in-memory with composite keys
- **Strategy Registration**: Strategies are registered in `src/strategies/index.ts` with name-to-function mapping
- **Type Safety**: Full TypeScript with interfaces for strategy configs and parameters
- **Decimal Handling**: Token amounts are converted from wei to readable units using token decimals