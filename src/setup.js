
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_DOMAIN,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
});

// Function to create a webhook
function createWebhook() {
  shopify.webhook.create({
    topic: 'carts/update',
    address: 'https://localhost:3000/api/carts-update', // The route you created
    format: 'json'
  }).then(
    (webhook) => console.log('Webhook created: ', webhook),
    (err) => console.error('Error creating webhook: ', err)
  );
}

// Call this function to set up the webhook
createWebhook();
