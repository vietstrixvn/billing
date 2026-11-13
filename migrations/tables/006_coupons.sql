-- ============================================
-- COUPONS TABLE
-- Master coupon definition (không phải code)
-- ============================================
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS coupon_redemptions CASCADE;
DROP TABLE IF EXISTS coupon_codes CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

CREATE TABLE IF NOT EXISTS coupons (
    id               BIGINT PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,

    -- Discount config
    discount_type    VARCHAR(20) NOT NULL,             -- percentage | fixed_amount | free_trial
    discount_value   BIGINT NOT NULL,                  -- percentage → basis points (1000=10%); fixed_amount → smallest unit
    currency         CHAR(3),                          -- NULL nếu discount_type = percentage

    -- Duration
    duration         VARCHAR(20) NOT NULL DEFAULT 'once', -- once | repeating | forever
    duration_months  INT,                              -- set when duration = repeating

    -- Redemption limits
    max_redemptions  INT,                              -- NULL = unlimited
    redemption_count INT NOT NULL DEFAULT 0,           -- updated via trigger or app

    -- Scope
    applies_to       VARCHAR(20) NOT NULL DEFAULT 'all', -- all | specific_plans | specific_items
    min_amount       BIGINT,                           -- minimum order value, NULL = no floor

    -- Validity
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from       TIMESTAMPTZ,
    valid_until      TIMESTAMPTZ,                      -- NULL = forever

    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMPTZ,

    CONSTRAINT chk_coupons_discount_type    CHECK (discount_type  IN ('percentage', 'fixed_amount', 'free_trial')),
    CONSTRAINT chk_coupons_duration         CHECK (duration        IN ('once', 'repeating', 'forever')),
    CONSTRAINT chk_coupons_applies_to       CHECK (applies_to      IN ('all', 'specific_plans', 'specific_items')),
    CONSTRAINT chk_coupons_discount_value   CHECK (discount_value > 0),
    CONSTRAINT chk_coupons_pct_cap          CHECK (discount_type != 'percentage' OR discount_value <= 10000),
    CONSTRAINT chk_coupons_duration_months  CHECK (duration != 'repeating' OR duration_months IS NOT NULL),
    CONSTRAINT chk_coupons_currency         CHECK (discount_type = 'percentage' OR currency IS NOT NULL),
    CONSTRAINT chk_coupons_valid_range      CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_from <= valid_until)
);

CREATE INDEX IF NOT EXISTS idx_coupons_discount_type ON coupons(discount_type);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active     ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_range   ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_deleted_at    ON coupons(deleted_at);

COMMENT ON COLUMN coupons.discount_value  IS 'percentage → basis points (1000=10%); fixed_amount → smallest currency unit';
COMMENT ON COLUMN coupons.duration_months IS 'Required when duration = repeating; number of billing cycles the discount applies';
COMMENT ON COLUMN coupons.redemption_count IS 'Running total across all coupon_codes under this coupon';
COMMENT ON COLUMN coupons.min_amount      IS 'Minimum order sub_total to allow redemption (smallest currency unit)';


