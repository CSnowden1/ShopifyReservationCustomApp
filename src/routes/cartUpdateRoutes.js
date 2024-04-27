const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');
const Product = require('../models/product');
const CartSession = require('../models/cartSession');
 // Ensure you have the Product model imported

// Initialize Shopify API node with credentials
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_DOMAIN,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
});


router.use(bodyParser.json()); // for parsing application/json

// Define the schema for a cart session.


function verifyWebhook(data, hmacHeader) {
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(data, 'utf8', 'hex')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmacHeader));
}



function shouldStartCheckoutSession(itemId) {
    if(itemId === 45121949630715) {
        return true;
    }
  }

    router.post('/carts-update', async (req, res) => {
      try {
        console.log('Body:', req.body); 
        req.body.line_items.forEach(item => {
          if (shouldStartCheckoutSession(item.variant_id)) {
            const duration = 30; // in minutes
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + duration * 60000);
            console.log(`
              Cart Id:${req.body.token}
              Reserved Item: ${item.title}
              Quantity: ${item.quantity}
              Start Time: ${startTime}
              End Time: ${endTime}
            `);
            const newCartSession = new Product({
                productId,
                title,
                reservationDuration,
                liveQuantity: inventoryCount
              });
        
              const savedProduct = await newProduct.save();
          }
        });
  
        res.status(200).send('Item Added to a Cart');
      } catch (error) {
        console.error('Error processing webhook:', error.message);
        res.status(500).send('An error occurred while processing the webhook');
      }
    });



// Route to list all webhooks
router.get('/list-webhooks', async (req, res) => {
    try {
      const webhooks = await shopify.webhook.list();
      res.json(webhooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ error: error.message });
    }
  });








  router.post('/carts-update', async (req, res) => {
    const { cartId, title, startTime, duration, products  } = req.body;

    try {
      console.log('Body:', req.body); 
      for (const item of req.body.line_items) {
        // Check if the variant ID exists in any product's variants array in the database
        const product = await Product.findOne({ "variants.variantId": item.variant_id });
  
        if (product) {
          // Fetch the specific variant to get the reservation duration
          const variant = product.variants.find(v => v.variantId === item.variant_id);
          const duration = variant ? variant.reservationDuration : 30;
  
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + duration * 60000);
          console.log(`
            Cart Id:${req.body.token}
            Reserved Item: ${item.title}
            Quantity: ${item.quantity}
            Start Time: ${startTime}
            End Time: ${endTime}
          `);

          const newCartSession = new CartSession({
            productId,
            title,
            reservationDuration,
            liveQuantity: inventoryCount
          });
    
          const savedCartSession = await newCartSession.save();
                res.status(200).json(savedCartSession);

        }
      }    
    } catch (error) {
      console.error('Error processing webhook:', error.message);
      res.status(500).send('An error occurred while processing the webhook');
    }
  });










module.exports = router;
