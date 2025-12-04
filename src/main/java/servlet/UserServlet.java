package servlet;

import model.User;
import util.DBUtil;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/UserServlet")
public class UserServlet extends BaseServlet {

    // 对应 auth.js: handleLogin
    public void login(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        User userParams = parseBody(req, User.class); // 解析前端 JSON

        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT * FROM users WHERE (username=? OR email=?) AND password=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, userParams.getUsername()); // 前端可能传用户名或邮箱
            ps.setString(2, userParams.getUsername());
            ps.setString(3, userParams.getPassword());

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("token", rs.getString("user_id")); // 简单示例：直接用ID做Token

                User u = new User();
                u.setUsername(rs.getString("username"));
                u.setEmail(rs.getString("email"));
                u.setPhone(rs.getString("phone"));
                result.put("user", u);

                sendJson(resp, result);
            } else {
                sendError(resp, "用户名或密码错误");
            }
        }
    }

    // 对应 main.js: checkLoginStatus (Verify)
    public void verify(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        // 从 Header 获取 Token
        String authHeader = req.getHeader("Authorization");
        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            resp.setStatus(401); // 未授权
            return;
        }

        String userId = authHeader.substring(7); // 去掉 "Bearer "

        // 去数据库查这个 ID 是否存在
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT username, email, phone FROM users WHERE user_id=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, Integer.parseInt(userId));
            ResultSet rs = ps.executeQuery();

            if(rs.next()) {
                User u = new User();
                u.setUsername(rs.getString("username"));
                u.setEmail(rs.getString("email"));
                u.setPhone(rs.getString("phone"));
                sendJson(resp, u);
            } else {
                resp.setStatus(401);
            }
        }
    }

    // 还需要实现 register 和 update 方法...

}