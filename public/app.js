document.addEventListener('DOMContentLoaded', async function() {
    const productSelect = document.getElementById('productSelect');
    const variantSelect = document.getElementById('variantSelect');

    try {
        const response = await fetch('https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        const productList = products.products;
        console.log(productList);

        productSelect.innerHTML = '';

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
    });
});

document.getElementById('productSelect').addEventListener('change', async (event) => {
    const selectedProductId = event.target.value;
    
    variantSelect.innerHTML = '';
    
    try {
      // Fetch variants for the selected product
      const response = await fetch(`https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/${selectedProductId}/variants`, {
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
        option.setAttribute('data-product-id', selectedProductId);
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
    const productId = selectedVariantOption.getAttribute('data-product-id');
    
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
    const selectedProductId = variantSelect.options[variantSelect.selectedIndex].getAttribute('data-product-id');    
    const inventoryQuantity = variantSelect.options[variantSelect.selectedIndex].getAttribute('data-inventory-quantity');
    const timerDuration = durationInput.value;
  
    // Append new row to the product grid
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${selectedProductTitle}</td>
      <td>${selectedProductId}</td>      
      <td>${inventoryQuantity}</td>
      <td>${timerDuration} minutes</td>
      <td><button type="button" class="btn btn-primary edit-timer">Edit</button></td>
      <td><button type="button" class="btn btn-danger delete-row">Delete</button></td>
    

    `;
  
    productGrid.appendChild(row);
    console.log(selectedProductTitle, selectedProductId, selectedVariantId, inventoryQuantity, timerDuration);
    // Post to the server
    fetch('https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/live-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId:  selectedProductId,
        title: selectedProductTitle,
        inventoryCount: parseInt(inventoryQuantity),
        reservationDuration: parseInt(timerDuration)
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }).then(data => {
      console.log('Product timer setup success:', data);
    }).catch(error => {
      console.error('Error posting to server:', error);
    });
  });


 
  document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('productGrid');
    
    try {
        const productResponse = await fetch('https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/live-products', {
            method: 'GET'
        });

        if (!productResponse.ok) {
            throw new Error('Failed to fetch products');
        }

        const allProducts = await productResponse.json();
        
        // Clear any existing rows in the grid
        productGrid.innerHTML = '';

        // Create and append rows for each product
        allProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.title}</td>
                <td>${product.productId}</td>
                <td>${product.liveQuantity}</td>
                <td>${product.reservationDuration} minutes</td>
                <td><button type="button" class="btn btn-primary edit-timer">Edit</button></td>
                <td><button type="button" class="btn btn-danger delete-row">Delete</button></td>
            `;
            productGrid.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching all products:', error);
    }
    
});


document.addEventListener('DOMContentLoaded', async function() {
    // ... your existing code to fetch and populate the table ...
  
    const productGrid = document.getElementById('productGrid');
  
    productGrid.addEventListener('click', (event) => {
      // Check if the delete button was clicked
      if (event.target.classList.contains('delete-row')) {
        const row = event.target.closest('tr');
        const secondChild = row.children[1]; // This is the second child element of the row
        const productId = secondChild.innerHTML;
        console.log(productId);
        fetch(`https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/live-products/${productId}`, {
          method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
          console.log('Delete response:', data);
          row.remove();
        })
        .catch(error => {
          console.error('Error deleting product:', error);
        });
      }
  
      // Check if the edit button was clicked
      if (event.target.classList.contains('edit-timer')) {
        const row = event.target.closest('tr');
        if (row && row.children.length > 1) {
            const secondChild = row.children[1]; // This is the second child element of the row
            // Do something with secondChild
        }
        const productId = secondChild.innerHTML;
        console.log(productId)
        const newDuration = prompt('Enter the new duration:', row.dataset.duration);
  
        if (newDuration) {
          fetch(`https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/live-products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reservationDuration: newDuration })
          })
          .then(response => response.json())
          .then(updatedProduct => {
            console.log('Update response:', updatedProduct);
            // Update the duration in the DOM
            row.querySelector('.timer-duration').textContent = `${newDuration} minutes`;
            row.dataset.duration = newDuration; // Update the duration data attribute
          })
          .catch(error => {
            console.error('Error updating product:', error);
          });
        }
      }
    });
  });
