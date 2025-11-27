let currentPageNum = 1;
const booksPerPage = 12;
let totalBooks = 0;

// 加载图书列表
function loadBooks(page = 1) {
    const categoryFilter = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-by').value;
    
    let url = `BookServlet?action=list&page=${page}&limit=${booksPerPage}`;
    
    if (categoryFilter) {
        url += `&category=${categoryFilter}`;
    }
    
    if (sortBy) {
        url += `&sort=${sortBy}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderBooks(data.books, 'books-grid');
            totalBooks = data.totalCount;
            renderPagination(page, Math.ceil(totalBooks / booksPerPage));
        })
        .catch(error => {
            console.error('Error loading books:', error);
            showMessage('加载图书失败', 'error');
        });
}

// 渲染分页控件
function renderPagination(currentPage, totalPages) {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 上一页按钮
    if (currentPage > 1) {
        paginationHTML += `<button onclick="loadBooks(${currentPage - 1})">上一页</button>`;
    }
    
    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active" disabled>${i}</button>`;
        } else {
            paginationHTML += `<button onclick="loadBooks(${i})">${i}</button>`;
        }
    }
    
    // 下一页按钮
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="loadBooks(${currentPage + 1})">下一页</button>`;
    }
    
    container.innerHTML = paginationHTML;
}

// 高级搜索
function advancedSearch() {
    const title = document.getElementById('search-title').value;
    const author = document.getElementById('search-author').value;
    const publisher = document.getElementById('search-publisher').value;
    const category = document.getElementById('search-category').value;
    const priceMin = document.getElementById('search-price-min').value;
    const priceMax = document.getElementById('search-price-max').value;
    
    let url = 'BookServlet?action=search';
    const params = [];
    
    if (title) params.push(`title=${encodeURIComponent(title)}`);
    if (author) params.push(`author=${encodeURIComponent(author)}`);
    if (publisher) params.push(`publisher=${encodeURIComponent(publisher)}`);
    if (category) params.push(`category=${category}`);
    if (priceMin) params.push(`priceMin=${priceMin}`);
    if (priceMax) params.push(`priceMax=${priceMax}`);
    
    if (params.length > 0) {
        url += '&' + params.join('&');
    }
    
    fetch(url)
        .then(response => response.json())
        .then(books => {
            const container = document.getElementById('search-results');
            const info = document.getElementById('results-info');
            
            if (books.length === 0) {
                info.textContent = '没有找到符合条件的图书';
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">🔍</div>
                        <p>没有找到符合条件的图书</p>
                    </div>
                `;
            } else {
                info.textContent = `找到 ${books.length} 本图书`;
                renderBooks(books, 'search-results');
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            showMessage('搜索失败', 'error');
        });
}

// 重置搜索
function resetSearch() {
    document.getElementById('search-title').value = '';
    document.getElementById('search-author').value = '';
    document.getElementById('search-publisher').value = '';
    document.getElementById('search-category').value = '';
    document.getElementById('search-price-min').value = '';
    document.getElementById('search-price-max').value = '';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('results-info').textContent = '';
}

// 显示图书详情
function showBookDetail(bookId) {
    fetch(`BookServlet?action=detail&id=${bookId}`)
        .then(response => response.json())
        .then(book => {
            const modal = document.getElementById('bookDetailModal');
            const content = document.getElementById('book-detail-content');
            
            content.innerHTML = `
                <div class="book-detail-header">
                    <div class="book-detail-image">
                        📖
                    </div>
                    <div class="book-detail-info">
                        <h2 class="book-detail-title">${book.book_name}</h2>
                        <div class="book-detail-meta">
                            <p><strong>作者:</strong> ${book.author_names || '未知作者'}</p>
                            <p><strong>出版社:</strong> ${book.publisher_name || '未知出版社'}</p>
                            <p><strong>分类:</strong> ${book.category_name || '未分类'}</p>
                            <p><strong>ISBN:</strong> ${book.book_id}</p>
                        </div>
                        <p class="book-detail-price">¥${book.price}</p>
                        <p class="book-detail-stock">库存: ${book.stock_quantity} 本</p>
                        <div class="book-detail-actions">
                            <button class="btn btn-primary" onclick="addToCart('${book.book_id}', 1)">
                                加入购物车
                            </button>
                            <button class="btn btn-success" onclick="buyNow('${book.book_id}', 1)">
                                立即购买
                            </button>
                        </div>
                    </div>
                </div>
                <div class="book-detail-description">
                    <h3>图书描述</h3>
                    <p>${book.description || '暂无描述'}</p>
                </div>
            `;
            
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading book detail:', error);
            showMessage('加载图书详情失败', 'error');
        });
}

// 关闭图书详情模态框
function closeBookDetailModal() {
    document.getElementById('bookDetailModal').style.display = 'none';
}

// 立即购买
function buyNow(bookId, quantity) {
    if (!currentUser) {
        showMessage('请先登录', 'warning');
        showLoginModal();
        return;
    }
    
    addToCart(bookId, quantity, true);
}