-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
DROP TABLE IF EXISTS subscription_addons CASCADE;
DROP TABLE IF EXISTS subscription_logs CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- billing_cycle enum: monthly | quarterly | semi-annually | annual | biennial | triennial | quinquennial
CREATE TABLE IF NOT EXISTS subscriptions (
    id              BIGINT PRIMARY KEY,
    customer_id     BIGINT NOT NULL,
    plan_id         BIGINT NOT NULL,
    plan_code       VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'trial',
    started_at      TIMESTAMP NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    trial_ends_at   TIMESTAMP,

    -- billing
    billing_cycle   VARCHAR(20) NOT NULL DEFAULT 'monthly',
    billing_amount  BIGINT NOT NULL DEFAULT 0,    -- actual paid amount (after discount), smallest unit
    currency        VARCHAR(10) NOT NULL DEFAULT 'VND',
    next_billing_at TIMESTAMP,

    -- auto-renewal
    auto_renew      BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at    TIMESTAMP,

    -- discount
    discount_code   VARCHAR(50),
    discount_amount BIGINT DEFAULT 0,
    original_price  BIGINT DEFAULT 0,

    override_by     BIGINT,
    created_by      BIGINT,
    created_by_type VARCHAR(20) NOT NULL DEFAULT 'admin',
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT fk_subscriptions_customer         FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_subscriptions_plan             FOREIGN KEY (plan_id) REFERENCES plans(id),
    CONSTRAINT chk_subscriptions_status          CHECK (status          IN ('trial', 'active', 'expired', 'suspended', 'cancelled')),
    CONSTRAINT chk_subscriptions_billing_cycle   CHECK (billing_cycle   IN ('monthly', 'quarterly', 'semi-annually', 'annual', 'biennial', 'triennial', 'quinquennial', 'one_time')),
    CONSTRAINT chk_subscriptions_created_by_type CHECK (created_by_type IN ('admin', 'customer', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id     ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id         ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status          ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at      ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_at ON subscriptions(next_billing_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_auto_renew      ON subscriptions(auto_renew);
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancelled_at    ON subscriptions(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at      ON subscriptions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_override_by     ON subscriptions(override_by);

-- Composite: dashboard — active subscriptions per customer
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_status ON subscriptions(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_sub_customer_status_active    ON subscriptions(customer_id, status)
    WHERE deleted_at IS NULL;

-- Composite: renewal job — chỉ quét active/trial
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_status ON subscriptions(expires_at, status)
    WHERE status IN ('trial', 'active');

-- Composite: trial expiry job
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_status ON subscriptions(trial_ends_at, status)
    WHERE status = 'trial' AND trial_ends_at IS NOT NULL;

-- One active/trial subscription per customer
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_customer_active
    ON subscriptions(customer_id)
    WHERE status IN ('trial', 'active') AND deleted_at IS NULL;

COMMENT ON COLUMN subscriptions.billing_cycle   IS 'monthly | quarterly | semi-annually | annual | biennial | triennial | quinquennial';
COMMENT ON COLUMN subscriptions.billing_amount  IS 'Actual amount paid (after discounts) in smallest currency unit';
COMMENT ON COLUMN subscriptions.original_price  IS 'Original price before discount in smallest currency unit';
COMMENT ON COLUMN subscriptions.auto_renew      IS 'Whether subscription auto-renews on expiry';
COMMENT ON COLUMN subscriptions.next_billing_at IS 'Next billing date for auto-renewal';
COMMENT ON COLUMN subscriptions.discount_code   IS 'Display-only snapshot of the coupon code string at time of subscription. Not a FK — do NOT use for JOIN or validation. Use coupon_redemptions WHERE subscription_id = subscriptions.id to trace full coupon details.';


-- ============================================
-- SUBSCRIPTION_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_logs (
    id              BIGINT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,

    old_status      VARCHAR(20),                  -- NULL = first creation
    new_status      VARCHAR(20) NOT NULL,

    changed_by      BIGINT,
    changed_by_type VARCHAR(20) NOT NULL DEFAULT 'system',
    reason          TEXT,

    changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    old_expires_at  TIMESTAMP,
    new_expires_at  TIMESTAMP,

    plan_code       VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subscription_logs_subscription
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    CONSTRAINT fk_subscription_logs_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id),

    CONSTRAINT chk_subscription_logs_changed_by_type CHECK (
        changed_by_type IN ('system', 'admin', 'user')
    ),

    CONSTRAINT chk_subscription_logs_old_status CHECK (
        old_status IS NULL OR old_status IN (
            'trial',
            'active',
            'expired',
            'suspended',
            'cancelled'
        )
    ),

    CONSTRAINT chk_subscription_logs_new_status CHECK (
        new_status IN (
            'trial',
            'active',
            'expired',
            'suspended',
            'cancelled'
        )
    )
);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_subscription_id ON subscription_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_customer_id     ON subscription_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_changed_at      ON subscription_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_changed_by      ON subscription_logs(changed_by)
    WHERE changed_by IS NOT NULL;

-- Composite: lịch sử của 1 customer theo thời gian
CREATE INDEX IF NOT EXISTS idx_subscription_logs_customer_time ON subscription_logs(customer_id, changed_at DESC);

-- Composite: audit trail theo loại actor
CREATE INDEX IF NOT EXISTS idx_subscription_logs_actor_time ON subscription_logs(changed_by_type, changed_at DESC);


-- ============================================
-- SUBSCRIPTION_ADDONS TABLE
-- Runtime snapshot — source of truth for renewal
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_addons (
    id              BIGINT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    addon_id        BIGINT NOT NULL,
    price_id        BIGINT NOT NULL,              -- catalog reference at time of purchase
    quantity        INT NOT NULL DEFAULT 1,

    -- Snapshot tại thời điểm subscribe / reprice
    -- Renewal đọc từ đây, KHÔNG đọc lại catalog
    currency_snapshot      CHAR(3) NOT NULL,
    billing_cycle_snapshot VARCHAR(20) NOT NULL,
    pricing_model_snapshot VARCHAR(20) NOT NULL,
    unit_price_snapshot    BIGINT NOT NULL,
    tier_snapshot          JSONB,                 -- NULL nếu pricing_model = flat/per_unit
                                                  -- Format: [{"tier_order":1,"from_unit":1,"to_unit":10,"unit_amount":1000,"flat_amount":0}]

    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at   TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sa_subscription   FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sa_addon          FOREIGN KEY (addon_id)         REFERENCES addons(id),
    CONSTRAINT fk_sa_price          FOREIGN KEY (price_id)         REFERENCES addon_prices(id),
    CONSTRAINT chk_sa_quantity      CHECK (quantity >= 0),
    CONSTRAINT chk_sa_billing_cycle CHECK (billing_cycle_snapshot IN ('monthly', 'quarterly', 'semi-annually', 'annual', 'biennial', 'triennial', 'quinquennial', 'one_time')),
    CONSTRAINT chk_sa_pricing_model CHECK (pricing_model_snapshot IN ('flat', 'per_unit', 'tiered'))
);

CREATE INDEX IF NOT EXISTS idx_sa_subscription_id ON subscription_addons(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sa_addon_id         ON subscription_addons(addon_id);
CREATE INDEX IF NOT EXISTS idx_sa_ended_at         ON subscription_addons(ended_at);

-- Active addons — most common query
CREATE INDEX IF NOT EXISTS idx_sa_active
    ON subscription_addons(subscription_id)
    WHERE ended_at IS NULL;

-- One active entry per subscription+addon
CREATE UNIQUE INDEX IF NOT EXISTS uq_sa_active
    ON subscription_addons(subscription_id, addon_id)
    WHERE ended_at IS NULL;

COMMENT ON COLUMN subscription_addons.price_id               IS 'Catalog reference at time of purchase';
COMMENT ON COLUMN subscription_addons.quantity               IS 'Number of units currently active';
COMMENT ON COLUMN subscription_addons.tier_snapshot          IS 'Snapshot of price_tiers at subscribe time. NULL if pricing_model = flat/per_unit';
COMMENT ON COLUMN subscription_addons.pricing_model_snapshot IS 'Snapshot of addon_prices.pricing_model. Only flat | per_unit | tiered — volume/stairstep belong to item_prices (plan), not addons.';
