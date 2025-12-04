-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 使用数据库
USE online_bookstore;

-- 触发器1: 默认地址唯一性保障
-- DELIMITER $$

-- CREATE TRIGGER before_address_default_update
-- BEFORE UPDATE ON addresses
-- FOR EACH ROW
-- BEGIN
--     -- 检查是否正在将地址设置为默认地址
--     IF NEW.is_default = TRUE AND (OLD.is_default = FALSE OR OLD.is_default IS NULL) THEN
--         -- 将该用户的其他地址全部设置为非默认
--         UPDATE addresses 
--         SET is_default = FALSE 
--         WHERE user_id = NEW.user_id 
--         AND address_id != NEW.address_id;
--     END IF;
-- END$$

-- DELIMITER ;

-- 触发器2：下单前检查库存
DELIMITER $$

CREATE TRIGGER before_order_item_insert
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    SELECT stock_quantity INTO current_stock 
    FROM books 
    WHERE book_id = NEW.book_id;
    
    IF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Insufficient book stock';
    END IF;
END$$

DELIMITER ;

-- 触发器3：下单后自动扣减库存
DELIMITER $$

CREATE TRIGGER after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE books 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE book_id = NEW.book_id;
END$$

DELIMITER ;

-- 触发器4：当订单取消时，恢复库存
DELIMITER $$

CREATE TRIGGER after_order_cancelled
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- 检查订单状态是否变为取消
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        -- 恢复所有相关图书的库存
        UPDATE books b
        JOIN order_items oi ON b.book_id = oi.book_id
        SET b.stock_quantity = b.stock_quantity + oi.quantity
        WHERE oi.order_id = NEW.order_id;
    END IF;
END$$

DELIMITER ;