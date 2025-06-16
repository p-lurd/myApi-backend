import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { join } from 'path';

// Try to load development environment by default
const envFile = '.env.development';
if (fs.existsSync(join(process.cwd(), envFile))) {
  dotenv.config({ path: envFile });
}

// Configuration stays consistent regardless of environment
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwtSecret: process.env.JWT_SECRET,
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DOMAIN: process.env.DOMAIN,
  // Other configuration values
});