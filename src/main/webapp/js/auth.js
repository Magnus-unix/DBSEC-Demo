// 处理登录
async function handleLogin() {
    const form = document.getElementById('login-form');
    const formData = new FormData(form);
    
    const loginData = {
        username: formData.get('login-username'),
        password: formData.get('login-password')
    };
    
    try {
        const response = await fetch('UserServlet?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('authToken', result.token);
            currentUser = result.user;
            showUserInfo();
            closeLoginModal();
            showMessage('登录成功！', 'success');
            
            // 刷新需要用户数据的页面
            if (currentPage === 'cart') loadCart();
            if (currentPage === 'orders') loadOrders();
        } else {
            showMessage(result.message || '登录失败', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('登录失败，请稍后重试', 'error');
    }
}

// 处理注册
async function handleRegister() {
    const form = document.getElementById('register-form');
    const formData = new FormData(form);
    
    const registerData = {
        username: formData.get('register-username'),
        email: formData.get('register-email'),
        password: formData.get('register-password'),
        phone: formData.get('register-phone')
    };
    
    // 清除之前的错误信息
    clearRegisterErrors();
    
    try {
        const response = await fetch('UserServlet?action=register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('注册成功！请登录', 'success');
            switchToLogin();
        } else {
            // 显示具体错误信息
            if (result.errors) {
                if (result.errors.username) {
                    document.getElementById('username-error').textContent = result.errors.username;
                }
                if (result.errors.email) {
                    document.getElementById('email-error').textContent = result.errors.email;
                }
            } else {
                showMessage(result.message || '注册失败', 'error');
            }
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('注册失败，请稍后重试', 'error');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    showAuthButtons();
    showMessage('已退出登录', 'info');
    
    // 跳转到首页
    navigateTo('home');
    
    // 清除用户相关数据
    if (currentPage === 'cart') loadCart();
    if (currentPage === 'orders') loadOrders();
}

// 加载个人资料
function loadProfile() {
    if (!currentUser) {
        showMessage('请先登录', 'warning');
        navigateTo('home');
        return;
    }
    
    document.getElementById('profile-username').value = currentUser.username;
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-phone').value = currentUser.phone || '';
}

// 更新个人资料
async function updateProfile() {
    if (!currentUser) {
        showMessage('请先登录', 'warning');
        return;
    }
    
    const formData = new FormData(document.getElementById('profile-form'));
    const updateData = {
        email: formData.get('profile-email'),
        phone: formData.get('profile-phone')
    };
    
    try {
        const response = await fetch('UserServlet?action=update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            showMessage('资料更新成功！', 'success');
        } else {
            showMessage(result.message || '更新失败', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showMessage('更新失败，请稍后重试', 'error');
    }
}