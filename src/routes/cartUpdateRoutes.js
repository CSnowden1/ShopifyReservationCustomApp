const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');

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
        console.log('req.body: ' + req.body)
        req.body.line_items.forEach(item => {
          if (shouldStartCheckoutSession(item.variant_id)) {
            const duration = 30; // in minutes
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + duration * 60000);
            console.log(`
              Cart Id:${req.id}
              Reserved Item: ${item.title}
              Quantity: ${item.quantity}
              Start Time: ${startTime}
              End Time: ${endTime}
            `);
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


module.exports = router;
