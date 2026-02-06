// API base URL
const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const authLink = document.getElementById('authLink');
    const ordersLink = document.getElementById('ordersLink');
    const adminLink = document.getElementById('adminLink');

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

        if (ordersLink) {
            ordersLink.style.display = 'inline-block';
        }

        if (adminLink && userId === '1') {
            adminLink.style.display = 'inline-block';
        }
    }

    document.getElementById('loadWishlistBtn').addEventListener('click', loadWishlist);
    updateCartCount();
    loadWishlist();
});

function loadWishlist() {
    const userId = localStorage.getItem('userId');
    const wishlistContainer = document.getElementById('wishlistContainer');
    
    wishlistContainer.innerHTML = '<p class="loading">Loading wishlist...</p>';
    // Try server wishlist; otherwise fallback to localStorage
    fetch(`${API_BASE}/wishlist/get?userId=${userId}`)
        .then(async response => {
            if (!response.ok) throw new Error('Wishlist API not available');
            return await response.json();
        })
        .then(wishlistItems => renderWishlistItems(wishlistItems))
        .catch(async _ => {
            console.warn('Wishlist API unavailable — falling back to localWishlist');
            const local = JSON.parse(localStorage.getItem('localWishlist') || '[]');
            if (!local || local.length === 0) {
                wishlistContainer.innerHTML = '<p class="empty-state">Your wishlist is empty! Start adding items 💔</p>';
                return;
            }
            // fetch product details for each id
            const promises = local.map(id => fetch(`${API_BASE}/products/get?id=${id}`).then(r => r.ok ? r.json() : null).catch(()=>null));
            const items = await Promise.all(promises);
            const wishlistItems = items.filter(Boolean).map(p => ({ product: p }));
            renderWishlistItems(wishlistItems, true);
        });
}

function renderWishlistItems(wishlistItems, localFallback = false) {
    const wishlistContainer = document.getElementById('wishlistContainer');
    if (!wishlistItems || wishlistItems.length === 0) {
        wishlistContainer.innerHTML = '<p class="empty-state">Your wishlist is empty! Start adding items 💔</p>';
        return;
    }

    wishlistContainer.innerHTML = wishlistItems.map(item => {
        const product = item.product;
        const discount = Math.floor(Math.random() * 40) + 5;
        const originalPrice = (product.price / (1 - discount / 100)).toFixed(2);

        return `
            <div class="product-card">
                <div style="position: relative;">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    ${discount > 0 ? `<div class="product-badge">${discount}% Off</div>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-rating">
                        <span class="stars">★★★★☆</span>
                        <span class="rating-count">(${Math.floor(Math.random() * 500) + 10} reviews)</span>
                    </div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    ${discount > 0 ? `<div><span class="product-original-price">$${originalPrice}</span><span class="product-discount">${discount}% off</span></div>` : ''}
                    <div class="product-stock ${product.quantity > 0 ? 'instock' : 'outstock'}">
                        ${product.quantity > 0 ? `✓ In Stock` : '✗ Out of Stock'}
                    </div>
                    <div class="product-actions">
                        <input type="number" value="1" min="1" max="${product.quantity}" class="qty-input">
                        <button ${product.quantity === 0 ? 'disabled' : ''} onclick="addToCart(${product.id})">🛒 Add</button>
                        <button class="wishlist-btn active" onclick="${localFallback ? `removeLocalWishlist(${product.id})` : `removeFromWishlist(${product.id})`}">❤️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function removeFromWishlist(productId) {
    const userId = localStorage.getItem('userId');
    
    fetch(`${API_BASE}/wishlist/remove?userId=${userId}&productId=${productId}`)
        .then(response => {
            if (!response.ok) throw new Error('API not available');
            return response.text();
        })
        .then(() => {
            alert('Removed from wishlist');
            loadWishlist();
        })
        .catch(_ => {
            // fallback to local
            const local = JSON.parse(localStorage.getItem('localWishlist') || '[]');
            const idx = local.indexOf(productId);
            if (idx >= 0) {
                local.splice(idx,1);
                localStorage.setItem('localWishlist', JSON.stringify(local));
            }
            alert('Removed from wishlist (local)');
            loadWishlist();
        });
}

function removeLocalWishlist(productId) {
    const local = JSON.parse(localStorage.getItem('localWishlist') || '[]');
    const idx = local.indexOf(productId);
    if (idx >= 0) {
        local.splice(idx,1);
        localStorage.setItem('localWishlist', JSON.stringify(local));
    }
    alert('Removed from wishlist (local)');
    loadWishlist();
}

function addToCart(productId) {
    const qtyInput = event.target.parentElement.querySelector('.qty-input');
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
