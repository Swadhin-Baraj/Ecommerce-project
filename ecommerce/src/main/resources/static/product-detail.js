const API_BASE = 'http://localhost:8080';

function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

async function loadProduct() {
    const id = getQueryParam('id');
    if (!id) return;

    try {
        const res = await fetch(`${API_BASE}/products/get?id=${id}`);
        const product = await res.json();
        if (!product) return;

        document.getElementById('productName').textContent = product.name;
        document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productImage').src = product.imageUrl || 'https://via.placeholder.com/400';

        // load reviews
        loadReviews(id);

    } catch (e) {
        console.error('Error loading product', e);
    }
}

async function loadReviews(productId) {
    try {
        const res = await fetch(`${API_BASE}/reviews/product?productId=${productId}`);
        let reviews;
        if (!res.ok) {
            // backend not available -> use localStorage fallback
            console.warn('Reviews endpoint unavailable, using local fallback');
            const local = JSON.parse(localStorage.getItem('localReviews') || '[]');
            reviews = local.filter(r => String(r.productId) === String(productId));
        } else {
            reviews = await res.json();
        }
        const container = document.getElementById('reviewsList');
        if (!Array.isArray(reviews) || reviews.length === 0) {
            container.innerHTML = '<p class="empty-state">Be the first to review this product.</p>';
            document.getElementById('avgRating').textContent = '0.0';
            document.getElementById('reviewCount').textContent = '0';
            return;
        }

        document.getElementById('avgRating').textContent = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);
        document.getElementById('reviewCount').textContent = reviews.length;

        container.innerHTML = reviews.map(r => `
            <div class="order-card">
                <div style="font-weight:700;">${r.user.name || 'User #' + r.user.id} <span style="font-weight:600;color:#ff9f43;"> - ${r.rating}★</span></div>
                <div style="color:#555;margin-top:6px;">${r.comment || ''}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error loading reviews', e);
    }
}

async function submitReview() {
    const id = getQueryParam('id');
    const rating = document.getElementById('ratingSelect').value;
    const comment = document.getElementById('reviewComment').value;
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Please login to submit a review');
        window.location.href = 'auth.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/reviews/add?productId=${id}&userId=${userId}&rating=${rating}&comment=${encodeURIComponent(comment)}`);
        if (!res.ok) {
            // backend missing - save locally
            const local = JSON.parse(localStorage.getItem('localReviews') || '[]');
            local.push({ productId: id, user: { id: userId, name: localStorage.getItem('userName') || ('User ' + userId) }, rating: parseInt(rating), comment });
            localStorage.setItem('localReviews', JSON.stringify(local));
            alert('Saved review locally (backend unavailable)');
        } else {
            const text = await res.text();
            alert(text);
        }
        document.getElementById('reviewComment').value = '';
        loadReviews(id);
    } catch (e) {
        console.error('Error submitting review', e);
    }
}

function addToCartFromDetail() {
    const id = getQueryParam('id');
    const qty = parseInt(document.getElementById('qtyDetail').value) || 1;
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login'); window.location.href = 'auth.html'; return; }
    fetch(`${API_BASE}/cart/add?userId=${userId}&productId=${id}&quantity=${qty}`).then(r=>r.text()).then(t=>{ alert(t); }).catch(e=>console.error(e));
}

function toggleWishlistDetail() {
    const id = getQueryParam('id');
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login'); window.location.href = 'auth.html'; return; }
    fetch(`${API_BASE}/wishlist/check?userId=${userId}&productId=${id}`).then(r=>r.json()).then(isIn=>{
        if (isIn) {
            fetch(`${API_BASE}/wishlist/remove?userId=${userId}&productId=${id}`).then(r=>r.text()).then(()=>{ alert('Removed from wishlist'); });
        } else {
            fetch(`${API_BASE}/wishlist/add?userId=${userId}&productId=${id}`).then(r=>r.text()).then(()=>{ alert('Added to wishlist'); });
        }
    });
}

// init
document.addEventListener('DOMContentLoaded', loadProduct);
