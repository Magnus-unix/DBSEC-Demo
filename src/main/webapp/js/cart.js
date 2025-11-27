let cartItems = [];

// 加载购物车
function loadCart() {
    if (!currentUser) {
        showCartLoginPrompt();
        return;
    }
    
    fetch('CartServlet?action=list', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
    .then(response => response.json())
    .then(items => {
        cartItems = items;
        renderCart();
    })
    .catch(error => {
        console.error('Error loading cart:', error);
        showMessage('加载购物车失败', 'error');
    });
}

// 显示登录提示
function showCartLoginPrompt() {
    const container = document.getElementById('cart-content');
    container.innerHTML = `
        <div class="empty-state">
            <div class="icon">🛒</div>
            <h3>请先登录</h3>
            <p>登录后查看购物车</p>
            <button class="btn btn-primary" onclick="showLoginModal()">立即登录</button>
        </div>
    `;
}

// 渲染购物车
function renderCart() {
    const container = document.getElementById('cart-content');
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🛒</div>
                <h3>购物车为空</h3>
                <p>快去挑选喜欢的图书吧</p>
                <button class="btn btn-primary" onclick="navigateTo('books')">去购物</button>
            </div>
        `;
        return;
    }
    
    let totalAmount = 0;
    let html = '';
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.book_name}</h4>
                    <p class="cart-item-author">${item.author_names || '未知作者'}</p>
                    <p class="cart-item-price">¥${item.price}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartItem('${item.book_id}', ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           onchange="updateCartItem('${item.book_id}', this.value)" min="1" max="${item.stock_quantity}">
                    <button class="quantity-btn" onclick="updateCartItem('${item.book_id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    ¥${itemTotal.toFixed(2)}
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.book_id}')">删除</button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="cart-total">
            <div class="cart-summary">
                <div class="total-line">
                    <span>商品总数:</span>
                    <span>${cartItems.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
                </div>
                <div class="total-line">
                    <span>总计:</span>
                    <span class="total-amount">¥${totalAmount.toFixed(2)}</span>
                </div>
            </div>
            <div class="cart-actions">
                <button class="btn btn-secondary" onclick="navigateTo('books')">继续购物</button>
                <button class="btn btn-primary" onclick="checkout()">去结算</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// 添加到购物车
function addToCart(bookId, quantity = 1, redirectToCheckout = false) {
    if (!currentUser) {
        showMessage('请先登录', 'warning');
        showLoginModal();
        return;
    }
    
    fetch('CartServlet?action=add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            bookId: bookId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('已添加到购物车', 'success');
            if (redirectToCheckout) {
                navigateTo('cart');
            }
            // 刷新购物车显示
            if (currentPage === 'cart') {
                loadCart();
            }
        } else {
            showMessage(result.message || '添加失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        showMessage('添加失败，请稍后重试', 'error');
    });
}

// 更新购物车商品数量
function updateCartItem(bookId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeFromCart(bookId);
        return;
    }
    
    fetch('CartServlet?action=update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            bookId: bookId,
            quantity: newQuantity
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            loadCart(); // 重新加载购物车
        } else {
            showMessage(result.message || '更新失败', 'error');
            loadCart(); // 重新加载以显示正确数量
        }
    })
    .catch(error => {
        console.error('Error updating cart:', error);
        showMessage('更新失败，请稍后重试', 'error');
    });
}

// 从购物车移除商品
function removeFromCart(bookId) {
    if (!confirm('确定要从购物车中移除这个商品吗？')) {
        return;
    }
    
    fetch('CartServlet?action=remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            bookId: bookId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('已从购物车移除', 'info');
            loadCart();
        } else {
            showMessage(result.message || '移除失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error removing from cart:', error);
        showMessage('移除失败，请稍后重试', 'error');
    });
}

// 结算
function checkout() {
    if (cartItems.length === 0) {
        showMessage('购物车为空', 'warning');
        return;
    }
    
    // 检查库存
    const outOfStockItems = cartItems.filter(item => item.quantity > item.stock_quantity);
    if (outOfStockItems.length > 0) {
        showMessage('部分商品库存不足，请调整数量', 'error');
        loadCart(); // 重新加载以更新库存显示
        return;
    }
    
    // 跳转到创建订单页面（这里简化处理，直接创建订单）
    createOrder();
}

// 创建订单
function createOrder() {
    fetch('OrderServlet?action=create', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('订单创建成功！', 'success');
            // 清空购物车
            cartItems = [];
            // 跳转到订单页面
            navigateTo('orders');
        } else {
            showMessage(result.message || '创建订单失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error creating order:', error);
        showMessage('创建订单失败，请稍后重试', 'error');
    });
}