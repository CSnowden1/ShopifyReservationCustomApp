const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  shopifyApiKey: process.env.SHOPIFY_API_KEY,
  shopifySecret: process.env.SHOPIFY_SECRET,
  shopifyScopes: process.env.SHOPIFY_SCOPES || 'read_products,write_products',
  shopifyWebhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  sessionSecret: process.env.SESSION_SECRET,
  // Add other configurations as needed
};

module.exports = config;
