const express = require('express');
const router = express.Router();
const { isAuthorized } = require('../middleware/auth'); // Make sure the named export matches
require('@shopify/shopify-api/adapters/node');
const { ApiVersion, shopifyApi} = require('@shopify/shopify-api');


// Initialize and configure Shopify
const shopify = shopifyApi({
apiSecretKey: process.env.SHOPIFY_SECRET,
  hostName: process.env.SHOPIFY_STORE_DOMAIN,
  API_VERSION: ApiVersion.April23, // The API version you're using
  IS_EMBEDDED_APP: true,
  apiKey: process.env.SHOPIFY_API_KEY,
  scopes: process.env.SHOPIFY_API_SCOPES
});


// Then, when you need to make a call to the API:
router.get('/products', isAuthorized, async (req, res) => {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res); // Load the current session
    const products = await Shopify.Product.all({
      session: session,
      limit: 250 // Adjust the limit as needed
    });
    res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});
