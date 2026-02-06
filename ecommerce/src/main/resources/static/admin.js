// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    
    // Check if user is admin (user ID 1)
    if (!userId || userId !== '1') {
        alert('Access Denied! Only admins can access this page.');
        window.location.href = 'auth.html';
        return;
    }

    // Load dashboard statistics
    loadDashboardStats();

    // Update logout link
    const authLink = document.getElementById('authLink');
    authLink.textContent = 'Logout';
    authLink.onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'auth.html';
    };

    // Attach event listeners for tab buttons
    document.getElementById('loadAllOrdersBtn').addEventListener('click', loadAllOrders);
    document.getElementById('loadAllProductsBtn').addEventListener('click', loadAllProducts);
    document.getElementById('loadAllUsersBtn').addEventListener('click', loadAllUsers);
});

function switchAdminTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update button styling
    const buttons = document.querySelectorAll('.admin-tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function loadDashboardStats() {
    // Load total orders
    fetch('/orders/count')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalOrders').textContent = data;
        })
        .catch(error => console.error('Error loading total orders:', error));

    // Load total revenue
    fetch('/orders/revenue')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalRevenue').textContent = '$' + data.toFixed(2);
        })
        .catch(error => console.error('Error loading total revenue:', error));

    // Load total products
    fetch('/products/all')
        .then(response => response.json())
        .then(products => {
            document.getElementById('totalProducts').textContent = products.length;
        })
        .catch(error => console.error('Error loading total products:', error));

    // Load total users
    fetch('/users/all')
        .then(response => response.json())
        .then(users => {
            document.getElementById('totalUsers').textContent = users.length;
        })
        .catch(error => console.error('Error loading total users:', error));
}

function loadAllOrders() {
    const container = document.getElementById('allOrdersContainer');
    container.innerHTML = '<p class="empty-state">Loading orders...</p>';

    fetch('/orders/all')
        .then(response => response.json())
        .then(orders => {
            if (orders.length === 0) {
                container.innerHTML = '<p class="empty-state">No orders found</p>';
                return;
            }

            let html = '';
            orders.forEach(order => {
                html += `
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <h3>Order #${order.id}</h3>
                                <p style="margin: 5px 0; font-size: 0.9em; color: #666;">User ID: ${order.userId} | Total: $${order.totalAmount.toFixed(2)}</p>
                                <p style="margin: 5px 0; font-size: 0.9em; color: #666;">Shipping: ${order.shippingAddress}</p>
                                <p style="margin: 5px 0; font-size: 0.9em; color: #666;">Order Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <select id="status-${order.id}" value="${order.status}" class="form-control" style="padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
                                <option value="PENDING">PENDING</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <button class="btn btn-secondary btn-sm" onclick="updateOrderStatus(${order.id})">Update Status</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            container.innerHTML = '<p class="empty-state" style="color: red;">Error loading orders</p>';
        });
}

function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById(`status-${orderId}`);
    const newStatus = statusSelect.value;

    fetch(`/orders/update-status?orderId=${orderId}&status=${newStatus}`)
        .then(response => response.json())
        .then(data => {
            alert('Order status updated to ' + newStatus);
            loadAllOrders(); // Reload orders
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        });
}

function loadAllProducts() {
    const container = document.getElementById('allProductsContainer');
    container.innerHTML = '<p class="empty-state">Loading products...</p>';

    fetch('/products/all')
        .then(response => response.json())
        .then(products => {
            if (products.length === 0) {
                container.innerHTML = '<p class="empty-state">No products found</p>';
                return;
            }

            let html = '';
            products.forEach(product => {
                html += `
                    <div class="product-card">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <p><strong>Category:</strong> ${product.category}</p>
                            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            <div style="margin-top: 10px; display: flex; gap: 10px;">
                                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = '<div class="products-grid">' + html + '</div>';
        })
        .catch(error => {
            console.error('Error loading products:', error);
            container.innerHTML = '<p class="empty-state" style="color: red;">Error loading products</p>';
        });
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/products/delete?productId=${productId}`)
            .then(response => response.json())
            .then(data => {
                alert('Product deleted successfully');
                loadAllProducts(); // Reload products
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            });
    }
}

function loadAllUsers() {
    const container = document.getElementById('allUsersContainer');
    container.innerHTML = '<p class="empty-state">Loading users...</p>';

    fetch('/users/all')
        .then(response => response.json())
        .then(users => {
            if (users.length === 0) {
                container.innerHTML = '<p class="empty-state">No users found</p>';
                return;
            }

            let html = '<table style="width: 100%; border-collapse: collapse;">';
            html += '<thead><tr style="background: #f0f0f0;"><th style="border: 1px solid #ddd; padding: 10px; text-align: left;">ID</th><th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Name</th><th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Email</th></tr></thead>';
            html += '<tbody>';

            users.forEach(user => {
                html += `<tr>
                    <td style="border: 1px solid #ddd; padding: 10px;">${user.id}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${user.name}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${user.email}</td>
                </tr>`;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading users:', error);
            container.innerHTML = '<p class="empty-state" style="color: red;">Error loading users</p>';
        });
}
