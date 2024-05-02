// routes/shopifyRoutes.js
const express = require('express');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');
const Product = require('../models/product');
const CartSession = require('../models/cartSession');
const Order = require('../models/orders'); // Import the Order model
const {
  monitorExpiredSessions,
  updateProductQuantity,
  startMonitoring
} = require('../db/cartSessionMonitor');

const router = express.Router();

// Initialize Shopify API node with credentials
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_DOMAIN,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
});

// Middleware to parse JSON requests
router.use(bodyParser.json());

// Route to update quantity of a Shopify product
// Route to update quantity of a Shopify product
router.put('/products/:productId/variants/:variantID/quantity', async (req, res) => {
  const productId = req.params.productId;
  const { quantity, cartToken } = req.body;

  try {
    // Check if there's an order associated with the provided cart token
    const existingOrder = await Order.findOne({ cartToken });
    if (existingOrder) {
      // If an order exists, do not update quantity
      return res.status(200).json({ success: false, message: 'Order already exists for this cart token.' });
    }

    // Fetch the product from Shopify
    const product = await shopify.product.get(productId);

    // Find the specific variant using the variant ID from the URL
    const variant = product.variants.find(v => v.id === parseInt(req.params.variantID));
    if (variant) {
        // Update the inventory quantity of the specific variant
        variant.inventory_quantity = quantity;
        await shopify.productVariant.update(variant.id, { inventory_quantity: quantity });
        console.log('Variant quantity updated successfully');
    } else {
        console.log('Variant not found');
        return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    // Delete the cart session associated with the updated product
    await CartSession.deleteMany({ variantId: req.params.variantID });

    // Optionally call the function to update product quantity after a cart session expires
    await updateProductQuantity(req.params.variantID, quantity);

    res.status(200).json({ success: true, message: 'Product quantity updated successfully.' });
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({ success: false, message: 'Failed to update product quantity.' });
  }
});


// Route to clear the cart
router.post('/clear-cart', async (req, res) => {
  try {
    // Use Shopify's API to clear the cart
    await shopify.cart.clear();

    // Send a success response with instructions to refresh the page and a console message
    res.status(200).json({ 
      success: true, 
      message: 'Cart cleared successfully. Page will refresh in a moment.', 
      refresh: true 
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

// Route to delete the cart session
router.delete('/cart-session/:cartId', async (req, res) => {
  try {
    // Delete the cart session from the database
    await CartSession.deleteOne({ _id: req.params.cartId });

    // Call the function to monitor expired cart sessions
    await monitorExpiredSessions();

    res.status(200).json({ success: true, message: 'Cart session deleted successfully.' });
  } catch (error) {
    console.error('Error deleting cart session:', error);
    res.status(500).json({ success: false, message: 'Failed to delete cart session.' });
  }
});

// Start monitoring expired cart sessions when the application starts
startMonitoring();

module.exports = router;