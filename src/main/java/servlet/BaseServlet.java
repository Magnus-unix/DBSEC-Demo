package servlet;

import com.google.gson.Gson;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Method;

public class BaseServlet extends HttpServlet {
    protected Gson gson = new Gson();

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=utf-8");

        // 获取 action 参数 (例如 UserServlet?action=login)
        String action = req.getParameter("action");

        try {
            // 利用反射自动调用对应的方法
            Method method = this.getClass().getDeclaredMethod(action, HttpServletRequest.class, HttpServletResponse.class);
            method.invoke(this, req, resp);
        } catch (Exception e) {
            e.printStackTrace();
            sendError(resp, "操作失败: " + e.getMessage());
        }
    }

    // 辅助方法：发送成功 JSON
    protected void sendJson(HttpServletResponse resp, Object data) throws IOException {
        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(data));
        out.flush();
    }

    // 辅助方法：发送错误 JSON
    protected void sendError(HttpServletResponse resp, String msg) throws IOException {
        PrintWriter out = resp.getWriter();
        out.print("{\"success\": false, \"message\": \"" + msg + "\"}");
        out.flush();
    }

    // 辅助方法：解析前端传来的 JSON Body
    protected <T> T parseBody(HttpServletRequest req, Class<T> clazz) throws IOException {
        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return gson.fromJson(sb.toString(), clazz);
    }
}