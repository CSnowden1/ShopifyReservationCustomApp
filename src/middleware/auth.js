const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN; // The permanent token provided by Shopify for your app

exports.isAuthorized = (req, res, next) => {
    const authToken = req.headers.authorization;

    console.log(`Received authorization token: ${authToken}`);
    console.log(`Expected authorization token: Bearer ${ACCESS_TOKEN}`);

    if (authToken && authToken === `Bearer ${ACCESS_TOKEN}`) {
        console.log("Authorization successful.");
        next(); // The token is correct, proceed to the next middleware or route handler
    } else {
        console.log("Authorization failed. Invalid token provided.");
        res.status(401).json({ message: "You don't have authorized access." });
    }
};

