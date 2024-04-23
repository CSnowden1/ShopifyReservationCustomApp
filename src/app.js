// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./db/database');
require('dotenv').config();
const Shopify = require('shopify-api-node');

// Initialize Shopify API client
const shopify = new Shopify({
    shopName: process.env.SHOPIFY_STORE_DOMAIN,
    apiKey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
});

// Replace 'your-deployment-url.com' with your actual Heroku app's URL.
const webhookUrl = 'https://shopify-res-app-d429dd3eb80d.herokuapp.com/webhooks/carts-update';

// Create a webhook for carts update
shopify.webhook.create({
    topic: 'carts/update',
    address: webhookUrl,
    format: 'json'
}).then(
    (webhook) => console.log('Webhook created:', webhook),
    (err) => console.error('Error creating webhook:', err)
);

// Import routes
const productRoutes = require('./routes/productRoutes');
const cartUpdateRoutes = require('./routes/cartUpdateRoutes');

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Serve static files
app.use(express.static('public'));

// Apply routes
app.get('/', (req, res) => {
  res.send('Hello! The server is running and ready to handle requests.');
});

app.use('/api', productRoutes);
app.use('/webhooks', cartUpdateRoutes);

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).send("Sorry, can't find that!");
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(`Error: ${error.message}`);
  res.status(500).send('Internal Server Error');
});

// Connect to database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing purposes
module.exports = app;
