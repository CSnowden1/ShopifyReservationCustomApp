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


// Function to verify the webhook data from Shopify
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

router.post('/carts-update', (req, res) => {
    try {
        // Log the headers and body for debugging
        console.log('Body:', req.body);
        console.log('Cart Id:', req.body.id);
        req.body.line_items.forEach(item => {
            if (shouldStartCheckoutSession(item.variant_id)) {
              console.log(`Cart contains a reservation item '${item.title}' with variant ID: ${item.variant_id}. Creating reservation session for cart session ${req.body.id} if one doesn't exists` );
            }
          });
        res.status(200).send('Item Added to a Cart');
    } catch (error) {
        console.error('Error processing webhook:', error.message);
        // Respond with a server error status code and message
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
