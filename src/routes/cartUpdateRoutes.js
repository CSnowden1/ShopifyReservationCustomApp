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

router.post('/carts-update', (req, res) => {
    // Log the headers and body for debugging
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
  
    res.status(200).send('Webhook processed');
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
