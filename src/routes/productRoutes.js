const express = require('express');
const router = express.Router();
const https = require('https');
const Product = require('../models/product'); 


// Function to make a GET request to Shopify API and handle pagination
function fetchAllShopifyProducts(shopDomain, accessToken, apiPath, accumulatedProducts = [], callback) {
    const options = {
        hostname: shopDomain,
        path: apiPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken
        }
    };

    https.get(options, res => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                const products = accumulatedProducts.concat(parsedData.products);
                const linkHeader = res.headers.link;
                if (linkHeader) {
                    const matches = linkHeader.match(/<(https:\/\/[^>]+)>;\srel="next"/);
                    if (matches && matches[1]) {
                        const nextPath = new URL(matches[1]).pathname + new URL(matches[1]).search;
                        fetchAllShopifyProducts(shopDomain, accessToken, nextPath, products, callback);
                    } else {
                        callback(null, products);
                    }
                } else {
                    callback(null, products);
                }
            } catch (e) {
                callback(e, null);
            }
        });
    }).on('error', (e) => {
        callback(e, null);
    });
}

// Route to fetch all products from Shopify
router.get('/products', (req, res) => {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const initialPath = '/admin/api/2024-04/products.json?limit=250'; // Increase limit to max (250) to reduce the number of requests

    fetchAllShopifyProducts(shopDomain, accessToken, initialPath, [], (error, products) => {
        if (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
        res.json({ products });
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



  router.post('/products/live-products', async (req, res) => {
    const { title, reservationDuration, inventoryCount } = req.body;

    try {
      // Check if the product already exists
      const existingProduct = await Product.findOne({ productId: productId });
      if (existingProduct) {
        return res.status(409).json({ message: 'Product with this ID already exists' });
      }

      // If the product does not exist, create a new one
      const newProduct = new Product({
        productId,
        title,
        reservationDuration,
        liveQuantity: inventoryCount
      });

      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      res.status(500).json({ message: 'Error saving product', error: error });
    }
});


router.get('/products/live-products', async (req, res) => {
    try {
      const products = await Product.find(); // This will find all products
      res.status(200).json(products);
    } catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ message: 'Error retrieving products', error: error });
    }
  });



// DELETE route to remove a product by its productId
router.delete('/products/live-products/:productId', async (req, res) => {
    try {
      const deletedProduct = await Product.findOneAndDelete({ productId: req.params.productId });
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product', error: error });
    }
  });
  
  // PUT route to update a product's reservation duration by its productId
  router.put('/products/live-products/:productId', async (req, res) => {
    try {
      const { reservationDuration } = req.body;
      console.log(reservationDuration);
      const updatedProduct = await Product.findOneAndUpdate(
        { productId: req.params.productId },
        { reservationDuration: reservationDuration },
        { new: true } // Return the updated document
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error updating product', error: error });
    }
  });

  




module.exports = router;
