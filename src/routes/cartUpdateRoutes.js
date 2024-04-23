const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bodyParser = require('body-parser');

router.use(bodyParser.json()); // for parsing application/json

// Function to verify the webhook data from Shopify
function verifyWebhook(data, hmacHeader) {
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(data, 'utf8', 'hex')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmacHeader));
}

// Webhook endpoint for 'carts/update'
router.post('/carts-update', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const data = JSON.stringify(req.body);

  if (!verifyWebhook(data, hmacHeader)) {
    return res.status(401).send('Webhook not verified');
  }

  console.log('Received cart update webhook:', req.body);
  
  // Acknowledge receipt of the webhook
  res.status(200).send('Webhook processed');
});

module.exports = router;
