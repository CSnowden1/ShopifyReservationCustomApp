document.addEventListener('DOMContentLoaded', async function() {
    const productSelect = document.getElementById('productSelect');
    const variantSelect = document.getElementById('variantSelect');

    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        const productList = products.products;

        productSelect.innerHTML = ''; // Clear existing options

        // Populate the product dropdown
        productList.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.title;
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    productSelect.addEventListener('change', async (event) => {
        const selectedProductId = event.target.value;
        console.log(`Selected product ID: ${selectedProductId}`);
        console.log(`Selected product ID: ${selectedProductId}`);
    });
});

document.getElementById('productSelect').addEventListener('change', async (event) => {
    const selectedProductId = event.target.value;
    
    variantSelect.innerHTML = '';
    
    try {
      // Fetch variants for the selected product
      const response = await fetch(`http://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/${selectedProductId}/variants`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }

      const variantData = await response.json();

      // Assuming the variantData is an object with a 'variants' array
      const variants = variantData.variants;
      if (!variants) {
        throw new Error('Variants property not found');
      }
    
      // Populate the variants dropdown
      variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant.id;
        option.textContent = variant.title;
        option.setAttribute('data-inventory-quantity', variant.inventory_quantity);
        variantSelect.appendChild(option);

      });
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  
  });

  variantSelect.addEventListener('change', (event) => {
    const selectedVariantId = event.target.value;
    const selectedVariantOption = event.target.options[event.target.selectedIndex];
    const inventoryQuantity = selectedVariantOption.getAttribute('data-inventory-quantity');
    
    console.log(`Selected variant ID: ${selectedVariantId} with inventory count: ${inventoryQuantity}`);
});


document.getElementById('timerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const productSelect = document.getElementById('productSelect');
    const variantSelect = document.getElementById('variantSelect');
    const durationInput = document.getElementById('duration');
    const productGrid = document.getElementById('productGrid');
    
    // Extract selected product and variant details
    const selectedProductTitle = productSelect.options[productSelect.selectedIndex].text;
    const selectedVariantId = variantSelect.value;
    const inventoryQuantity = variantSelect.options[variantSelect.selectedIndex].getAttribute('data-inventory-quantity');
    const timerDuration = durationInput.value;
    
    // Append new row to the product grid
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${selectedProductTitle}</td>
        <td>${selectedVariantId}</td>
        <td>${inventoryQuantity}</td>
        <td>${timerDuration} minutes</td>
    `;
    
    productGrid.appendChild(row);

    // Optionally send a message to the server (e.g., log or notify)
    fetch('https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/live-products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId: selectedVariantId, timerDuration })
    }).then(response => {
        console.log('Server notified of product timer setup');
    }).catch(error => {
        console.error('Error notifying server:', error);
    });
});