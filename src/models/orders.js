const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cart_token: {
    type: String,
    required: true,
    unique: true, 
  },
  checkout_id: {
    type: Number,
    required: true,
    unique: true, 
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  duration: {
    type: Number,
    required: false,
  },
  quantity: {
    type: Number,
    required: false,
  },
  products: [
    {
      productId: String,
      variantId: String,
      reservationDuration: Number,
    },
  ],
});

const Order = mongoose.model('CompletedOrder', orderSchema);

module.exports = Order;
