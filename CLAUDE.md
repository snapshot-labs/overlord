# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is @snapshot-labs/overlord, a JSON-RPC server that provides token unit pricing in USD for snapshot strategies at specified block timestamps across 200+ blockchain networks. The service fetches historical token prices from CoinGecko's Pro API.

## Development Commands

```bash
# Build TypeScript to dist/
yarn build

# Type checking without emit
yarn typecheck

# Run all tests
yarn test

# Run specific test file
yarn test test/strategies.test.ts

# Update test snapshots
yarn test --updateSnapshot

# Lint code
yarn lint

# Auto-fix lint issues (run after each file edit)
yarn lint:fix

# Development server with watch mode
yarn dev

# Production server (requires build first)
yarn start
```

## Architecture

### Request Flow
```
HTTP Request → Express CORS/JSON → Validation Middleware → RPC Handler → Strategy Execution → Response
                                        ↓ (on error)
                                   Error Handler → JSON-RPC Error Response
```

### Batch Request Processing

The server supports batch requests at two levels:
1. **Multiple proposals per request** - up to 100 proposal objects per JSON-RPC request
2. **Multiple strategies per proposal** - each proposal can contain multiple strategies

Example batch request structure:
```json
{
  "method": "get_value_by_strategy",
  "params": [
    { // Proposal 1
      "network": 1,
      "snapshot": 1640998800,
      "strategies": [/* multiple strategies */]
    },
    { // Proposal 2
      "network": 137,
      "snapshot": 1640998800,
      "strategies": [/* multiple strategies */]
    }
  ],
  "id": 1
}
```

### Strategy System

**Strategy Registration** (`src/strategies/index.ts`):
- Strategies are registered in a simple object mapping names to functions
- Multiple strategy names can map to the same implementation (aliases)
- Strategy signature: `(params: any, network: number, snapshot: number) => Promise<number>`

**Strategy Types**:
- **Core**: `erc20-balance-of` - Fetches token prices from CoinGecko
- **Composite**: `multichain`, `uni` - Orchestrate other strategies with custom logic
- **Aliases**: `erc20-votes`, `comp-like-votes`, etc. → all use `erc20-balance-of`

**Error Handling in Strategies**:
- Parameter errors (invalid address, missing decimals) → return `0`
- Network/API errors → throw (caught by proposal handler)
- Any thrown error in a strategy → entire proposal returns `[]`

### Middleware Architecture

1. **Validation Middleware** (`src/middleware/validation.ts`):
   - Uses Zod for schema validation
   - Validates JSON-RPC structure and parameters
   - Flexible network ID handling (string or number)
   - Max 100 proposals per request (BATCH_MAX_LIMIT)

2. **Error Handler** (`src/middleware/errorHandler.ts`):
   - Centralizes all error responses
   - Converts validation errors to 400 with detailed field errors
   - Converts runtime errors to 500
   - Always returns JSON-RPC compliant error format

### Key Implementation Patterns

**Parallel Execution with Fail-Fast**:
```typescript
// In src/strategies/index.ts getValue()
// All strategies execute in parallel, but if one fails, entire proposal returns []
strategies.forEach(async (strategy, index) => {
  try {
    const value = await executeStrategy(...);
    result[index] = value;
  } catch {
    if (!hasError) {
      hasError = true;
      resolve([]); // Fail-fast for the proposal
    }
  }
});
```

**Network ID Resolution**:
- Validation accepts both string and number formats
- Strategies use `toInteger()` helper to normalize
- Invalid network → strategy returns 0 (not an error)

**Caching Strategy**:
- Simple in-memory Map with no TTL or eviction
- Used for CoinGecko API responses
- Key format: `token-price-${network}-${address}-${timestamp}`

## Environment Requirements

- **COINGECKO_API_KEY**: Required Pro API key for token price data
- **PORT**: Optional server port (defaults to 3000)
- **COMMIT_HASH**: Optional for version endpoint
- Node.js >=22.0.0

## Testing Strategy

- Jest with TypeScript via ts-jest
- Snapshot testing for API responses
- E2E tests use supertest to test full request/response cycle
- Unit tests for individual strategies and helpers
- Real token addresses and network IDs used in tests

## Common Development Tasks

When modifying strategies:
1. Add/update strategy function in `src/strategies/`
2. Register in `src/strategies/index.ts`
3. Update tests with new scenarios
4. Run `yarn test --updateSnapshot` if response format changes

When adding new networks:
1. Add platform ID mapping in `src/helpers/coingecko.ts:PLATFORM_IDS`
2. Ensure CoinGecko supports the platform

## Code Patterns

- **Error Returns**: Strategies return `0` for invalid params, throw for runtime errors
- **Type Flexibility**: Strategy params use `[key: string]: any` for extensibility
- **Validation Flow**: Loose validation in middleware, strict checks in domain logic
- **Decimal Handling**: Always convert token amounts from wei using decimals parameter