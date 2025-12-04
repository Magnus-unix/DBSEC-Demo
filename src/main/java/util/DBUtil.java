package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBUtil {
    // 1. 数据库连接地址
    // 如果是 MySQL 8.0+，建议加上 allowPublicKeyRetrieval=true 和 useSSL=false 避免报错
    // serverTimezone=Asia/Shanghai 解决时区报错
    private static final String URL = "jdbc:mysql://localhost:3306/online_bookstore?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false";

    // 2. 您的账号密码
    private static final String USER = "dbsec";
    private static final String PASSWORD = "dbsec";

    static {
        try {
            // 3. 加载驱动
            // 注意：MySQL 8.0 之后的驱动类名是 com.mysql.cj.jdbc.Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            System.out.println("数据库驱动加载失败！请检查 pom.xml 是否引入了 mysql-connector-j");
        }
    }

    // 4. 获取连接的方法
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    // 简单的测试方法（右键 -> Run 'DBUtil.main()' 可以测试连没连上）
    public static void main(String[] args) {
        try (Connection conn = getConnection()) {
            System.out.println("恭喜！数据库连接成功！");
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("连接失败，请检查 MySQL 是否启动，或者账号密码是否正确。");
        }
    }
}