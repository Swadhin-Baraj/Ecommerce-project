const API_BASE = 'http://localhost:8080';

// Sample coupon database
const validCoupons = {
    'SAVE10': { type: 'percent', value: 10, description: '10% Off' },
    'SAVE20': { type: 'percent', value: 20, description: '20% Off' },
    'FLAT5': { type: 'fixed', value: 5, description: '$5 Off' },
    'FLAT10': { type: 'fixed', value: 10, description: '$10 Off' }
};

let cartItems = [];
let appliedCoupon = null;
let appliedDiscount = 0;

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const authLink = document.getElementById('authLink');

    if (!userId) {
        alert('Please login first!');
        window.location.href = 'auth.html';
        return;
    }

    if (userId && authLink) {
        authLink.textContent = `${userName} (Logout)`;
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'auth.html';
        };
    }

    loadCart(userId);
    updateCartCount();
    prefillAddress(userName);
});

function prefillAddress(name) {
    if (name) {
        document.getElementById('fullName').value = name;
        document.getElementById('email').value = localStorage.getItem('userEmail') || '';
    }
}

function loadCart(userId) {
    fetch(`${API_BASE}/cart/get?userId=${userId}`)
        .then(response => response.json())
        .then(items => {
            cartItems = items || [];
            renderOrderSummary();
        })
        .catch(error => {
            console.error('Error loading cart:', error);
            document.getElementById('orderItems').innerHTML = '<p class="empty-state">Cart is empty</p>';
        });
}

function renderOrderSummary() {
    const container = document.getElementById('orderItems');
    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = '<p class="empty-state">Your cart is empty</p>';
        updateTotals();
        return;
    }

    const itemsHTML = cartItems.map(item => {
        const product = item.product;
        const itemTotal = (product.price * item.quantity).toFixed(2);
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #e8e8e8;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1e3c72;">${product.name}</div>
                    <div style="font-size: 0.85em; color: #666;">Qty: ${item.quantity} × $${product.price.toFixed(2)}</div>
                </div>
                <div style="text-align: right; font-weight: 600; color: #ff9f43;">$${itemTotal}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = itemsHTML;
    updateTotals();
}

function updateTotals() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    appliedDiscount = 0;

    if (appliedCoupon) {
        const coupon = validCoupons[appliedCoupon];
        if (coupon.type === 'percent') {
            appliedDiscount = (subtotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
            appliedDiscount = coupon.value;
        }
    }

    const total = Math.max(0, subtotal - appliedDiscount);

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `-$${appliedDiscount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const msgEl = document.getElementById('couponMessage');

    if (!code) {
        msgEl.textContent = '❌ Please enter a coupon code';
        msgEl.style.color = '#ff4757';
        return;
    }

    if (validCoupons[code]) {
        appliedCoupon = code;
        const coupon = validCoupons[code];
        msgEl.textContent = `✓ Applied! ${coupon.description}`;
        msgEl.style.color = '#00b050';
        updateTotals();
    } else {
        msgEl.textContent = '❌ Invalid coupon code';
        msgEl.style.color = '#ff4757';
        appliedCoupon = null;
        updateTotals();
    }
}

function fillCoupon(code) {
    document.getElementById('couponCode').value = code;
    applyCoupon();
}

function validateCardNumber(num) {
    return /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(num.replace(/\s/g, ''));
}

function validateExpiry(exp) {
    return /^\d{2}\/\d{2}$/.test(exp);
}

function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function processPayment() {
    const addressForm = document.getElementById('addressForm');
    const paymentForm = document.getElementById('paymentForm');
    const msgEl = document.getElementById('paymentMessage');

    // Validate forms
    if (!addressForm.checkValidity()) {
        msgEl.textContent = '❌ Please fill in all shipping details';
        msgEl.className = 'message error';
        return;
    }

    if (!paymentForm.checkValidity()) {
        msgEl.textContent = '❌ Please fill in all payment details';
        msgEl.className = 'message error';
        return;
    }

    // Validate card
    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    if (!validateCardNumber(cardNumber)) {
        msgEl.textContent = '❌ Invalid card number format (use: 1234 5678 9012 3456)';
        msgEl.className = 'message error';
        return;
    }

    if (!validateExpiry(expiry)) {
        msgEl.textContent = '❌ Invalid expiry date format (use: MM/YY)';
        msgEl.className = 'message error';
        return;
    }

    if (!validateCVV(cvv)) {
        msgEl.textContent = '❌ Invalid CVV (3-4 digits)';
        msgEl.className = 'message error';
        return;
    }

    // Simulate payment processing
    msgEl.textContent = '⏳ Processing payment...';
    msgEl.className = 'message';

    setTimeout(() => {
        // Simulate random success (95% success rate for demo)
        const success = Math.random() > 0.05;

        if (success) {
            const userId = localStorage.getItem('userId');
            const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const total = subtotal - appliedDiscount;

            // Create order
            createOrder(userId, total);
        } else {
            msgEl.textContent = '❌ Payment declined. Please try again.';
            msgEl.className = 'message error';
        }
    }, 1500);
}

function createOrder(userId, totalAmount) {
    const address = document.getElementById('address').value + ', ' +
                   document.getElementById('city').value + ', ' +
                   document.getElementById('state').value + ' ' +
                   document.getElementById('zipcode').value;

    fetch(`${API_BASE}/orders/create?userId=${userId}&totalAmount=${totalAmount}&shippingAddress=${encodeURIComponent(address)}`)
        .then(response => response.json())
        .then(order => {
            if (order && order.id) {
                document.getElementById('paymentMessage').textContent = 
                    `✓ Payment successful! Order #${order.id} created.`;
                document.getElementById('paymentMessage').className = 'message success';
                
                // Clear cart
                clearUserCart(userId);
                
                // Redirect after 2s
                setTimeout(() => {
                    window.location.href = `orders.html`;
                }, 2000);
            } else {
                document.getElementById('paymentMessage').textContent = 'Error creating order. Please try again.';
                document.getElementById('paymentMessage').className = 'message error';
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            document.getElementById('paymentMessage').textContent = 
                '✓ Payment processed! (Order creation simulated - backend unavailable)';
            document.getElementById('paymentMessage').className = 'message success';
            
            setTimeout(() => {
                window.location.href = `orders.html`;
            }, 2000);
        });
}

function clearUserCart(userId) {
    // Try to clear via API; if unavailable, it's OK (frontend fallback)
    fetch(`${API_BASE}/cart/clear?userId=${userId}`)
        .catch(() => {});
}

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

// Auto-format card number
document.addEventListener('DOMContentLoaded', () => {
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        });
    }
});
