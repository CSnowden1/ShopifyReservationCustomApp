const CartSession = require('../models/cartSession');
const Product = require('../models/product');
const mongoose = require('mongoose');


// Create a TTL index on the endTime field of the CartSession collection
CartSession.collection.createIndex({ endTime: 1 }, { expireAfterSeconds: 0 });

// Background process to monitor expired cart sessions
const monitorExpiredSessions = async () => {
    try {
        const expiredSessions = await CartSession.find({ endTime: { $lt: new Date() } });
        for (const session of expiredSessions) {
            // Update product quantity based on the expired cart session
            await updateProductQuantity(session.variantId, session.quantity);
            // Delete the expired cart session
            await CartSession.deleteOne({ _id: session._id });
        }
    } catch (error) {
        console.error('Error monitoring expired cart sessions:', error);
    }
};

// Start the background process to monitor expired cart sessions
const startMonitoring = () => {
    setInterval(monitorExpiredSessions, 1000); // Check every second for expired sessions
};

// Start the monitoring process when the application starts
startMonitoring();

// Function to update product quantity after a cart session expires
const updateProductQuantity = async (variantId, quantity) => {
    try {
        const updateResult = await Product.updateOne(
            { variantId: variantId },
            { $inc: { quantity: quantity } }
        );
        if (updateResult.matchedCount === 0) {
            console.error('Product not found');
            return;
        }
        console.log('Product quantity updated successfully');
    } catch (error) {
        console.error('Error updating product quantity:', error);
    }
};


// Export any functions if needed
module.exports = {
    monitorExpiredSessions,
    updateProductQuantity,
    startMonitoring
};
