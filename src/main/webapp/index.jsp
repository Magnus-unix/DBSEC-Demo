<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网上图书销售平台</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/layout.css">
</head>
<body>
    <!-- 顶部导航栏 -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <h1>📚 网上书城</h1>
            </div>
            <nav class="main-nav">
                <ul>
                    <li><a href="#home" class="nav-link active">首页</a></li>
                    <li><a href="#books" class="nav-link">图书浏览</a></li>
                    <li><a href="#search" class="nav-link">图书搜索</a></li>
                    <li><a href="#cart" class="nav-link">购物车</a></li>
                    <li><a href="#orders" class="nav-link">我的订单</a></li>
                </ul>
            </nav>
            <div class="user-actions">
                <div id="user-info" class="user-info" style="display: none;">
                    <span id="username"></span>
                    <div class="user-menu">
                        <a href="#profile">个人中心</a>
                        <a href="#addresses">地址管理</a>
                        <a href="#" onclick="logout()">退出登录</a>
                    </div>
                </div>
                <div id="auth-buttons" class="auth-buttons">
                    <button class="btn btn-outline" onclick="showLoginModal()">登录</button>
                    <button class="btn btn-primary" onclick="showRegisterModal()">注册</button>
                </div>
            </div>
        </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
        <!-- 首页 -->
        <section id="home" class="page-section active">
            <div class="hero">
                <div class="container">
                    <h2>发现你的下一本好书</h2>
                    <p>百万图书任你挑选，优惠不断</p>
                    <div class="search-box">
                        <input type="text" id="quick-search" placeholder="搜索图书、作者、出版社...">
                        <button class="btn btn-primary" onclick="quickSearch()">搜索</button>
                    </div>
                </div>
            </div>
            
            <!-- 图书分类 -->
            <div class="categories-section">
                <div class="container">
                    <h3>图书分类</h3>
                    <div class="categories-grid" id="categories-grid">
                        <!-- 分类将通过JavaScript动态加载 -->
                    </div>
                </div>
            </div>

            <!-- 推荐图书 -->
            <div class="featured-books">
                <div class="container">
                    <h3>热门推荐</h3>
                    <div class="books-grid" id="featured-books">
                        <!-- 推荐图书将通过JavaScript动态加载 -->
                    </div>
                </div>
            </div>
        </section>

        <!-- 图书浏览 -->
        <section id="books" class="page-section">
            <div class="container">
                <div class="page-header">
                    <h2>图书浏览</h2>
                    <div class="filter-controls">
                        <select id="category-filter" class="form-control">
                            <option value="">全部分类</option>
                        </select>
                        <select id="sort-by" class="form-control">
                            <option value="price_asc">价格从低到高</option>
                            <option value="price_desc">价格从高到低</option>
                            <option value="name_asc">书名A-Z</option>
                            <option value="name_desc">书名Z-A</option>
                        </select>
                    </div>
                </div>
                <div class="books-container">
                    <div class="books-grid" id="books-grid">
                        <!-- 图书将通过JavaScript动态加载 -->
                    </div>
                    <div class="pagination" id="pagination">
                        <!-- 分页控件 -->
                    </div>
                </div>
            </div>
        </section>

        <!-- 图书搜索 -->
        <section id="search" class="page-section">
            <div class="container">
                <h2>图书搜索</h2>
                <div class="search-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="search-title">书名：</label>
                            <input type="text" id="search-title" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="search-author">作者：</label>
                            <input type="text" id="search-author" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="search-publisher">出版社：</label>
                            <input type="text" id="search-publisher" class="form-control">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="search-category">分类：</label>
                            <select id="search-category" class="form-control">
                                <option value="">全部分类</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="search-price-min">价格范围：</label>
                            <div class="price-range">
                                <input type="number" id="search-price-min" class="form-control" placeholder="最低价">
                                <span> - </span>
                                <input type="number" id="search-price-max" class="form-control" placeholder="最高价">
                            </div>
                        </div>
                        <div class="form-group">
                            <button class="btn btn-primary" onclick="advancedSearch()">搜索</button>
                            <button class="btn btn-secondary" onclick="resetSearch()">重置</button>
                        </div>
                    </div>
                </div>
                <div class="search-results">
                    <div class="results-info" id="results-info"></div>
                    <div class="books-grid" id="search-results">
                        <!-- 搜索结果将通过JavaScript动态加载 -->
                    </div>
                </div>
            </div>
        </section>

        <!-- 购物车 -->
        <section id="cart" class="page-section">
            <div class="container">
                <h2>购物车</h2>
                <div id="cart-content">
                    <!-- 购物车内容将通过JavaScript动态加载 -->
                </div>
            </div>
        </section>

        <!-- 我的订单 -->
        <section id="orders" class="page-section">
            <div class="container">
                <h2>我的订单</h2>
                <div class="order-filters">
                    <select id="order-status-filter" class="form-control" onchange="loadOrders()">
                        <option value="">全部状态</option>
                        <option value="pending">待付款</option>
                        <option value="paid">已付款</option>
                        <option value="shipped">已发货</option>
                        <option value="delivered">已送达</option>
                        <option value="cancelled">已取消</option>
                    </select>
                </div>
                <div class="orders-list" id="orders-list">
                    <!-- 订单列表将通过JavaScript动态加载 -->
                </div>
            </div>
        </section>

        <!-- 个人中心 -->
        <section id="profile" class="page-section">
            <div class="container">
                <h2>个人中心</h2>
                <div class="profile-content">
                    <div class="profile-info">
                        <h3>基本信息</h3>
                        <form id="profile-form" class="profile-form">
                            <div class="form-group">
                                <label for="profile-username">用户名：</label>
                                <input type="text" id="profile-username" class="form-control" readonly>
                            </div>
                            <div class="form-group">
                                <label for="profile-email">邮箱：</label>
                                <input type="email" id="profile-email" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="profile-phone">手机号：</label>
                                <input type="tel" id="profile-phone" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-primary">保存修改</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>

        <!-- 地址管理 -->
        <section id="addresses" class="page-section">
            <div class="container">
                <h2>地址管理</h2>
                <button class="btn btn-primary" onclick="showAddAddressModal()">添加新地址</button>
                <div class="addresses-list" id="addresses-list">
                    <!-- 地址列表将通过JavaScript动态加载 -->
                </div>
            </div>
        </section>
    </main>

    <!-- 登录模态框 -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeLoginModal()">&times;</span>
            <h3>用户登录</h3>
            <form id="login-form" class="auth-form">
                <div class="form-group">
                    <label for="login-username">用户名或邮箱：</label>
                    <input type="text" id="login-username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="login-password">密码：</label>
                    <input type="password" id="login-password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">登录</button>
            </form>
            <div class="auth-switch">
                <p>还没有账号？<a href="#" onclick="switchToRegister()">立即注册</a></p>
            </div>
        </div>
    </div>

    <!-- 注册模态框 -->
    <div id="registerModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeRegisterModal()">&times;</span>
            <h3>用户注册</h3>
            <form id="register-form" class="auth-form">
                <div class="form-group">
                    <label for="register-username">用户名：</label>
                    <input type="text" id="register-username" class="form-control" required>
                    <div class="error-message" id="username-error"></div>
                </div>
                <div class="form-group">
                    <label for="register-email">邮箱：</label>
                    <input type="email" id="register-email" class="form-control" required>
                    <div class="error-message" id="email-error"></div>
                </div>
                <div class="form-group">
                    <label for="register-password">密码：</label>
                    <input type="password" id="register-password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="register-phone">手机号：</label>
                    <input type="tel" id="register-phone" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary btn-block">注册</button>
            </form>
            <div class="auth-switch">
                <p>已有账号？<a href="#" onclick="switchToLogin()">立即登录</a></p>
            </div>
        </div>
    </div>

    <!-- 地址编辑模态框 -->
    <div id="addressModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeAddressModal()">&times;</span>
            <h3 id="address-modal-title">添加地址</h3>
            <form id="address-form" class="address-form">
                <input type="hidden" id="address-id">
                <div class="form-group">
                    <label for="address-detail">详细地址：</label>
                    <textarea id="address-detail" class="form-control" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="address-default">
                        <span>设为默认地址</span>
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeAddressModal()">取消</button>
                    <button type="submit" class="btn btn-primary">保存</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 图书详情模态框 -->
    <div id="bookDetailModal" class="modal">
        <div class="modal-content book-detail-modal">
            <span class="close" onclick="closeBookDetailModal()">&times;</span>
            <div id="book-detail-content">
                <!-- 图书详情内容将通过JavaScript动态加载 -->
            </div>
        </div>
    </div>

    <script src="${pageContext.request.contextPath}/js/main.js"></script>
    <script src="${pageContext.request.contextPath}/js/auth.js"></script>
    <script src="${pageContext.request.contextPath}/js/books.js"></script>
    <script src="${pageContext.request.contextPath}/js/cart.js"></script>
    <script src="${pageContext.request.contextPath}/js/orders.js"></script>
</body>
</html>