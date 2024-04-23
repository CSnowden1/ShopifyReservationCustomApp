// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser'); // Middleware to parse JSON bodies
const dotenv = require('dotenv'); // To manage environment variables
const morgan = require('morgan'); // HTTP request logger middleware
const cors = require('cors'); // Middleware to enable CORS
const connectDB = require('./db/database');
require('dotenv').config();



// Import routes
const productRoutes = require('./routes/productRoutes');
const cartUpdateRoutes = require('./routes/cartUpdateRoutes');


// Initialize dotenv to load up environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Port configuration for the server to listen on
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enables CORS for all domains
app.use(bodyParser.json()); // Parses incoming request bodies in JSON format
app.use(morgan('dev')); // Logs HTTP requests to the console

// Routes
// Base route for checking if the server is running
app.get('/', (req, res) => {
  res.send('Hello! The server is running and ready to handle requests.');
});



app.use(express.static('public'));

// API routes (prefixed with /api)
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


connectDB();
// Export the app for testing purposes
module.exports = app;
