// API base URL
const API_BASE = 'http://localhost:8080';
let allProducts = [];

// DOM Elements
const productForm = document.getElementById('productForm');
const productMessage = document.getElementById('productMessage');
const loadProductsBtn = document.getElementById('loadProductsBtn');
const productsContainer = document.getElementById('productsContainer');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');

// Form submission handler
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('pname').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;
    const category = document.getElementById('category').value;
    const imageUrl = document.getElementById('imageUrl').value;

    try {
        const response = await fetch(
            `${API_BASE}/products/add?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&price=${price}&quantity=${quantity}&category=${encodeURIComponent(category)}&imageUrl=${encodeURIComponent(imageUrl)}`,
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
            productForm.reset();
            loadProductsBtn.click();
            setTimeout(() => {
                productMessage.style.display = 'none';
            }, 3000);
        } else {
            showMessage('❌ Failed to add product.', 'error');
        }
    } catch (error) {
        showMessage(`❌ Error: ${error.message}`, 'error');
        console.error('Error:', error);
    }
});

// Load products handler
loadProductsBtn.addEventListener('click', async () => {
    try {
        productsContainer.innerHTML = '<p class="loading">Loading products...</p>';

        const response = await fetch(`${API_BASE}/products/all`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        allProducts = products;

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="empty-state">No products found. Add a new product to get started!</p>';
        } else {
            displayProducts(products);
        }
    } catch (error) {
        productsContainer.innerHTML = `<p class="empty-state">❌ Error loading products: ${error.message}</p>`;
        console.error('Error:', error);
    }
});

// Add to cart function
function addToCart(productId, button) {
    const qtyInput = button.parentElement.querySelector('.qty-input');
    const quantity = parseInt(qtyInput.value);
    
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert('Please login first!');
        window.location.href = 'auth.html';
        return;
    }

    fetch(`${API_BASE}/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}`)
        .then(response => response.text())
        .then(result => {
            alert(result);
            updateCartCount();
        })
        .catch(error => console.error('Error:', error));
}

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

// Show message helper
function showMessage(text, type) {
    productMessage.textContent = text;
    productMessage.className = `message ${type}`;
    productMessage.style.display = 'block';
}

// Auto-load products on page load
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
    }

    loadProductsBtn.click();
    updateCartCount();
    loadCategories();
    
    // Update price range display
    if (priceRange) {
        priceRange.addEventListener('input', () => {
            priceValue.textContent = priceRange.value;
        });
    }
});

// Load categories for filter
function loadCategories() {
    fetch(`${API_BASE}/products/categories`)
        .then(response => response.json())
        .then(categories => {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.innerHTML = '<label><input type="checkbox" checked onchange="applyFilters()"> All Categories</label>';
                categories.forEach(category => {
                    categoryFilter.innerHTML += `<label><input type="checkbox" value="${category}" onchange="applyFilters()"> ${category}</label>`;
                });
            }
        })
        .catch(error => console.error('Error loading categories:', error));
}

// Search products
function searchProducts() {
    const keyword = document.getElementById('searchInput').value;
    if (!keyword.trim()) {
        alert('Please enter a search term');
        return;
    }

    fetch(`${API_BASE}/products/search?keyword=${encodeURIComponent(keyword)}`)
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
            allProducts = products;
        })
        .catch(error => {
            console.error('Error:', error);
            productsContainer.innerHTML = `<p class="empty-state">❌ Error: ${error.message}</p>`;
        });
}

// Autocomplete
let acTimer = null;
let acSelectedIndex = -1;
const suggestionsEl = () => document.getElementById('suggestions');
document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(acTimer);
    if (!q) { if (suggestionsEl()) suggestionsEl().innerHTML = ''; return; }
    acTimer = setTimeout(async () => {
        try {
            // prefer server search, fallback to client filter
            let res = await fetch(`${API_BASE}/products/search?keyword=${encodeURIComponent(q)}`);
            let list = [];
            if (res.ok) list = await res.json();
            else list = allProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.description||'').toLowerCase().includes(q.toLowerCase()));

            const suggestions = (list || []).slice(0,8);
            const container = suggestionsEl();
            if (!container) return;
            if (suggestions.length === 0) { container.innerHTML = '<div class="suggestion-item">No matches</div>'; return; }
            container.innerHTML = suggestions.map((p, idx) => `
                <div class="suggestion-item" role="option" data-id="${p.id}" data-index="${idx}">
                    <img src="${p.imageUrl || 'https://via.placeholder.com/48'}" alt="${p.name}">
                    <div class="suggestion-title">${p.name}</div>
                    <div class="suggestion-price">$${(p.price||0).toFixed(2)}</div>
                </div>
            `).join('');
            acSelectedIndex = -1;
            container.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => navigateToProduct(item.getAttribute('data-id')));
                item.addEventListener('mouseover', () => highlightItem(parseInt(item.getAttribute('data-index'))));
            });
        } catch (err) {
            console.error('Autocomplete error', err);
        }
    }, 250);
});

// hide suggestions on outside click
document.addEventListener('click', (e) => {
    const container = suggestionsEl();
    if (!container) return;
    if (!document.getElementById('searchContainer').contains(e.target)) {
        container.innerHTML = '';
    }
});

