const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String, // Product ID from Shopify
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
  description: {
    type: String,
    required: false
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
