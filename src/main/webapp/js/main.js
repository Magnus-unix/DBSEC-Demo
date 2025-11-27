// 全局变量
let currentUser = null;
let currentPage = 'home';
let categories = [];

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// 初始化应用
function initializeApp() {
    // 检查用户登录状态
    checkLoginStatus();
    
    // 加载分类数据
    loadCategories();
    
    // 加载首页数据
    loadFeaturedBooks();
    
    // 设置导航事件
    setupNavigation();
}

// 设置事件监听器
function setupEventListeners() {
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
    
    // 个人资料表单提交
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // 地址表单提交
    document.getElementById('address-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAddress();
    });
    
    // 模态框外部点击关闭
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 键盘事件
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

// 设置导航
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            navigateTo(target);
        });
    });
}

// 页面导航
function navigateTo(page) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(p => p.classList.remove('active'));
    
    // 移除所有导航激活状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // 设置导航激活状态
        const activeLink = document.querySelector(`.nav-link[href="#${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // 根据页面加载特定数据
        switch(page) {
            case 'books':
                loadBooks();
                break;
            case 'cart':
                loadCart();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'addresses':
                loadAddresses();
                break;
            case 'profile':
                loadProfile();
                break;
        }
        
        currentPage = page;
    }
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // 验证token有效性
        fetch('UserServlet?action=verify', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Token invalid');
            }
        })
        .then(user => {
            currentUser = user;
            showUserInfo();
        })
        .catch(error => {
            console.error('Token verification failed:', error);
            localStorage.removeItem('authToken');
            showAuthButtons();
        });
    } else {
        showAuthButtons();
    }
}

// 显示用户信息
function showUserInfo() {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('username').textContent = currentUser.username;
}

// 显示认证按钮
function showAuthButtons() {
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    currentUser = null;
}

// 加载分类数据
function loadCategories() {
    fetch('CategoryServlet?action=list')
        .then(response => response.json())
        .then(data => {
            categories = data;
            renderCategories();
            populateCategoryFilters();
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

// 渲染分类
function renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    
    container.innerHTML = categories.map(category => `
        <div class="category-card" onclick="navigateToCategory('${category.category_id}')">
            <div class="category-icon">📚</div>
            <h4>${category.category_name}</h4>
        </div>
    `).join('');
}

// 填充分类筛选器
function populateCategoryFilters() {
    const filters = [
        document.getElementById('category-filter'),
        document.getElementById('search-category')
    ];
    
    filters.forEach(filter => {
        if (filter) {
            filter.innerHTML = '<option value="">全部分类</option>' + 
                categories.map(cat => 
                    `<option value="${cat.category_id}">${cat.category_name}</option>`
                ).join('');
        }
    });
}

// 导航到分类
function navigateToCategory(categoryId) {
    navigateTo('books');
    setTimeout(() => {
        document.getElementById('category-filter').value = categoryId;
        loadBooks();
    }, 100);
}

// 加载推荐图书
function loadFeaturedBooks() {
    fetch('BookServlet?action=featured')
        .then(response => response.json())
        .then(books => {
            renderBooks(books, 'featured-books');
        })
        .catch(error => {
            console.error('Error loading featured books:', error);
        });
}

// 渲染图书列表
function renderBooks(books, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <p>暂无图书数据</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="book-card" onclick="showBookDetail('${book.book_id}')">
            <div class="book-image">
                📖
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.book_name}</h3>
                <p class="book-author">${book.author_names || '未知作者'}</p>
                <p class="book-price">¥${book.price}</p>
                <p class="book-stock">库存: ${book.stock_quantity}</p>
                <div class="book-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart('${book.book_id}', 1)">
                        加入购物车
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 快速搜索
function quickSearch() {
    const query = document.getElementById('quick-search').value.trim();
    if (query) {
        navigateTo('search');
        setTimeout(() => {
            document.getElementById('search-title').value = query;
            advancedSearch();
        }, 100);
    }
}

// 显示登录模态框
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

// 关闭登录模态框
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('login-form').reset();
}

// 显示注册模态框
function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

// 关闭注册模态框
function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('register-form').reset();
    clearRegisterErrors();
}

// 切换登录/注册模态框
function switchToRegister() {
    closeLoginModal();
    showRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    showLoginModal();
}

// 清除注册错误信息
function clearRegisterErrors() {
    document.getElementById('username-error').textContent = '';
    document.getElementById('email-error').textContent = '';
}

// 关闭所有模态框
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// 显示消息
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `alert alert-${type}`;
    messageEl.textContent = message;
    
    // 添加到页面顶部
    document.body.insertBefore(messageEl, document.body.firstChild);
    
    // 自动移除
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}