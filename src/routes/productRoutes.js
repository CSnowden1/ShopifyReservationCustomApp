const express = require('express');
const router = express.Router();
const https = require('https');



// Function to make a GET request to Shopify API
function getShopifyProducts(shopDomain, accessToken, apiPath, callback) {
  const options = {
    hostname: shopDomain,
    path: apiPath,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    }
  };

  const req = https.request(options, res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      callback(null, JSON.parse(data));
    });
  });

  req.on('error', e => {
    callback(e, null);
  });

  req.end();
}

// Route handler to get products
router.get('/products', (req, res) => {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN; 
  const apiPath = '/admin/api/2024-04/products.json';

  getShopifyProducts(shopDomain, accessToken, apiPath, (error, products) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(products);
  });
});



function getShopifyProductVariants(shopDomain, accessToken, productId, callback) {
    const apiPath = `/admin/api/2024-04/products/${productId}/variants.json`; // API path to get variants for a product
  
    const options = {
      hostname: shopDomain,
      path: apiPath,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    };
  
    const req = https.request(options, res => {
      let data = '';
  
      res.on('data', chunk => {
        data += chunk;
      });
  
      res.on('end', () => {
        callback(null, JSON.parse(data));
      });
    });
  
    req.on('error', e => {
      callback(e, null);
    });
  
    req.end();
  }
  
  // Route handler to get variants for a specific product
  router.get('/products/:productId/variants', (req, res) => {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN; 
    const productId = req.params.productId; // Get the product ID from the request parameters
  
    getShopifyProductVariants(shopDomain, accessToken, productId, (error, variants) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch product variants' });
      }
      res.json(variants);
    });
  });



module.exports = router;
