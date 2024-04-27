const express = require('express');
const router = express.Router();
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

function shouldStartCheckoutSession(itemId) {
  // This should be dynamic based on your business logic
  return itemId === '45121949630715'; // Example item ID
}

router.post('/carts-update', async (req, res) => {
  try {
    console.log('Webhook Received:', req.body); 
    for (const item of req.body.line_items) {
      if (shouldStartCheckoutSession(item.variant_id)) {
        const product = await Product.findOne({ "variants.variantId": item.variant_id });

        if (product) {
          const variant = product.variants.find(v => v.variantId === item.variant_id);
          if (variant && item.quantity <= variant.inventoryCount) {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + variant.reservationDuration * 60000);

            const newCartSession = new CartSession({
              cartId: req.body.token,
              productId: item.product_id,
              variantId: item.variant_id,
              title: item.title,
              quantity: item.quantity,
              startTime,
              endTime,
              reservationDuration: variant.reservationDuration
            });

            const savedCartSession = await newCartSession.save();
            console.log('Cart Session Saved:', savedCartSession);
          } else {
            console.log(`Not enough inventory for variant ${item.variant_id}`);
          }
        }
      }
    }
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('An error occurred while processing the webhook');
  }
});

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
    const sessions = await CartSession.find();
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error retrieving cart sessions:', error);
    res.status(500).json({ message: 'Error retrieving cart sessions', error: error });
  }
});

router.delete('/cart-sessions/:cartId', async (req, res) => {
  try {
    const deletedSession = await CartSession.findOneAndDelete({ cartId: req.params.cartId });
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
