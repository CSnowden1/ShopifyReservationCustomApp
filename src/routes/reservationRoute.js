const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/auth');



router.get('/products', async (req, res) => {
    // Assuming you have middleware to set shop and accessToken
    const { shop, accessToken } = req.session;
    try {
        const products = await shopifyService.getProducts(shop, accessToken);
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Middleware to ensure all routes in this router are authenticated
router.use(authMiddleware.isAuthenticated);

// Route to add an item with reservation to the cart
router.post('/add-to-cart', reservationController.addReservationToCart);

// Route to remove an item from the cart manually
router.post('/remove-from-cart', reservationController.removeReservationFromCart);

// Optional: Route to update reservation timer or modify reservation details
router.patch('/update-reservation', reservationController.updateReservation);

module.exports = router;
