-- ============================================
-- QUOTES TABLE
-- ============================================
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;

-- Status flow: draft → sent → approved | rejected | expired
CREATE TABLE IF NOT EXISTS quotes (
    id              BIGINT PRIMARY KEY,
    customer_id     BIGINT NOT NULL,
    quote_number    VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',

    -- Billing config
    billing_cycle   VARCHAR(20) NOT NULL DEFAULT 'monthly',
    plan_id         BIGINT,                               -- NULL = custom quote không gắn plan

    -- Financial snapshot (smallest currency unit)
    sub_total       BIGINT NOT NULL DEFAULT 0,
    discount_bps    INT    NOT NULL DEFAULT 0,            -- basis points: 1000 = 10%
    discount_amount BIGINT NOT NULL DEFAULT 0,
    tax_rate_bps    INT    NOT NULL DEFAULT 0,            -- basis points
    tax_amount      BIGINT NOT NULL DEFAULT 0,
    total_amount    BIGINT NOT NULL DEFAULT 0,
    currency        VARCHAR(10) NOT NULL DEFAULT 'VND',

    -- Lifecycle
    valid_until     TIMESTAMP,                            -- quote expires when?
    approved_at     TIMESTAMP,
    rejected_at     TIMESTAMP,
    expired_at      TIMESTAMP,                            -- set by job khi quá valid_until

    -- Khi approved → tạo subscription
    subscription_id BIGINT,                               -- NULL until approved

    notes           TEXT,
    created_by      BIGINT,
    created_by_type VARCHAR(20) NOT NULL DEFAULT 'admin',

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT uq_quotes_number        UNIQUE (quote_number),
    CONSTRAINT fk_quotes_customer      FOREIGN KEY (customer_id)     REFERENCES customers(id),
    CONSTRAINT fk_quotes_plan          FOREIGN KEY (plan_id)         REFERENCES plans(id),
    CONSTRAINT fk_quotes_subscription  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    CONSTRAINT chk_quotes_status       CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    CONSTRAINT chk_quotes_billing_cycle CHECK (billing_cycle IN ('monthly', 'quarterly', 'semi-annually', 'annual', 'biennial', 'triennial', 'quinquennial', 'one_time')),
    CONSTRAINT chk_quotes_created_by_type CHECK (created_by_type IN ('admin', 'customer', 'system')),
    CONSTRAINT chk_quotes_discount_bps CHECK (discount_bps BETWEEN 0 AND 10000),
    CONSTRAINT chk_quotes_tax_rate_bps CHECK (tax_rate_bps BETWEEN 0 AND 10000)
);

CREATE INDEX IF NOT EXISTS idx_quotes_customer_id
    ON quotes(customer_id);

CREATE INDEX IF NOT EXISTS idx_quotes_status
    ON quotes(status);

CREATE INDEX IF NOT EXISTS idx_quotes_subscription_id
    ON quotes(subscription_id)
    WHERE subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_valid_until
    ON quotes(valid_until)
    WHERE status = 'sent';

CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at
    ON quotes(deleted_at);

    
COMMENT ON COLUMN quotes.discount_bps   IS 'Basis points: 1000 = 10%, 10000 = 100%';
COMMENT ON COLUMN quotes.tax_rate_bps   IS 'Basis points: 1000 = 10%';
COMMENT ON COLUMN quotes.subscription_id IS 'NULL until quote is approved and subscription is created';
COMMENT ON COLUMN quotes.expired_at     IS 'Set by background job when NOW() > valid_until and status = sent';


