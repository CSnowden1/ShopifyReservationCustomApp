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


router.put('/carts-sessions/:token', async (req, res) => { 
    try {
        console.log(req.body.token)
        const updatedCartSession = await CartSession.findOneAndUpdate(
            { token: req.body.token },
            { quantity: req.body.quantity }, // Return the updated document
          );
          if (!updatedCartSession) {
            return res.status(404).json({ message: 'Cart Session not found' });
          }
          res.status(200).json({ message: 'Cart data updated successfully', cartSession: updatedCartSession })
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error: error });
          }
})



router.post('/cart-sessions', async (req, res) => {
    try {
        console.log('Webhook Received:', req.body);
        const existingSession = await CartSession.findOne({ cartId: req.body.token });

        if (existingSession) {
            console.log('Session already exists, updating...');
            let updateNeeded = false; // Flag to track if we need to update

            // Iterate over line items to find a valid product and update session
            for (let i = 0; i < req.body.line_items.length; i++) {
                let item = req.body.line_items[i];
                if (shouldStartCheckoutSession(item.id)) {
                    const product = await Product.findOne({ "variants.variantId": item.variant_id });
                    if (product && item.quantity <= product.liveQuantity) {
                        // Update the existing session with new information
                        existingSession.productId = item.product_id;
                        existingSession.variantId = item.variant_id;
                        existingSession.title = item.title;
                        existingSession.quantity = item.quantity;
                        existingSession.startTime = new Date();
                        existingSession.endTime = new Date(existingSession.startTime.getTime() + product.reservationDuration * 60000);
                        existingSession.reservationDuration = product.reservationDuration;

                        product.liveQuantity -= item.quantity; // Update inventory
                        await product.save();

                        updateNeeded = true; // Set flag indicating that update is needed
                        break; // Assuming only one session update is needed per cart
                    }
                }
            }

            if (updateNeeded) {
                await existingSession.save();
                console.log('Cart Session Updated:', existingSession);
                res.status(200).send('Session updated successfully');
            } else {
                console.log('No updates made to the session.');
                res.status(200).send('No updates required for the session');
            }
            return;
        }

        // If no existing session, proceed to create a new session
        console.log("No existing session, creating a new one.");
        for (let i = 0; i < req.body.line_items.length; i++) {
            let item = req.body.line_items[i];
            if (shouldStartCheckoutSession(item.id)) {
                const product = await Product.findOne({ variantId: item.id });
                if (product && item.quantity <= product.liveQuantity) {
                    const startTime = new Date();
                    const endTime = new Date(startTime.getTime() + product.reservationDuration * 60000);

                    const newCartSession = new CartSession({
                        cartId: req.body.token,
                        productId: item.product_id,
                        variantId: item.variant_id,
                        title: item.title,
                        quantity: item.quantity,
                        startTime,
                        endTime,
                        reservationDuration: product.reservationDuration
                    });

                    await newCartSession.save();
                    console.log('New Cart Session Saved:', newCartSession);
                    break; 
                } else {
                    console.log(`Not enough inventory for variant ${item.variant_id}`);
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

router.get('/cart-sessions/:cartId', async (req, res) => {
    try {
        const cartSession = await CartSession.findOne({cartId : req.params.cartId}); // This will find all products
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
