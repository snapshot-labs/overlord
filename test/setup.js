const { join } = require('path');
const dotenv = require('dotenv');

// Load main .env file
dotenv.config({ quiet: true });

// Load test-specific .env file and override main .env values
const testEnvPath = join(process.cwd(), 'test', '.env.test');
dotenv.config({ path: testEnvPath, override: true, quiet: true });
