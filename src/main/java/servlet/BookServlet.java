package servlet;

import model.Book;
import util.DBUtil;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/BookServlet")
public class BookServlet extends BaseServlet {

    // 对应 books.js: loadBooks
    public void list(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        int page = Integer.parseInt(req.getParameter("page"));
        int limit = Integer.parseInt(req.getParameter("limit"));
        String categoryId = req.getParameter("category");
        int offset = (page - 1) * limit;

        try (Connection conn = DBUtil.getConnection()) {
            StringBuilder sql = new StringBuilder(
                    "SELECT b.*, p.publisher_name, c.category_name, " +
                            "(SELECT GROUP_CONCAT(a.author_name SEPARATOR ', ') FROM book_authors ba JOIN authors a ON ba.author_id = a.author_id WHERE ba.book_id = b.book_id) as author_names " +
                            "FROM books b " +
                            "JOIN publishers p ON b.publisher_id = p.publisher_id " +
                            "JOIN categories c ON b.category_id = c.category_id " +
                            "WHERE 1=1 ");

            List<Object> params = new ArrayList<>();

            if (categoryId != null && !categoryId.isEmpty()) {
                sql.append("AND b.category_id = ? ");
                params.add(categoryId);
            }

            // 拼接分页
            sql.append("LIMIT ?, ?");
            params.add(offset);
            params.add(limit);

            PreparedStatement ps = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            ResultSet rs = ps.executeQuery();
            List<Book> books = new ArrayList<>();
            while (rs.next()) {
                Book book = new Book();
                book.setBook_id(rs.getString("book_id"));
                book.setBook_name(rs.getString("book_name"));
                book.setPrice(rs.getBigDecimal("price"));
                book.setStock_quantity(rs.getInt("stock_quantity"));
                book.setAuthor_names(rs.getString("author_names"));
                books.add(book);
            }

            // 还需要查询 totalCount 用于分页，这里省略...

            Map<String, Object> result = new HashMap<>();
            result.put("books", books);
            result.put("totalCount", 100); // 暂时写死，你需要另外写一个 count SQL

            sendJson(resp, result);
        }
    }

    // 对应 books.js: loadFeaturedBooks (热门推荐)
    public void featured(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        // 简单实现：随机取4本书
        req.setAttribute("page", "1");
        req.setAttribute("limit", "4");
        list(req, resp); // 复用 list 逻辑，或者单独写 SQL
    }
}