-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('open', 'ordered'))
);

-- Cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    cart_id UUID REFERENCES carts(id),
    product_id UUID,
    count INTEGER,
    PRIMARY KEY (cart_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    cart_id UUID REFERENCES carts(id),
    payment JSON NOT NULL,
    delivery JSON NOT NULL,
    comments TEXT,
    status VARCHAR(20) CHECK (status IN ('open', 'approved', 'confirmed', 'sent', 'completed', 'cancelled')),
    total NUMERIC(10, 2) NOT NULL
);