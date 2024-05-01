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
    const orderData = req.body; // Assuming the request body contains the order data
    console.log(orderData)
    // Check if the order is created after the checkout process is completed
    if (orderData && orderData.attributes && orderData.attributes.cart_token) {
        try {
            // Create a new Order document using the MongoDB model
            const newOrder = new Order({
                cartId: orderData.attributes.cart_token,
                startTime: new Date(),
                endTime: new Date(),
                duration: orderData.duration, // Assuming order duration is provided in the request
                quantity: orderData.quantity, // Assuming order quantity is provided in the request
                products: orderData.products // Assuming product information is provided in the request
            });

            // Save the new order to the database
            await newOrder.save();

            // Log the successful creation of the order
            console.log('Order saved:', newOrder);

            // Respond with a success status
            res.status(200).send('Order received and saved');
        } catch (error) {
            // Log any errors that occur during the database operation
            console.error('Error saving order:', error);
            // Respond with an error status
            res.status(500).send('Error saving order');
        }
    } else {
        // If the order does not contain a cart token, it might not be related to a completed checkout process
        console.log('Invalid order payload');
        // Respond with an error status
        res.status(400).send('Invalid order payload');
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
