const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');
const Product = require('../models/product');
const CartSession = require('../models/cartSession');

// Initialize Shopify API node with credentials
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_DOMAIN,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
});

router.use(bodyParser.json());

function verifyWebhook(data, hmacHeader) {
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(data, 'utf8', 'hex')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmacHeader));
}

router.post('/carts-update', async (req, res) => {
  if (!verifyWebhook(JSON.stringify(req.body), req.get('X-Shopify-Hmac-Sha256'))) {
    return res.status(401).send('Webhook not verified');
  }

  try {
    for (const item of req.body.line_items) {
      const product = await Product.findOne({ "variants.variantId": item.variant_id });
      if (product) {
        const variant = product.variants.find(v => v.variantId === item.variant_id);
        if (variant && item.quantity <= variant.inventoryCount) {
          const duration = variant.reservationDuration;
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + duration * 60000);

          const newCartSession = new CartSession({
            cartId: req.body.token,
            productId: item.product_id,
            variantId: item.variant_id,
            title: item.title,
            quantity: item.quantity,
            startTime: startTime,
            endTime: endTime,
            reservationDuration: duration
          });

          const savedCartSession = await newCartSession.save();
          console.log('New Cart Session saved:', savedCartSession);
        } else {
          console.log(`Quantity exceeds inventory for variant ID: ${item.variant_id}`);
        }
      }
    }
    res.status(200).send('Cart session processed successfully.');
  } catch (error) {
    console.error('Error processing webhook:', error);
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


router.get('/cart-sessions', async (req, res) => {
    try {
        const sessions = await CartSession.find(); // Fetch all cart sessions from the database
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error retrieving cart sessions:', error);
        res.status(500).json({ message: 'Error retrieving cart sessions', error: error });
    }
});


router.delete('/cart-sessions/:cartId', async (req, res) => {
    const cartId = req.params.cartId; // Extract cartId from the route parameters

    try {
        const deletedSession = await CartSession.findOneAndDelete({ cartId: cartId });
        if (!deletedSession) {
            return res.status(404).json({ message: "No cart session found with that ID." });
        }
        res.status(200).json({ message: 'Cart session successfully deleted', deletedSession: deletedSession });
    } catch (error) {
        console.error('Error deleting cart session:', error);
        res.status(500).json({ message: 'Error deleting cart session', error: error });
    }
});





module.exports = router;
