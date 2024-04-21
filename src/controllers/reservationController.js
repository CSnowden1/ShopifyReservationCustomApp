const Shopify = require('../services/shopifyService'); // assuming you have a service for Shopify API interactions
const Product = require('../models/product'); // your product model

// Add an item to the cart with a reservation
exports.addReservationToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Check inventory before adding to cart
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Add item to cart via Shopify API
        const cartResponse = await Shopify.addItemToCart(productId, quantity);
        if (!cartResponse.success) {
            return res.status(500).json({ message: 'Failed to add item to cart' });
        }

        // Start a timer for the reservation
        setTimeout(() => {
            Shopify.removeItemFromCart(productId, quantity);
        }, 1000 * 60 * 10); // removes item after 10 minutes

        res.json({ message: 'Item added to cart with reservation', cartId: cartResponse.cartId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Function to manually remove an item from the cart
exports.removeReservationFromCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Remove item from cart via Shopify API
        const removeResponse = await Shopify.removeItemFromCart(productId, quantity);
        if (!removeResponse.success) {
            return res.status(500).json({ message: 'Failed to remove item from cart' });
        }

        res.json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

