document.addEventListener('DOMContentLoaded', async function() {
    const productSelect = document.getElementById('productSelect');
    const variantSelect = document.getElementById('variantSelect');
    const loadingIndicator = document.getElementById('loadingIndicator'); // Assume an element to show loading status

    try {
        loadingIndicator.textContent = 'Loading products...';
        const response = await fetch('https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        const productList = products.products;
        console.log(productList);

        productSelect.innerHTML = '<option value="">Select a product</option>';

        // Populate the product dropdown
        productList.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.title;
            productSelect.appendChild(option);
        });
        loadingIndicator.textContent = ''; // Clear loading text
    } catch (error) {
        console.error('Error fetching products:', error);
        loadingIndicator.textContent = 'Failed to load products';
    }

    productSelect.addEventListener('change', async (event) => {
        const selectedProductId = event.target.value;
        if (!selectedProductId) return; // Prevent fetching if the default "Select" option is chosen

        variantSelect.innerHTML = '';
        loadingIndicator.textContent = 'Loading variants...';

        try {
            const response = await fetch(`https://shopify-res-app-d429dd3eb80d.herokuapp.com/api/products/${selectedProductId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch variants');
            }

            const variantData = await response.json();
            console.log(variantData)
            const variants = variantData.variants;
            if (!variants || variants.length === 0) {
                throw new Error('No variants found for this product');
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
            loadingIndicator.textContent = ''; // Clear loading text
        } catch (error) {
            console.error('Error fetching variants:', error);
            loadingIndicator.textContent = 'Failed to load variants';
        }
    });

    variantSelect.addEventListener('change', (event) => {
        const selectedVariantId = event.target.value;
        const selectedVariantOption = event.target.options[event.target.selectedIndex];
        const inventoryQuantity = selectedVariantOption.getAttribute('data-inventory-quantity');
        const productId = selectedVariantOption.getAttribute('data-product-id');
        
        console.log(`Selected variant ID: ${selectedVariantId} with inventory count: ${inventoryQuantity}`);
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
        variantId: selectedVariantId,
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
        console.log("This should be All Products", allProducts);
        
        // Clear any existing rows in the grid
        productGrid.innerHTML = '';

        // Create and append rows for each product
        allProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.title}</td>
                <td>${product.productId}</td>
                <td>${product.variantId}</td>
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
  
    const productGrid = document.getElementById('productGrid');
  
    productGrid.addEventListener('click', (event) => {
      // Check if the delete button was clicked
      if (event.target.classList.contains('delete-row')) {
        const row = event.target.closest('tr');
        console.log(row);
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
        console.log(row);
        const secondChild = row.children[1]; // This is the second child element of the row
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


 

  function createCountdownElement(endTime) {
    const countdownElement = document.createElement('div');
    countdownElement.style.fontSize = '24px'; // Styling for visibility

    // Parse the endTime into a Date object
    const endTimeDate = new Date(endTime);

    const updateCountdown = () => {
        const now = new Date();
        const difference = endTimeDate - now; // Difference in milliseconds
        const seconds = Math.floor(difference / 1000);

        if (seconds <= 0) {
            clearInterval(timerId);
            countdownElement.textContent = "Reservation Expired";
            countdownElement.style.color = 'black';
            return;
        }

        const remainingMinutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;

        if (remainingSeconds < 10) {
            remainingSeconds = '0' + remainingSeconds; // Add leading zero if seconds less than 10
        }

        countdownElement.textContent = `${remainingMinutes}:${remainingSeconds}`;
        if (seconds < 60) { // Less than 60 seconds remaining
            countdownElement.style.color = 'red';
        } else {
            countdownElement.style.color = 'black'; // Reset to normal color if more than a minute left
        }
    };

    // Update immediately and then set an interval to update every second
    updateCountdown();
    const timerId = setInterval(updateCountdown, 1000);

    return countdownElement;
}


   document.addEventListener('DOMContentLoaded', function () {
    fetchCartSessions();

    function fetchCartSessions() {
        fetch('https://shopify-res-app-d429dd3eb80d.herokuapp.com/webhooks/cart-sessions')
        .then(response => response.json())
        .then(sessions => {
            const tableBody = document.getElementById('sessionTable');
            tableBody.innerHTML = ''; // Clear existing rows
            sessions.forEach(session => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = session.cartId;
                row.insertCell(1).textContent = new Date(session.startTime).toLocaleString();
                row.insertCell(2).textContent = new Date(session.endTime).toLocaleString();
                row.insertCell(3).textContent = `${session.duration} minutes`;
    
                // Create countdown element and append it to the new cell
                const countdownCell = row.insertCell(3);
                countdownCell.appendChild(createCountdownElement(session.duration));
    
                row.insertCell(5).textContent = session.quantity;
                row.insertCell(6).textContent = session.isActive ? 'Active' : 'Inactive';
    
                // Delete button cell
                const deleteCell = row.insertCell(7);
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger delete-btn';
                deleteButton.textContent = 'Delete';
                deleteButton.setAttribute('data-id', session.cartId);
                deleteCell.appendChild(deleteButton);
            });
            attachDeleteEventHandlers();
        })
        .catch(error => console.error('Error fetching cart sessions:', error));
    }

    function attachDeleteEventHandlers() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const cartId = this.getAttribute('data-id');
                deleteCartSession(cartId);
            });
        });
    }

    function deleteCartSession(cartId) {
        fetch(`https://shopify-res-app-d429dd3eb80d.herokuapp.com/webhooks/cart-sessions/${cartId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                console.log(`Cart session ${cartId} deleted successfully`);
                fetchCartSessions(); 
            } else {
                throw new Error(`Failed to delete cart session with ID ${cartId}`);
            }
        })
        .catch(error => console.error(`Error deleting cart session with ID ${cartId}:`, error));
    }
});
