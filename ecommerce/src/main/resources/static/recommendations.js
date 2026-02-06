const API_BASE = 'http://localhost:8080';

async function loadRecommendations() {
    const userId = localStorage.getItem('userId');
    const container = document.getElementById('recoList');
    if (!container) return;

    // Try server-side recommendations first; if unavailable, fallback to client-side logic
    if (userId) {
        try {
            const res = await fetch(`${API_BASE}/recommendations/user?userId=${userId}`);
            if (res.ok) {
                const list = await res.json();
                if (Array.isArray(list) && list.length > 0) {
                    renderList(container, list);
                    return;
                }
            }
        } catch (e) {
            // ignore and fallback
        }
    }

    // Fallback: build recommendations from wishlist + products
    try {
        const productsRes = await fetch(`${API_BASE}/products/all`);
        const allProducts = await productsRes.json();

        if (userId) {
            const wishRes = await fetch(`${API_BASE}/wishlist/get?userId=${userId}`);
            const wishlist = await wishRes.json();
            const categories = (wishlist || []).map(w => w.product && w.product.category).filter(Boolean);
            const wishlistIds = new Set((wishlist || []).map(w => w.product && w.product.id).filter(Boolean));

            const recommended = allProducts.filter(p => p.category && categories.includes(p.category) && !wishlistIds.has(p.id)).slice(0,8);
            if (recommended.length > 0) {
                renderList(container, recommended);
                return;
            }
        }

        // if nothing from wishlist or no user, show featured
        const featuredRes = await fetch(`${API_BASE}/products/featured`);
        const featured = await featuredRes.json();
        renderList(container, featured);
    } catch (e) {
        console.error('Error loading recommendations', e);
        container.innerHTML = '<p class="empty-state">Error loading recommendations</p>';
    }
}

function renderList(container, list) {
    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<p class="empty-state">No recommendations yet.</p>';
        return;
    }
    container.innerHTML = list.map(p => `
        <div class="product-card">
            <img src="${p.imageUrl || 'https://via.placeholder.com/200'}" alt="${p.name}" />
            <div class="product-card-body">
                <a href="product-detail.html?id=${p.id}" class="product-card-title">${p.name}</a>
                <div class="product-card-price">$${(p.price||0).toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadRecommendations);
