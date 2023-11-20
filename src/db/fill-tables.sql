-- Cart 1

-- Insert cart with open status
WITH inserted_cart AS (
    INSERT INTO carts (user_id, created_at, updated_at, status)
    VALUES
        (uuid_generate_v4(), '2023-01-01', '2023-01-02', 'open')
    RETURNING id
)

-- Insert cart_items
INSERT INTO cart_items (cart_id, product_id, count)
SELECT id, uuid_generate_v4(), 1 FROM inserted_cart
UNION ALL
SELECT id, uuid_generate_v4(), 2 FROM inserted_cart
UNION ALL
SELECT id, uuid_generate_v4(), 1 FROM inserted_cart;

-- Cart 2

-- Insert cart with ordered status, saves data to temporary table
CREATE TEMPORARY TABLE temp_inserted_ordered_cart AS
WITH inserted_ordered_cart AS (
    INSERT INTO carts (user_id, created_at, updated_at, status)
    VALUES
        (uuid_generate_v4(), '2023-01-03', '2023-01-04', 'ordered')
    RETURNING id, user_id
)
SELECT * FROM inserted_ordered_cart;

-- Insert cart_items
INSERT INTO cart_items (cart_id, product_id, count)
SELECT id, uuid_generate_v4(), 2 FROM temp_inserted_ordered_cart
UNION ALL
SELECT id, uuid_generate_v4(), 1 FROM temp_inserted_ordered_cart;

-- Insert order
INSERT INTO orders (user_id, cart_id, payment, delivery, comments, status, total)
SELECT
    user_id,
    id,
    '{"method": "credit_card", "amount": 50.00, "currency": "USD"}',
    '{"address": "123 Main St", "firstName": "Name", "lastName": "Surname"}',
    'Open Order Comments',
    'open',
    50.00
 FROM temp_inserted_ordered_cart;


