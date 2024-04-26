const mongoose = require('mongoose');

const cartSessionSchema = new mongoose.Schema({
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
  duration: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  products: [
    {
      productId: String,
      variantId: String,
      reservationDuration: Number,
    },
  ],
});

const CartSession = mongoose.model('CartSession', cartSessionSchema);

module.exports = CartSession;
