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
  if(itemId === '45121949630715') {
    return true;
  } 
}

router.post('/carts-sessions', async (req, res) => {
    try {
      console.log('Webhook Received:', req.body); 
      console.log("First Line Item", req.body.line_items);
      let cartItems = req.body.line_items;
  
      for (var i = 0; i < cartItems.length; i++) {
        console.log('Cart Item Length, ', cartItems.length);
        console.log('Starting Cart Loop with, ', cartItems)
        console.log('Working Item', cartItems[0]);
        console.log('Item Id', cartItems[0].id);
        console.log('Item Id', cartItems[i].id);
        if (!shouldStartCheckoutSession(cartItems[i].id)) {
          console.log('Checking Cart for item ID:', cartItems[i].id);
          const product = await Product.findOne({ variantId: cartItems[i].id});
          if (product) {
            console.log('Found Session product:', product);
            console.log('Cart Quantity:', cartItems[i].quantity);
            console.log('Live Stock:', product.liveQuantity);
            if (cartItems[i].quantity <= product.liveQuantity) {
              const startTime = new Date();
              const endTime = new Date(startTime.getTime() + product.reservationDuration * 60000);
  
              const newCartSession = new CartSession({
                cartId: req.body.token,
                productId: cartItems[i].product_id,
                variantId: cartItems[i].variant_id,
                title: cartItems[i].title,
                quantity: cartItems[i].quantity,
                startTime,
                endTime,
                duration: product.reservationDuration
              });
  
              await newCartSession.save();
              console.log('Cart Session Saved for item ID:', product.id);
              break; // Stop processing as we only need one session per cart
            } else {
              console.log(`Not enough inventory for variant ${product.id}`);
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
        const cartSession = await CartSession.find(); // This will find all products
        res.status(200).json(cartSession);
      } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ message: 'Error retrieving products', error: error });
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
