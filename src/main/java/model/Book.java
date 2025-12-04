package model;
import java.math.BigDecimal;

public class Book {
    private String book_id; // ISBN
    private String book_name;
    private BigDecimal price;
    private int stock_quantity;
    private String description;
    private String author_names; // 对应 SQL 联表查询结果
    private String publisher_name;
    private String category_name;
    // 构造函数、Getter、Setter 省略

    public String getBook_id() {
        return book_id;
    }

    public void setBook_id(String book_id) {
        this.book_id = book_id;
    }

    public String getBook_name() {
        return book_name;
    }

    public void setBook_name(String book_name) {
        this.book_name = book_name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStock_quantity() {
        return stock_quantity;
    }

    public void setStock_quantity(int stock_quantity) {
        this.stock_quantity = stock_quantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAuthor_names() {
        return author_names;
    }

    public void setAuthor_names(String author_names) {
        this.author_names = author_names;
    }

    public String getPublisher_name() {
        return publisher_name;
    }

    public void setPublisher_name(String publisher_name) {
        this.publisher_name = publisher_name;
    }

    public String getCategory_name() {
        return category_name;
    }

    public void setCategory_name(String category_name) {
        this.category_name = category_name;
    }
}