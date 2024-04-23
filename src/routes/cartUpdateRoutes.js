const express = require('express');
const router = express.Router();

// The product ID we want to track
const trackedProductId = '1234567890'; // Replace with your hard-coded product ID

// Route to handle POST requests to '/webhooks/carts-update'
router.post('/webhooks/carts-update', (req, res) => {
  const { line_items } = req.body;
  
  // Check if any of the line items match the tracked product ID
  line_items.forEach(item => {
    if (item.product_id.toString() === trackedProductId) {
      console.log(`Product with ID ${trackedProductId} added to cart in quantity ${item.quantity}`);
      // Perform any additional actions here
    }
  });
  
  // Respond to Shopify to acknowledge receipt of the webhook
  res.status(200).send('Webhook processed');
});

module.exports = router;