package servlet;
import util.DBUtil;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/CategoryServlet")
public class CategoryServlet extends BaseServlet {
    public void list(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT * FROM categories");
            ResultSet rs = ps.executeQuery();
            // ... 转成 List<Category> ...
            // sendJson(resp, list);
        }
    }
}