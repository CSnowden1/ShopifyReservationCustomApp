const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    productId: {
            type: String,
            required: true,
            unique: true
    },
  variantId: {
    type: String, // Variant ID from Shopify
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  inventoryCount: {
    type: Number,
    required: true,
    min: [0, 'Inventory cannot be negative']
  },
  reservationDuration: {
    type: Number, // Duration in minutes
    required: true
  }
});

const productSchema = new mongoose.Schema({
  productId: {
    type: String, // Product ID from Shopify
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  variants: [variantSchema] // Array of variant sub-documents
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
