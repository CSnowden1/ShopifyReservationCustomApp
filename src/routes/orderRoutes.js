const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');
const Product = require('../models/product');
const CartSession = require('../models/cartSession');
const Order = require('../models/orders'); // Assuming your MongoDB model is defined in orderModel.js

// Initialize Shopify API node with credentials
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_DOMAIN,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
});

router.use(bodyParser.json());




router.post('/orders', async (req, res) => {
    try {
        // Extract relevant fields from the request body
        const { cart_id, cart_token } = req.body;
        console.log(req.body.cart_id, req.body.cart_token);
        console.log("Body fetch", req.body)

        // Create a new Order instance
        const newOrder = new Order({
            cart_token: cart_token,
            cart_id : cart_id
        });

        // Save the new order to the database
        const savedOrder = await newOrder.save();

        console.log('Order saved successfully:', savedOrder);
        res.status(200).send('Order saved successfully');
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).send('Error saving order');
    }
});



router.get('/orders', async (req, res) => {
    try {
      const orders = await Order.find(); // This will find all completed orders
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ message: 'Error retrieving products', error: error });
    }
  });



router.get('/orders/:cart_token', async (req, res) => {
    const cartToken = req.params.cart_token;

    try {
        // Find orders associated with the provided cart token
        const orders = await Order.find({ cartId: cartToken });

        if (orders.length > 0) {
            // If orders are found, send them as a response
            res.status(200).json(orders);
        } else {
            // If no orders are found, send a message indicating so
            console.log('No orders found for cart token:', cartToken);
            res.status(404).send('No orders found for the provided cart token');
        }
    } catch (error) {
        // If an error occurs during the database operation, log the error and send a 500 status code
        console.error('Error retrieving orders:', error);
        res.status(500).send('Error retrieving orders');
    }
});




module.exports = router;
