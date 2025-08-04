# @snapshot-labs/overlord

A JSON-RPC server that returns token unit prices in USD for snapshot
strategies at specified block timestamps across multiple blockchain
networks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Overlord is an Express-based JSON-RPC server application that fetches token unit
prices in USD for snapshot strategies at specific block timestamps. The
service retrieves historical token prices from CoinGecko across 200+
blockchain networks with robust input validation and caching.

## Features

- **Token Unit Pricing**: Fetches USD price per token unit at specific timestamps
- **Multi-Network Support**: Compatible with 200+ blockchain networks via
  CoinGecko platform mappings
- **JSON-RPC API**: Express-based server with standardized JSON-RPC 2.0
  interface
- **TypeScript**: Full TypeScript support with comprehensive type
  definitions
- **Input Validation**: Robust input validation using Zod schemas
- **Caching**: Built-in in-memory caching for improved performance
- **Testing**: Comprehensive test suite with snapshot testing

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/snapshot-labs/overlord.git
cd overlord
bun install
```

## Environment Setup

Create a `.env` file in your project root:

```env
COINGECKO_API_KEY=your_coingecko_pro_api_key
```

## Usage

Start the server:

```bash
# Development mode with watch
bun run dev

# Production mode
bun start

# Build and run
bun run build
bun run start
```

The server will be available at `http://localhost:3000` (or your
configured PORT).

## JSON-RPC API

Send POST requests to `/` with the following format:

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

Response:

```json
{
  "jsonrpc": "2.0",
  "result": [1234.56],
  "id": 1
}
```

The result array contains the USD unit prices corresponding to each token
in the snapshot strategies. The array is the same size and order as the
input `params.strategies` array, and returns `0` for unsupported strategies.
For strategies with inner strategies, it returns the lowest value among the
inner strategies.

### Example Request

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## Supported Strategies

| Strategy Name                      | Description                           |
| ---------------------------------- | ------------------------------------- |
| `erc20-balance-of`                 | Standard ERC20 token balance          |
| `erc20-balance-of-delegation`      | ERC20 balance with delegation support |
| `erc20-balance-of-with-delegation` | ERC20 balance with delegation         |
| `erc20-votes`                      | ERC20 votes implementation            |
| `erc20-votes-with-override`        | ERC20 votes with override capability  |
| `comp-like-votes`                  | Compound-like voting mechanism        |
| `uni`                              | Uniswap-specific strategy             |
| `multichain`                       | Multi-chain aggregation strategy      |
| `delegation`                       | Delegation strategy                   |
| `with-delegation`                  | Generic delegation support            |

## Supported Networks

The server supports 200+ blockchain networks including:

- **Ethereum** (1) - `ethereum`
- **Polygon** (137) - `polygon-pos`
- **BSC** (56) - `binance-smart-chain`
- **Arbitrum One** (42161) - `arbitrum-one`
- **Optimism** (10) - `optimistic-ethereum`
- **Avalanche** (43114) - `avalanche`
- **Base** (8453) - `base`
- **And many more...**

See the full list in `src/helpers/coingecko.ts:PLATFORM_IDS`.

## Architecture

The server follows a modular architecture:

1. **Express Server** (`src/index.ts`): Main entry point with CORS, JSON middleware, and route setup
2. **JSON-RPC Router** (`src/rpc.ts`): Handles `get_value_by_strategy` method with request validation
3. **Validation Middleware** (`src/middleware/validation.ts`): Zod-based input validation and sanitization
4. **Strategy System** (`src/strategies/`): Pluggable pricing strategies with unified interface
5. **CoinGecko Integration** (`src/helpers/coingecko.ts`): API client with platform ID mappings for 200+ networks
6. **Token Helpers** (`src/helpers/token.ts`): ERC20 token utilities for decimal conversion
7. **Cache System** (`src/helpers/cache.ts`): In-memory caching for API responses
8. **Utilities** (`src/helpers/utils.ts`): RPC response helpers and common functions

### Strategy Architecture

Strategies implement the signature: `(params: any, network: number, snapshot: number) => Promise<number>`

- **Core Strategy**: `erc20-balance-of` - Fetches token prices and handles decimal conversion
- **Composite Strategies**: `multichain`, `uni` - Handle complex scenarios with multiple tokens/networks
- **Strategy Aliases**: Multiple strategy names map to the same implementation

## Development

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 22+
- CoinGecko Pro API key

### Scripts

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test

# Start development server with watch mode
bun run dev

# Lint code
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Type checking
bun run typecheck
```

### Testing

The project uses Bun's built-in test runner with snapshot testing:

```bash
# Run all tests
bun test

# Run specific test
bun test test/strategies.test.ts

# Update snapshots
bun test --update-snapshots
```

## API Reference

### JSON-RPC Methods

#### `get_value_by_strategy`

Fetch USD unit prices for tokens specified in snapshot strategies at a
given block timestamp.

**Parameters:**

- `network` (number): Blockchain network ID
- `snapshot` (number): Unix timestamp in seconds for the snapshot block
- `strategies` (array): Array of strategy configurations

**Strategy Configuration:**

- `name` (string): Strategy name from supported strategies (e.g., `erc20-balance-of`)
- `network` (string): Network ID as string (e.g., `"1"`)
- `params` (object): Strategy-specific parameters
  - `address` (string): EVM token contract address (e.g., `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984`)
  - `decimals` (number): Token decimals (e.g., `18`)

**Returns:** Array of numbers representing USD unit prices for each
token

## Error Handling

The API returns standardized JSON-RPC 2.0 error responses:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": 400,
    "message": "unauthorized",
    "data": "Network is required"
  },
  "id": 1
}
```

Common error codes:

- `400`: Bad Request (missing or invalid parameters)
- `500`: Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `bun test`
5. Run linting: `bun run lint:fix`
6. Commit changes: `git commit -am 'Add my feature'`
7. Push to branch: `git push origin feature/my-feature`
8. Create a Pull Request

## License

This project is licensed under the MIT License - see the
[LICENSE](LICENSE) file for details.

## Links

- [Snapshot Labs](https://snapshot.org)
- [GitHub Repository](https://github.com/snapshot-labs/overlord)
- [CoinGecko API](https://www.coingecko.com/en/api)

---

Built with ❤️ by [Snapshot Labs](https://snapshot.org)
