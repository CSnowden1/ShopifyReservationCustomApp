const express = require('express');
const router = express.Router();
const https = require('https');
const Product = require('../models/product'); 

function getShopifyProducts(shopDomain, accessToken, apiPath, products = [], callback) {
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
            const response = JSON.parse(data);
            products = products.concat(response.products);

            // Check for pagination in the response headers
            const linkHeader = res.headers.link;
            if (linkHeader) {
                const matches = linkHeader.match(/<(https:\/\/[^>]+)>;\srel="next"/);
                if (matches && matches[1]) {
                    // Recursively fetch next page
                    const nextPath = new URL(matches[1]).pathname + new URL(matches[1]).search;
                    getShopifyProducts(shopDomain, accessToken, nextPath, products, callback);
                } else {
                    // No more pages, return all products
                    callback(null, products);
                }
            } else {
                callback(null, products);
            }
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

    getShopifyProducts(shopDomain, accessToken, apiPath, [], (error, products) => {
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
  router.get('/products/:productId', (req, res) => {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN; 
    const productId = req.params.productId;

  
    getShopifyProductVariants(shopDomain, accessToken, productId, (error, variants) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch product variants' });
      }
      res.json(variants);
    });
  });






  router.post('/products/live-products', async (req, res) => {
    console.log("Received data for new product:", req.body);
    const { productId, title, reservationDuration, inventoryCount } = req.body;
    
    try {
      const existingProduct = await Product.findOne({ productId });
      if (existingProduct) {
        return res.status(409).send({ message: 'Product already exists.' });
      }

      const product = new Product({
        productId,
        title,
        reservationDuration,
        liveQuantity: inventoryCount
      });

      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      res.status(500).json({ error: 'Error saving product', details: error });
    }
});

router.get('/products/live-products', async (req, res) => {
    try {
      const products = await Product.find(); // Fetch all documents from the products collection
      console.log("Retrieved products:", products); // Log products to console for debugging
      res.status(200).json(products);
    } catch (error) {
      console.error('Error retrieving live products:', error); // Detailed error logging
      res.status(500).json({ message: 'Error retrieving products', error: error.toString() });
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
