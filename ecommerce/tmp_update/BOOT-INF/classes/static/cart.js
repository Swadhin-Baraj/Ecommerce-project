// API base URL
const API_BASE = 'http://localhost:8080';

// DOM Elements
const userIdInput = document.getElementById('userId');
const loadCartBtn = document.getElementById('loadCartBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const cartContainer = document.getElementById('cartContainer');
const totalItems = document.getElementById('totalItems');
const totalPrice = document.getElementById('totalPrice');

// Load cart handler
loadCartBtn.addEventListener('click', async () => {
    const userId = userIdInput.value;

    if (!userId) {
        alert('Please enter your user ID');
        return;
    }

    try {
        cartContainer.innerHTML = '<p class="loading">Loading cart...</p>';

        const response = await fetch(`${API_BASE}/cart/get?userId=${userId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cartItems = await response.json();

        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p class="empty-state">Your cart is empty!</p>';
            totalItems.textContent = '0';
            totalPrice.textContent = '0.00';
        } else {
            cartContainer.innerHTML = cartItems.map(item => `
                <div class="cart-item">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div>Qty: ${item.quantity}</div>
                    <div class="cart-item-price">$${item.totalPrice.toFixed(2)}</div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `).join('');

            totalItems.textContent = cartItems.length;
            const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
            totalPrice.textContent = total.toFixed(2);
        }
    } catch (error) {
        cartContainer.innerHTML = `<p class="empty-state">❌ Error loading cart: ${error.message}</p>`;
        console.error('Error:', error);
    }
});

// Remove from cart function
function removeFromCart(cartId) {
    fetch(`${API_BASE}/cart/remove?cartId=${cartId}`)
        .then(response => response.text())
        .then(result => {
            alert(result);
            loadCartBtn.click();
        })
        .catch(error => console.error('Error:', error));
}

// Clear cart handler
clearCartBtn.addEventListener('click', () => {
    const userId = userIdInput.value;

    if (!userId) {
        alert('Please enter your user ID');
        return;
    }

    if (confirm('Are you sure you want to clear your cart?')) {
        fetch(`${API_BASE}/cart/clear?userId=${userId}`)
            .then(response => response.text())
            .then(result => {
                alert(result);
                loadCartBtn.click();
            })
            .catch(error => console.error('Error:', error));
    }
});

// Auto-load if userId is in localStorage
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const authLink = document.getElementById('authLink');
    const wishlistLink = document.getElementById('wishlistLink');
    const ordersLink = document.getElementById('ordersLink');
    const adminLink = document.getElementById('adminLink');

    if (userId && authLink) {
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

        if (ordersLink) {
            ordersLink.style.display = 'inline-block';
        }

        if (adminLink && userId === '1') {
            adminLink.style.display = 'inline-block';
        }

        userIdInput.value = userId;
        loadCartBtn.click();
    }
});

// Navigate to checkout
function goToCheckout() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login first!');
        window.location.href = 'auth.html';
        return;
    }
    window.location.href = 'checkout.html';
}
