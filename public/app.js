document.getElementById('timerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const product = document.getElementById('product').value;
    const duration = document.getElementById('duration').value;


    const productSelect = document.getElementById('product');

    fetch('/api/products') // Adjust this URL to where your backend products endpoint is.
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id; // Assuming product object has an id.
                option.textContent = product.title; // Assuming product object has a title.
                productSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });

    fetch('/set-timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product, duration })
    })
    .then(response => response.json())
    .then(data => {
        alert('Timer set successfully!');
    })
    .catch(error => {
        console.error('Error setting timer:', error);
        alert('Failed to set timer.');
    });
});