-- ============================================
-- COUPON_CODES TABLE
-- Each coupon can have one or many redeemable codes.
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_codes (
    id               BIGINT PRIMARY KEY,
    coupon_id        BIGINT NOT NULL,
    code             VARCHAR(50) NOT NULL,             -- customer-entered string, globally unique
    max_redemptions  INT,                              -- NULL = inherit from parent coupon
    redemption_count INT NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMPTZ,

    CONSTRAINT uq_coupon_codes_code     UNIQUE (code),
    CONSTRAINT fk_coupon_codes_coupon   FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    CONSTRAINT chk_coupon_codes_redemption CHECK (redemption_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_coupon_codes_coupon_id ON coupon_codes(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code      ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_is_active ON coupon_codes(is_active);

COMMENT ON COLUMN coupon_codes.max_redemptions IS 'NULL = use parent coupon max_redemptions; set to override per-code';
COMMENT ON COLUMN coupon_codes.code            IS 'Customer-facing code string, globally unique';


-- ============================================
-- COUPON_REDEMPTIONS TABLE
-- One row per use: tracks who used which code when.
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id              BIGINT PRIMARY KEY,
    coupon_id       BIGINT NOT NULL,
    code_id         BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    subscription_id BIGINT,                           -- NULL nếu redemption chưa gắn sub (quote stage)
    billing_record_id BIGINT,                         -- NULL nếu chưa thanh toán

    discount_amount BIGINT NOT NULL,                  -- actual discount applied (smallest unit)
    currency        CHAR(3) NOT NULL DEFAULT 'VND',

    redeemed_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMPTZ,                      -- NULL = once, hoặc tính từ duration_months

    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cr_coupon         FOREIGN KEY (coupon_id)         REFERENCES coupons(id),
    CONSTRAINT fk_cr_code           FOREIGN KEY (code_id)           REFERENCES coupon_codes(id),
    CONSTRAINT fk_cr_customer       FOREIGN KEY (customer_id)       REFERENCES customers(id),
    CONSTRAINT fk_cr_subscription   FOREIGN KEY (subscription_id)   REFERENCES subscriptions(id),
    CONSTRAINT fk_cr_billing_record FOREIGN KEY (billing_record_id) REFERENCES billing_records(id),
    CONSTRAINT chk_cr_discount_amount CHECK (discount_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_cr_coupon_id         ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_cr_code_id           ON coupon_redemptions(code_id);
CREATE INDEX IF NOT EXISTS idx_cr_customer_id       ON coupon_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_cr_subscription_id   ON coupon_redemptions(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cr_billing_record_id ON coupon_redemptions(billing_record_id) WHERE billing_record_id IS NOT NULL;

-- Composite: kiểm tra xem customer đã dùng coupon này chưa (duration=once)
CREATE INDEX IF NOT EXISTS idx_cr_customer_coupon ON coupon_redemptions(customer_id, coupon_id);

COMMENT ON COLUMN coupon_redemptions.discount_amount IS 'Actual discount applied at time of redemption (smallest currency unit)';
COMMENT ON COLUMN coupon_redemptions.expires_at      IS 'NULL = one-time use; set when duration = repeating/forever to track active discount window';


-- ============================================
-- NOTIFICATION_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id            BIGINT PRIMARY KEY,
    customer_id   BIGINT NOT NULL,

    type          VARCHAR(50) NOT NULL,   -- invoice_sent | expiry_reminder | payment_received | quote_sent | refund_processed
    channel       VARCHAR(20) NOT NULL,   -- email | sms | manual | webhook

    recipient     VARCHAR(255) NOT NULL,

    -- Polymorphic ref
    ref_type      VARCHAR(50),            -- invoice | subscription | billing_record | quote | refund
    ref_id        BIGINT,

    status        VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at       TIMESTAMP,              -- NULL = draft (not sent yet)
    sent_by       BIGINT,                 -- NULL = auto
    error_message TEXT,

    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_nl_customer FOREIGN KEY (customer_id) REFERENCES customers(id),

    CONSTRAINT chk_nl_status CHECK (
        status IN ('draft', 'sent', 'failed', 'bounced')
    ),

    CONSTRAINT chk_nl_channel CHECK (
        channel IN ('email', 'sms', 'manual', 'webhook')
    ),

    CONSTRAINT chk_nl_type CHECK (
        type IN (
            'invoice_sent',
            'expiry_reminder',
            'payment_received',
            'quote_sent',
            'refund_processed'
        )
    ),

    CONSTRAINT chk_nl_ref_type CHECK (
        ref_type IS NULL OR ref_type IN (
            'invoice',
            'subscription',
            'billing_record',
            'quote',
            'refund'
        )
    ),

    CONSTRAINT chk_nl_ref_consistency CHECK (
        (ref_type IS NULL AND ref_id IS NULL)
        OR
        (ref_type IS NOT NULL AND ref_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_nl_customer_id
    ON notification_logs(customer_id);

CREATE INDEX IF NOT EXISTS idx_nl_type
    ON notification_logs(type);

CREATE INDEX IF NOT EXISTS idx_nl_status
    ON notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_nl_ref
    ON notification_logs(ref_type, ref_id)
    WHERE ref_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nl_sent_at
    ON notification_logs(sent_at);

COMMENT ON COLUMN notification_logs.sent_at
    IS 'NULL = not yet sent (draft); set when auto-sent or admin clicks Send';

COMMENT ON COLUMN notification_logs.sent_by
    IS 'Admin user ID if sent manually; NULL if auto';

COMMENT ON COLUMN notification_logs.channel
    IS 'email | sms | manual (sent outside system) | webhook';