// API base URL
const API_BASE = 'http://localhost:8080';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// Switch between tabs
function switchTab(tab) {
    document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);

        if (response.ok) {
            const user = await response.json();
            if (user && user.id) {
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userName', user.name);
                localStorage.setItem('userEmail', user.email);
                
                showLoginMessage(`✓ Login successful! Welcome ${user.name}`, 'success');
                loginForm.reset();

                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 2000);
            } else {
                showLoginMessage('❌ Invalid email or password', 'error');
            }
        } else {
            showLoginMessage('❌ Invalid email or password', 'error');
        }
    } catch (error) {
        showLoginMessage(`❌ Error: ${error.message}`, 'error');
        console.error('Error:', error);
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;

    if (password !== password2) {
        showRegisterMessage('❌ Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const result = await response.text();

        if (result.includes('successful')) {
            showRegisterMessage(`✓ ${result}`, 'success');
            registerForm.reset();

            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            showRegisterMessage(`❌ ${result}`, 'error');
        }
    } catch (error) {
        showRegisterMessage(`❌ Error: ${error.message}`, 'error');
        console.error('Error:', error);
    }
});

// Show login message
function showLoginMessage(text, type) {
    loginMessage.textContent = text;
    loginMessage.className = `message ${type}`;
    loginMessage.style.display = 'block';
}

// Show register message
function showRegisterMessage(text, type) {
    registerMessage.textContent = text;
    registerMessage.className = `message ${type}`;
    registerMessage.style.display = 'block';
}

// Update auth link on page load
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const authLink = document.getElementById('authLink');
    const wishlistLink = document.getElementById('wishlistLink');
    const ordersLink = document.getElementById('ordersLink');
    const adminLink = document.getElementById('adminLink');

    if (userId) {
        authLink.textContent = `${userName} (Logout)`;
        authLink.href = '#';
        authLink.onclick = () => {
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
    }
});

// Toggle visibility of password fields
// (show-password feature removed to keep passwords hidden)
