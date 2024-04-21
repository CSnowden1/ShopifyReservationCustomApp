const fetch = require('node-fetch');
const queryString = require('query-string');

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET;
const API_VERSION = '2021-07'; // Update to the latest API version you intend to use

class ShopifyService {
    constructor(shopDomain, accessToken) {
        this.shopDomain = shopDomain;
        this.accessToken = accessToken;
        this.baseURL = `https://${shopDomain}/admin/api/${API_VERSION}`;
    }

    // Method to add an item to a Shopify cart
    async addItemToCart(productId, quantity) {
        const endpoint = `${this.baseURL}/draft_orders.json`;
        const body = {
            draft_order: {
                line_items: [{ 
                    variant_id: productId,
                    quantity: quantity
                }]
            }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': this.accessToken
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            return await response.json();
        } catch (error) {
            console.error('Shopify addItemToCart error:', error);
            throw error;
        }
    }

    // Method to remove an item from a Shopify cart
    async removeItemFromCart(cartId, itemId) {
        const endpoint = `${this.baseURL}/draft_orders/${cartId}/line_items/${itemId}.json`;

        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': this.accessToken
                }
            });
            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }
            return await response.json();
        } catch (error) {
            console.error('Shopify removeItemFromCart error:', error);
            throw error;
        }
    }

async getProducts = async (shop, accessToken) => {
    const url = `https://${shop}/admin/api/2021-07/products.json`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
    });
    const data = await response.json();
    return data.products; // This will be an array of products
};

module.exports = {
    getProducts,
};

}

module.exports = ShopifyService;
