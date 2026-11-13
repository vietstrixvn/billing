-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id           BIGINT PRIMARY KEY,
    full_name    VARCHAR(255) NOT NULL,
    email        VARCHAR(255),
    phone_number VARCHAR(50),
    address      TEXT,
    tax_code     VARCHAR(50),
    company_name VARCHAR(255),
    notes        TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_tax_code ON customers(tax_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active) WHERE deleted_at IS NULL;
