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
  endTime: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

const Order = mongoose.model('CompletedOrder', orderSchema);

module.exports = Order;
