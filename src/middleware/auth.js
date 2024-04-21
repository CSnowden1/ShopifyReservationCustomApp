const session = require('express-session');
const ShopifyToken = require('shopify-token');

// Configuration for Shopify Token
const shopifyConfig = {
    sharedSecret: process.env.SHOPIFY_SECRET,
    redirectUri: process.env.SHOPIFY_REDIRECT_URI,
    apiKey: process.env.SHOPIFY_API_KEY,
    scopes: process.env.SHOPIFY_SCOPES
};

const shopifyToken = new ShopifyToken(shopifyConfig);

// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.accessToken && req.session.shop) {
        next(); // Proceed to the next middleware/route handler
    } else {
        res.status(401).json({ message: "Not authenticated. Please log in." });
    }
};

// Middleware to handle Shopify OAuth callback
exports.handleCallback = (req, res) => {
    const { code, shop } = req.query;
    
    shopifyToken.getAccessToken(shop, code)
        .then(token => {
            req.session.accessToken = token;
            req.session.shop = shop;
            res.redirect('/'); // Redirect to the home page or dashboard
        })
        .catch(error => {
            res.status(500).json({ message: "Failed to get access token", error: error });
        });
};

