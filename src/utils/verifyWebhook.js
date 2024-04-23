// utils/verifyWebhook.js
const crypto = require('crypto');

function verifyWebhook(req, res, next) {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    const body = JSON.stringify(req.body);
    const generatedHash = crypto
        .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
        .update(body, 'utf8', 'hex')
        .digest('base64');

    if (generatedHash === hmacHeader) {
        return next();
    } else {
        return res.status(401).send('Webhook verification failed');
    }
}

module.exports = { verifyWebhook };
