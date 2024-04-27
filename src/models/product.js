const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String, // Product ID from Shopify
    required: true,
    unique: true
  },
  variantId: {
    type: String, // Product ID from Shopify
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  reservationDuration: {
    type: Number,
    required: true
  },
  liveQuantity: {
    type: Number,
    required: true
  }
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;