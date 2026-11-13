-- ============================================
-- BILLING_RECORDS TABLE
-- ============================================
DROP TABLE IF EXISTS billing_line_items CASCADE;
DROP TABLE IF EXISTS billing_records CASCADE;

CREATE TABLE IF NOT EXISTS billing_records (
    id              BIGINT PRIMARY KEY,
    customer_id     BIGINT NOT NULL,
    subscription_id BIGINT,                       -- NULL = custom invoice without subscription
    type            VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    amount          BIGINT NOT NULL,              -- smallest currency unit
    currency        VARCHAR(10) NOT NULL DEFAULT 'VND',
    billing_date    TIMESTAMP NOT NULL,
    paid_at         TIMESTAMP,
    adjusted_by     BIGINT,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT fk_billing_records_customer     FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_billing_records_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    CONSTRAINT chk_billing_records_type   CHECK (type   IN ('invoice', 'credit', 'adjustment')),
    CONSTRAINT chk_billing_records_status CHECK (status IN ('pending', 'processing', 'paid', 'cancelled', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_billing_records_customer_id     ON billing_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_subscription_id ON billing_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_status          ON billing_records(status);
CREATE INDEX IF NOT EXISTS idx_billing_records_billing_date    ON billing_records(billing_date);
CREATE INDEX IF NOT EXISTS idx_billing_records_paid_at         ON billing_records(paid_at);
CREATE INDEX IF NOT EXISTS idx_billing_records_deleted_at      ON billing_records(deleted_at);
CREATE INDEX IF NOT EXISTS idx_billing_records_adjusted_by     ON billing_records(adjusted_by);

-- Composite: list billing per customer + status filter
CREATE INDEX IF NOT EXISTS idx_billing_records_customer_status ON billing_records(customer_id, status);

-- Composite: revenue report by date range
CREATE INDEX IF NOT EXISTS idx_billing_records_date_status ON billing_records(billing_date, status)
    WHERE status = 'paid';

COMMENT ON COLUMN billing_records.subscription_id IS 'NULL = custom invoice without subscription';


-- ============================================
-- BILLING_LINE_ITEMS TABLE
-- Immutable accounting snapshot — shared by invoices and quotes
-- ============================================
CREATE TABLE IF NOT EXISTS billing_line_items (
    id              BIGINT PRIMARY KEY,

    -- Polymorphic reference
    ref_type        VARCHAR(20) NOT NULL,         -- invoice | quote
    ref_id          BIGINT NOT NULL,

    -- Source
    source          VARCHAR(20) NOT NULL DEFAULT 'plan', -- plan | custom
    plan_id         BIGINT,                       -- NOT NULL if source = plan
    service_item_id BIGINT,                       -- NOT NULL if source = custom

    -- Snapshot at creation time
    category_id     BIGINT,
    item_name       VARCHAR(150) NOT NULL,
    category_name   VARCHAR(100) NOT NULL DEFAULT '',

    -- Pricing (smallest currency unit)
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      BIGINT NOT NULL,
    discount_bps    INT NOT NULL DEFAULT 0,       -- basis points: 1000 = 10%
    discount_amount BIGINT NOT NULL DEFAULT 0,    -- fixed discount
    total_price     BIGINT NOT NULL,              -- (unit_price × quantity) − discount_amount
    currency        VARCHAR(10) NOT NULL DEFAULT 'VND',

    notes           TEXT,
    sort_order      INT NOT NULL DEFAULT 0,

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bli_plan      FOREIGN KEY (plan_id)         REFERENCES plans(id),
    CONSTRAINT fk_bli_service   FOREIGN KEY (service_item_id) REFERENCES service_items(id),
    CONSTRAINT fk_bli_category  FOREIGN KEY (category_id)     REFERENCES service_categories(id),
    CONSTRAINT chk_bli_ref_type CHECK (ref_type IN ('invoice', 'quote')),
    CONSTRAINT chk_bli_source   CHECK (source   IN ('plan', 'custom')),
    CONSTRAINT chk_bli_source_fields CHECK (
        (source = 'plan'   AND plan_id IS NOT NULL AND service_item_id IS NULL) OR
        (source = 'custom' AND service_item_id IS NOT NULL AND plan_id IS NULL)
    ),
    CONSTRAINT chk_bli_quantity      CHECK (quantity > 0),
    CONSTRAINT chk_bli_unit_price    CHECK (unit_price >= 0),
    CONSTRAINT chk_bli_discount_bps  CHECK (discount_bps BETWEEN 0 AND 10000)
);

-- ref_sorted: primary read path — always ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_bli_ref_sorted  ON billing_line_items(ref_type, ref_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bli_plan_id     ON billing_line_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_bli_service     ON billing_line_items(service_item_id);
CREATE INDEX IF NOT EXISTS idx_bli_category    ON billing_line_items(category_id);

COMMENT ON TABLE  billing_line_items IS 'Immutable accounting snapshot shared between invoices and quotes';
COMMENT ON COLUMN billing_line_items.ref_type       IS 'invoice | quote';
COMMENT ON COLUMN billing_line_items.ref_id         IS 'FK to invoices.id or quotes.id';
COMMENT ON COLUMN billing_line_items.discount_bps   IS 'Basis points: 1000 = 10%, 10000 = 100%';
COMMENT ON COLUMN billing_line_items.total_price    IS '(unit_price × quantity) − discount_amount';
COMMENT ON COLUMN billing_line_items.category_name  IS 'Snapshot of category name at time of creation';