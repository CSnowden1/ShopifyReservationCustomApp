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
    return true;
  }


  // Mock function to create a checkout session
async function createCheckoutSession(cartId, itemId, quantity) {
    const sessionId = 'unique-session-id'; 
    const duration = 1;
  
    return { id: sessionId, duration: duration };
  }


  async function isSessionActive(sessionId) {
    return true;
  }

  async function removeItemFromCart(cartId, itemId) {
    console.log(`Item ${itemId} removed from cart ${cartId}`);
  }


router.post('/webhooks/carts-update', async (req, res) => {
    const { cart } = req.body;
    console.log('Cart updated:', cart);
  
    // Check if cart contains item that should start a checkout session
    const item = cart.items.find(item => shouldStartCheckoutSession(item.id));
    if (item) {
      // Create a record in your database for the checkout session
      const session = await createCheckoutSession(cart.id, item.id, item.quantity);
  
      // Start a timer
      setTimeout(async () => {
        // Timer ends, check if the session is still active
        if (await isSessionActive(session.id)) {
          // Session is active, remove item from cart
          await removeItemFromCart(cart.id, item.id);
          // Optionally notify the customer that the item has been removed
        }
      }, session.duration * 60 * 1000); // Duration in milliseconds
    }
  
    // Respond to Shopify to acknowledge receipt of the webhook
    res.status(200).send('Webhook received');
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
