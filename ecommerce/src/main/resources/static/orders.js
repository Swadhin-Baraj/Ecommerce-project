// API base URL
const API_BASE = 'http://localhost:8080';

// DOM Elements
const checkoutForm = document.getElementById('checkoutForm');
const checkoutMessage = document.getElementById('checkoutMessage');
const loadOrdersBtn = document.getElementById('loadOrdersBtn');
const ordersContainer = document.getElementById('ordersContainer');

// Checkout form submission
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
        showCheckoutMessage('❌ Please login first', 'error');
        return;
    }

    const shippingAddress = document.getElementById('shippingAddress').value;

    try {
        const response = await fetch(
            `${API_BASE}/orders/create?userId=${userId}&shippingAddress=${encodeURIComponent(shippingAddress)}`,
            { method: 'GET' }
        );

        const result = await response.text();
        
        if (result.includes('successfully')) {
            showCheckoutMessage(`✓ ${result}`, 'success');
            checkoutForm.reset();
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 2000);
        } else {
            showCheckoutMessage(`❌ ${result}`, 'error');
        }
    } catch (error) {
        showCheckoutMessage(`❌ Error: ${error.message}`, 'error');
        console.error('Error:', error);
    }
});

// Load orders handler
loadOrdersBtn.addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Please login first');
        window.location.href = 'auth.html';
        return;
    }

    try {
        ordersContainer.innerHTML = '<p class="loading">Loading orders...</p>';

        const response = await fetch(`${API_BASE}/orders/user?userId=${userId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-state">No orders found. Start shopping!</p>';
        } else {
            ordersContainer.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <h3>Order #${order.id}</h3>
                        <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <p><strong>Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
                    <p><strong>Address:</strong> ${order.shippingAddress}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                    ${order.deliveryDate ? `<p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>` : ''}
                    <div style="margin-top: 10px;">
                        ${order.status === 'PENDING' ? `<button class="remove-btn" onclick="cancelOrder(${order.id})">Cancel Order</button>` : ''}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        ordersContainer.innerHTML = `<p class="empty-state">❌ Error loading orders: ${error.message}</p>`;
        console.error('Error:', error);
    }
});

// Cancel order function
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        fetch(`${API_BASE}/orders/cancel?orderId=${orderId}`)
            .then(response => response.text())
            .then(result => {
                alert(result);
                loadOrdersBtn.click();
            })
            .catch(error => console.error('Error:', error));
    }
}

// Show checkout message
function showCheckoutMessage(text, type) {
    checkoutMessage.textContent = text;
    checkoutMessage.className = `message ${type}`;
    checkoutMessage.style.display = 'block';
}

// Update auth link and admin link on page load
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const authLink = document.getElementById('authLink');
    const wishlistLink = document.getElementById('wishlistLink');
    const adminLink = document.getElementById('adminLink');

    if (userId) {
        authLink.textContent = `${userName} (Logout)`;
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'auth.html';
        };

        if (wishlistLink) {
            wishlistLink.style.display = 'inline-block';
        }

        // Check if user is admin (user with id=1 is admin by default)
        if (userId === '1') {
            adminLink.style.display = 'inline-block';
        }
    }

    updateCartCount();
});

// Update cart count
function updateCartCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        document.getElementById('cartCount').textContent = '0';
        return;
    }

    fetch(`${API_BASE}/cart/get?userId=${userId}`)
        .then(response => response.json())
        .then(items => {
            document.getElementById('cartCount').textContent = items.length;
        })
        .catch(error => console.error('Error:', error));
}
