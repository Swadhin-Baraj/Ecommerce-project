// API base URL
const API_BASE = 'http://localhost:8080';

// DOM Elements
const userForm = document.getElementById('userForm');
const messageDiv = document.getElementById('message');
const loadUsersBtn = document.getElementById('loadUsersBtn');
const usersContainer = document.getElementById('usersContainer');

// Form submission handler
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(
            `${API_BASE}/users/add?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain'
                }
            }
        );

        if (response.ok) {
            const result = await response.text();
            showMessage(`✓ ${result}`, 'success');
            userForm.reset();
            
            // Clear message after 3 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            showMessage('❌ Failed to add user. Please try again.', 'error');
        }
    } catch (error) {
        showMessage(`❌ Error: ${error.message}`, 'error');
        console.error('Error:', error);
    }
});

// Load users handler
loadUsersBtn.addEventListener('click', async () => {
    try {
        usersContainer.innerHTML = '<p class="loading">Loading users...</p>';

        const response = await fetch(`${API_BASE}/users/all`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();

        if (users.length === 0) {
            usersContainer.innerHTML = '<p class="empty-state">No users found. Add a new user to get started!</p>';
        } else {
            usersContainer.innerHTML = users.map(user => `
                <div class="user-card">
                    <h3>${user.name}</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>ID:</strong> ${user.id}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        usersContainer.innerHTML = `<p class="empty-state">❌ Error loading users: ${error.message}</p>`;
        console.error('Error:', error);
    }
});

// Show message helper
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

// Update auth link and cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Frontend loaded successfully!');
    
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

        // Show Wishlist link for any logged-in user
        if (wishlistLink) {
            wishlistLink.style.display = 'inline-block';
        }

        // Show Orders link for any logged-in user
        if (ordersLink) {
            ordersLink.style.display = 'inline-block';
        }

        // Show Admin link only for user ID 1
        if (adminLink && userId === '1') {
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
