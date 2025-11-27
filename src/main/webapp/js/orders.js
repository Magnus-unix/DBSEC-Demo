// 加载订单列表
function loadOrders() {
    if (!currentUser) {
        showOrdersLoginPrompt();
        return;
    }
    
    const statusFilter = document.getElementById('order-status-filter').value;
    
    let url = 'OrderServlet?action=list';
    if (statusFilter) {
        url += `&status=${statusFilter}`;
    }
    
    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
    .then(response => response.json())
    .then(orders => {
        renderOrders(orders);
    })
    .catch(error => {
        console.error('Error loading orders:', error);
        showMessage('加载订单失败', 'error');
    });
}

// 显示登录提示
function showOrdersLoginPrompt() {
    const container = document.getElementById('orders-list');
    container.innerHTML = `
        <div class="empty-state">
            <div class="icon">📦</div>
            <h3>请先登录</h3>
            <p>登录后查看订单</p>
            <button class="btn btn-primary" onclick="showLoginModal()">立即登录</button>
        </div>
    `;
}

// 渲染订单列表
function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📦</div>
                <h3>暂无订单</h3>
                <p>快去选购喜欢的图书吧</p>
                <button class="btn btn-primary" onclick="navigateTo('books')">去购物</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-id">订单号: ${order.order_id}</span>
                    <span class="order-date">${formatDate(order.order_date)}</span>
                </div>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.book_name}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">¥${item.unit_price}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-address">
                    <strong>收货地址:</strong> ${order.address}
                </div>
                <div class="order-total">
                    总计: ¥${order.total_amount}
                </div>
            </div>
            <div class="order-actions">
                ${order.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="payOrder('${order.order_id}')">立即支付</button>
                    <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.order_id}')">取消订单</button>
                ` : ''}
                ${order.status === 'paid' ? `
                    <button class="btn btn-success btn-sm" onclick="confirmReceipt('${order.order_id}')">确认收货</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'delivered': '已送达',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 支付订单
function payOrder(orderId) {
    if (!confirm('确定要支付这个订单吗？')) {
        return;
    }
    
    fetch('OrderServlet?action=pay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            orderId: orderId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('支付成功！', 'success');
            loadOrders();
        } else {
            showMessage(result.message || '支付失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error paying order:', error);
        showMessage('支付失败，请稍后重试', 'error');
    });
}

// 取消订单
function cancelOrder(orderId) {
    if (!confirm('确定要取消这个订单吗？')) {
        return;
    }
    
    fetch('OrderServlet?action=cancel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            orderId: orderId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('订单已取消', 'info');
            loadOrders();
        } else {
            showMessage(result.message || '取消失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error cancelling order:', error);
        showMessage('取消失败，请稍后重试', 'error');
    });
}

// 确认收货
function confirmReceipt(orderId) {
    if (!confirm('确定已经收到商品了吗？')) {
        return;
    }
    
    fetch('OrderServlet?action=confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            orderId: orderId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('确认收货成功！', 'success');
            loadOrders();
        } else {
            showMessage(result.message || '确认失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error confirming receipt:', error);
        showMessage('确认失败，请稍后重试', 'error');
    });
}

// 地址管理功能
function loadAddresses() {
    if (!currentUser) {
        showMessage('请先登录', 'warning');
        navigateTo('home');
        return;
    }
    
    fetch('AddressServlet?action=list', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
    .then(response => response.json())
    .then(addresses => {
        renderAddresses(addresses);
    })
    .catch(error => {
        console.error('Error loading addresses:', error);
        showMessage('加载地址失败', 'error');
    });
}

function renderAddresses(addresses) {
    const container = document.getElementById('addresses-list');
    
    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🏠</div>
                <h3>暂无地址</h3>
                <p>请添加收货地址</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = addresses.map(address => `
        <div class="address-card ${address.is_default ? 'default' : ''}">
            <div class="address-header">
                <div class="address-info">
                    <p><strong>${address.address}</strong></p>
                </div>
                <div class="address-actions">
                    ${address.is_default ? '<span class="address-default-badge">默认地址</span>' : ''}
                    <button class="btn btn-primary btn-sm" onclick="editAddress('${address.address_id}')">编辑</button>
                    ${!address.is_default ? `
                        <button class="btn btn-success btn-sm" onclick="setDefaultAddress('${address.address_id}')">设为默认</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteAddress('${address.address_id}')">删除</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function showAddAddressModal() {
    document.getElementById('address-modal-title').textContent = '添加地址';
    document.getElementById('address-form').reset();
    document.getElementById('address-id').value = '';
    document.getElementById('addressModal').style.display = 'block';
}

function closeAddressModal() {
    document.getElementById('addressModal').style.display = 'none';
}

async function saveAddress() {
    const form = document.getElementById('address-form');
    const formData = new FormData(form);
    
    const addressData = {
        address: formData.get('address-detail'),
        is_default: formData.get('address-default') ? true : false
    };
    
    const addressId = document.getElementById('address-id').value;
    const action = addressId ? 'update' : 'add';
    
    if (addressId) {
        addressData.addressId = addressId;
    }
    
    try {
        const response = await fetch(`AddressServlet?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify(addressData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('地址保存成功！', 'success');
            closeAddressModal();
            loadAddresses();
        } else {
            showMessage(result.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('Error saving address:', error);
        showMessage('保存失败，请稍后重试', 'error');
    }
}

function editAddress(addressId) {
    fetch(`AddressServlet?action=get&id=${addressId}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
    .then(response => response.json())
    .then(address => {
        document.getElementById('address-modal-title').textContent = '编辑地址';
        document.getElementById('address-id').value = address.address_id;
        document.getElementById('address-detail').value = address.address;
        document.getElementById('address-default').checked = address.is_default;
        document.getElementById('addressModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error loading address:', error);
        showMessage('加载地址失败', 'error');
    });
}

function setDefaultAddress(addressId) {
    fetch('AddressServlet?action=setDefault', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            addressId: addressId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('默认地址设置成功！', 'success');
            loadAddresses();
        } else {
            showMessage(result.message || '设置失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error setting default address:', error);
        showMessage('设置失败，请稍后重试', 'error');
    });
}

function deleteAddress(addressId) {
    if (!confirm('确定要删除这个地址吗？')) {
        return;
    }
    
    fetch('AddressServlet?action=delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            addressId: addressId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('地址删除成功！', 'success');
            loadAddresses();
        } else {
            showMessage(result.message || '删除失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting address:', error);
        showMessage('删除失败，请稍后重试', 'error');
    });
}