// Keyboard navigation for autocomplete
document.getElementById('searchInput').addEventListener('keydown', (e) => {
    const container = suggestionsEl();
    if (!container || container.innerHTML === '') return;
    
    const items = Array.from(container.querySelectorAll('.suggestion-item'));
    if (items.length === 0) return;
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            acSelectedIndex = Math.min(acSelectedIndex + 1, items.length - 1);
            highlightItem(acSelectedIndex);
            break;
        case 'ArrowUp':
            e.preventDefault();
            acSelectedIndex = Math.max(acSelectedIndex - 1, -1);
            if (acSelectedIndex >= 0) highlightItem(acSelectedIndex);
            else items.forEach(i => i.classList.remove('selected'));
            break;
        case 'Enter':
            e.preventDefault();
            if (acSelectedIndex >= 0 && items[acSelectedIndex]) {
                navigateToProduct(items[acSelectedIndex].getAttribute('data-id'));
            }
            break;
        case 'Escape':
            e.preventDefault();
            container.innerHTML = '';
            acSelectedIndex = -1;
            break;
    }
});

function highlightItem(idx) {
    const container = suggestionsEl();
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.suggestion-item'));
    items.forEach(i => i.classList.remove('selected'));
    if (idx >= 0 && idx < items.length) {
        items[idx].classList.add('selected');
        items[idx].scrollIntoView({ block: 'nearest' });
    }
}

function navigateToProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

// Apply filters
function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('#categoryFilter input:checked'))
        .map(checkbox => checkbox.value)
        .filter(v => v !== 'on');

    const maxPrice = parseFloat(document.getElementById('priceRange').value);

    let filtered = allProducts;

    if (selectedCategories.length > 0 && !selectedCategories.includes('All Categories')) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    filtered = filtered.filter(p => p.price <= maxPrice);

    displayProducts(filtered);
}

// Reset filters
function resetFilters() {
    document.getElementById('priceRange').value = '10000';
    document.getElementById('priceValue').textContent = '10000';
    document.querySelectorAll('#categoryFilter input').forEach(checkbox => checkbox.checked = false);
    document.querySelector('#categoryFilter input').checked = true;
    loadProductsBtn.click();
}

// Display products
function displayProducts(products) {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="empty-state">No products found</p>';
        return;
    }

    productsContainer.innerHTML = products.map(product => {
        const discount = Math.floor(Math.random() * 40) + 5; // Random discount 5-45%
        const originalPrice = (product.price / (1 - discount / 100)).toFixed(2);
        
        return `
            <div class="product-card">
                <div style="position: relative;">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    ${discount > 0 ? `<div class="product-badge">${discount}% Off</div>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-name"><a href="product-detail.html?id=${product.id}" style="color:inherit;text-decoration:none;">${product.name}</a></div>
                    <div class="product-rating">
                        <span class="stars">★★★★☆</span>
                        <span class="rating-count">(${Math.floor(Math.random() * 500) + 10} reviews)</span>
                    </div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    ${discount > 0 ? `<div><span class="product-original-price">$${originalPrice}</span><span class="product-discount">${discount}% off</span></div>` : ''}
                    <div class="product-stock ${product.quantity > 20 ? 'instock' : product.quantity > 0 ? 'lowstock' : 'outstock'}">
                        ${product.quantity > 0 ? `✓ In Stock (${product.quantity})` : '✗ Out of Stock'}
                    </div>
                    <div class="product-actions">
                        <input type="number" value="1" min="1" max="${product.quantity}" class="qty-input" data-product-id="${product.id}">
                        <button ${product.quantity === 0 ? 'disabled' : ''} onclick="addToCart(${product.id}, this)">🛒 Add</button>
                        <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">❤️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle wishlist
function toggleWishlist(productId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login first!');
        window.location.href = 'auth.html';
        return;
    }
    // Try server-side wishlist; on failure use localStorage fallback
    fetch(`${API_BASE}/wishlist/check?userId=${userId}&productId=${productId}`)
        .then(async response => {
            if (!response.ok) throw new Error('Wishlist API not available');
            return await response.json();
        })
        .then(isInWishlist => {
            if (isInWishlist) {
                fetch(`${API_BASE}/wishlist/remove?userId=${userId}&productId=${productId}`)
                    .then(response => response.text())
                    .then(() => alert('Removed from wishlist'))
                    .catch(error => console.error('Error:', error));
            } else {
                fetch(`${API_BASE}/wishlist/add?userId=${userId}&productId=${productId}`)
                    .then(response => response.text())
                    .then(() => alert('Added to wishlist'))
                    .catch(error => console.error('Error:', error));
            }
        })
        .catch(_ => {
            // fallback: store wishlist in localStorage
            const local = JSON.parse(localStorage.getItem('localWishlist') || '[]');
            const idx = local.indexOf(productId);
            if (idx >= 0) {
                local.splice(idx, 1);
                localStorage.setItem('localWishlist', JSON.stringify(local));
                alert('Removed from wishlist (local)');
            } else {
                local.push(productId);
                localStorage.setItem('localWishlist', JSON.stringify(local));
                alert('Added to wishlist (local)');
            }
        });
}