-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id                BIGINT PRIMARY KEY,
    customer_id       BIGINT NOT NULL,
    billing_record_id BIGINT NOT NULL,
    invoice_number    VARCHAR(50) NOT NULL,
    billing_cycle     VARCHAR(20),                    -- copied from subscription at time of issue

    -- Financial breakdown (smallest currency unit)
    sub_total   BIGINT NOT NULL DEFAULT 0,            -- SUM(billing_line_items.total_price)
    tax_rate_bps INT    NOT NULL DEFAULT 0,           -- basis points: 1000 = 10%
    tax_type    VARCHAR(20) NOT NULL DEFAULT 'VAT',   -- VAT | GST | sales_tax | none (tax exempt)
    tax_amount  BIGINT NOT NULL DEFAULT 0,            -- sub_total * tax_rate_bps / 10000
    amount      BIGINT NOT NULL,                      -- sub_total + tax_amount

    currency    VARCHAR(10) NOT NULL DEFAULT 'VND',

    -- Multi-currency
    original_currency   VARCHAR(10),
    original_amount     BIGINT,                       -- original currency, smallest unit
    exchange_rate       NUMERIC(18,6),                -- e.g. 25350.000000
    exchange_rate_date  TIMESTAMP,
    functional_amount   BIGINT,                       -- = original_amount * exchange_rate
    functional_currency VARCHAR(10),                  -- always VND

    -- Dates
    issued_at   TIMESTAMP NOT NULL,
    due_at      TIMESTAMP,
    paid_at     TIMESTAMP,

    file_url    VARCHAR(500),                         -- PDF URL
    notes       TEXT,

    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP,

    CONSTRAINT uq_invoices_number UNIQUE (invoice_number),

    CONSTRAINT fk_invoices_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_invoices_billing_record
        FOREIGN KEY (billing_record_id) REFERENCES billing_records(id),

    CONSTRAINT chk_invoices_billing_cycle CHECK (
        billing_cycle IS NULL OR billing_cycle IN (
            'monthly',
            'quarterly',
            'semi-annually',
            'annual',
            'biennial',
            'triennial',
            'quinquennial',
            'one_time'
        )
    ),

    CONSTRAINT chk_invoices_tax_type CHECK (
        tax_type IN ('VAT', 'GST', 'sales_tax', 'none')
    ),

    CONSTRAINT chk_invoices_tax_rate_bps CHECK (
        tax_rate_bps BETWEEN 0 AND 10000
    ),

    CONSTRAINT chk_invoice_tax_consistency CHECK (
        (tax_type = 'none' AND tax_rate_bps = 0)
        OR
        (tax_type <> 'none' AND tax_rate_bps >= 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id       ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_record_id ON invoices(billing_record_id);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at         ON invoices(issued_at);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_cycle     ON invoices(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at        ON invoices(deleted_at);

-- Composite: revenue list per customer
CREATE INDEX IF NOT EXISTS idx_invoices_customer_issued ON invoices(customer_id, issued_at DESC)
    WHERE deleted_at IS NULL;

-- One live invoice per billing_record
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_billing_record
    ON invoices(billing_record_id)
    WHERE deleted_at IS NULL;

COMMENT ON COLUMN invoices.tax_rate_bps       IS 'Basis points: 1000 = 10%';
COMMENT ON COLUMN invoices.exchange_rate      IS 'Rate at invoice issue time, e.g. 25350.000000 (VND per 1 USD)';
COMMENT ON COLUMN invoices.functional_amount  IS 'VND equivalent = original_amount × exchange_rate';
COMMENT ON COLUMN invoices.functional_currency IS 'Always VND (accounting currency)';


-- ============================================
-- PAYMENT_TRANSACTIONS TABLE
-- One payment attempt = one row.
-- billing_record links many transactions → one record.
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id                BIGINT PRIMARY KEY,
    billing_record_id BIGINT NOT NULL,
    customer_id       BIGINT NOT NULL,                -- denorm for fast customer-level queries

    -- Amount
    amount            BIGINT NOT NULL,                -- smallest currency unit
    currency          VARCHAR(10) NOT NULL DEFAULT 'VND',

    -- Method & gateway
    payment_method    VARCHAR(50) NOT NULL,           -- bank_transfer | card | e_wallet | cash | credit
    gateway           VARCHAR(50),                    -- stripe | vnpay | momo | payos | manual | NULL

    -- Gateway reference
    gateway_txn_id    VARCHAR(255),                   -- ID trả về từ gateway
    gateway_status    VARCHAR(50),                    -- raw status string từ gateway
    gateway_response  JSONB,                          -- full raw payload (webhook / callback)

    -- Internal status
    status            VARCHAR(20) NOT NULL DEFAULT 'pending',
    failed_reason     TEXT,                           -- NULL unless status = failed

    -- Timestamps
    initiated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at      TIMESTAMP,                      -- gateway confirmed / manual confirmed
    failed_at         TIMESTAMP,

    processed_by      BIGINT,                         -- admin user id nếu manual
    notes             TEXT,

    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pt_billing_record FOREIGN KEY (billing_record_id) REFERENCES billing_records(id),
    CONSTRAINT fk_pt_customer       FOREIGN KEY (customer_id)       REFERENCES customers(id),
    CONSTRAINT chk_pt_status         CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
    CONSTRAINT chk_pt_payment_method CHECK (payment_method IN ('bank_transfer', 'card', 'e_wallet', 'cash', 'credit')),
    CONSTRAINT chk_pt_amount         CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_pt_billing_record_id ON payment_transactions(billing_record_id);
CREATE INDEX IF NOT EXISTS idx_pt_customer_id       ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_pt_status            ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pt_gateway_txn_id    ON payment_transactions(gateway_txn_id) WHERE gateway_txn_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pt_initiated_at      ON payment_transactions(initiated_at);
CREATE INDEX IF NOT EXISTS idx_pt_confirmed_at      ON payment_transactions(confirmed_at)   WHERE confirmed_at IS NOT NULL;

-- Composite: tracing failed payments for retry job
CREATE INDEX IF NOT EXISTS idx_pt_status_initiated ON payment_transactions(status, initiated_at)
    WHERE status IN ('pending', 'processing');

COMMENT ON COLUMN payment_transactions.gateway_txn_id   IS 'Transaction ID returned by payment gateway';
COMMENT ON COLUMN payment_transactions.gateway_response IS 'Full raw webhook/callback payload from gateway';
COMMENT ON COLUMN payment_transactions.confirmed_at     IS 'When payment was confirmed — by gateway callback or manual admin action';


-- ============================================
-- REFUNDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refunds (
    id                BIGINT PRIMARY KEY,
    billing_record_id BIGINT NOT NULL,
    invoice_id        BIGINT,                         -- denorm shortcut, nullable
    payment_txn_id    BIGINT,                         -- original transaction being refunded, nullable (manual refunds may not have one)

    amount            BIGINT NOT NULL,                -- smallest currency unit
    currency          VARCHAR(10) NOT NULL DEFAULT 'VND',

    status            VARCHAR(20) NOT NULL DEFAULT 'pending',
    reason            TEXT,
    refund_method     VARCHAR(50),                    -- bank_transfer | original_payment | credit | cash

    -- Gateway refund reference (nếu refund qua gateway)
    gateway_refund_id VARCHAR(255),
    gateway_response  JSONB,

    refunded_by       BIGINT,                         -- admin user id
    approved_by       BIGINT,
    approved_at       TIMESTAMP,
    refunded_at       TIMESTAMP,                      -- NULL until completed

    notes             TEXT,

    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refunds_billing_record FOREIGN KEY (billing_record_id) REFERENCES billing_records(id),
    CONSTRAINT fk_refunds_invoice        FOREIGN KEY (invoice_id)        REFERENCES invoices(id),
    CONSTRAINT fk_refunds_payment_txn    FOREIGN KEY (payment_txn_id)    REFERENCES payment_transactions(id),
    CONSTRAINT chk_refunds_amount        CHECK (amount > 0),
    CONSTRAINT chk_refunds_status        CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
    CONSTRAINT chk_refunds_method        CHECK (refund_method IS NULL OR refund_method IN ('bank_transfer', 'original_payment', 'credit', 'cash'))
);

CREATE INDEX IF NOT EXISTS idx_refunds_billing_record_id ON refunds(billing_record_id);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id        ON refunds(invoice_id)     WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refunds_payment_txn_id    ON refunds(payment_txn_id) WHERE payment_txn_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refunds_status            ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_refunded_at       ON refunds(refunded_at)    WHERE refunded_at IS NOT NULL;

COMMENT ON COLUMN refunds.payment_txn_id    IS 'Original payment_transactions.id being refunded; NULL for manual refunds without a gateway transaction';
COMMENT ON COLUMN refunds.gateway_refund_id IS 'Refund ID from gateway (Stripe refund_id, VNPay refund ref, etc.)';
COMMENT ON COLUMN refunds.refunded_at       IS 'NULL until status = completed';