const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cartId: {
    type: String,
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
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
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
