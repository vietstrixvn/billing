-- ============================================
-- SERVICE_CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_categories (
    id         BIGINT PRIMARY KEY,
    parent_id  BIGINT,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT uq_service_categories_code   UNIQUE (code),
    CONSTRAINT fk_service_categories_parent FOREIGN KEY (parent_id) REFERENCES service_categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_service_categories_parent_id  ON service_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_is_active  ON service_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_service_categories_deleted_at ON service_categories(deleted_at);
CREATE INDEX IF NOT EXISTS idx_service_categories_active_sort ON service_categories(sort_order)
    WHERE is_active = TRUE AND deleted_at IS NULL;


-- ============================================
-- SERVICE_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_items (
    id           BIGINT PRIMARY KEY,
    category_id  BIGINT NOT NULL,
    name         VARCHAR(150) NOT NULL,
    code         VARCHAR(50) NOT NULL,
    description  TEXT,
    item_type    VARCHAR(20) NOT NULL DEFAULT 'plan',    -- plan | addon | one_time | usage
    billing_type VARCHAR(20) NOT NULL DEFAULT 'recurring', -- recurring | one_time | metered
    unit_label   VARCHAR(50),                            -- "seat", "GB", "API call"
    is_taxable   BOOLEAN NOT NULL DEFAULT FALSE,
    tax_code     VARCHAR(50),
    metadata     JSONB,
    sort_order   INT NOT NULL DEFAULT 0,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at   TIMESTAMP,

    CONSTRAINT uq_service_items_code         UNIQUE (code),
    CONSTRAINT fk_service_items_category     FOREIGN KEY (category_id) REFERENCES service_categories(id),
    CONSTRAINT chk_service_items_item_type   CHECK (item_type   IN ('plan', 'addon', 'one_time', 'usage')),
    CONSTRAINT chk_service_items_billing_type CHECK (billing_type IN ('recurring', 'one_time', 'metered'))
);

CREATE INDEX IF NOT EXISTS idx_service_items_deleted_at    ON service_items(deleted_at);
CREATE INDEX IF NOT EXISTS idx_service_items_category_sort ON service_items(category_id, sort_order)
    WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_items_item_type     ON service_items(item_type)
    WHERE is_active = TRUE AND deleted_at IS NULL;


-- ============================================
-- ITEM_PRICES TABLE
-- ============================================
-- billing_cycle enum: monthly | quarterly | semi-annually | annual | biennial | triennial | quinquennial | one_time
CREATE TABLE IF NOT EXISTS item_prices (
    id                BIGINT PRIMARY KEY,
    item_id           BIGINT NOT NULL,
    name              VARCHAR(100) NOT NULL,          -- e.g. "Monthly VND", "Annual USD"
    currency          CHAR(3) NOT NULL DEFAULT 'VND',
    billing_cycle     VARCHAR(20) NOT NULL,
    pricing_model     VARCHAR(20) NOT NULL DEFAULT 'flat',
    unit_amount       BIGINT NOT NULL DEFAULT 0,      -- smallest currency unit
    flat_amount       BIGINT NOT NULL DEFAULT 0,      -- fixed fee on top of per_unit
    trial_period_days INT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from        DATE,
    valid_until       DATE,                           -- NULL = indefinitely valid
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_prices_item            FOREIGN KEY (item_id) REFERENCES service_items(id) ON DELETE CASCADE,
    CONSTRAINT chk_item_prices_billing_cycle  CHECK (billing_cycle  IN ('monthly', 'quarterly', 'semi-annually', 'annual', 'biennial', 'triennial', 'quinquennial', 'one_time')),
    CONSTRAINT chk_item_prices_pricing_model  CHECK (pricing_model  IN ('flat', 'per_unit', 'tiered', 'volume', 'stairstep')),
    CONSTRAINT chk_item_prices_unit_amount    CHECK (unit_amount >= 0),
    CONSTRAINT chk_item_prices_flat_amount    CHECK (flat_amount >= 0),
    CONSTRAINT chk_item_prices_valid_range    CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_from <= valid_until)
);

CREATE INDEX IF NOT EXISTS idx_item_prices_item_id        ON item_prices(item_id);
CREATE INDEX IF NOT EXISTS idx_item_prices_currency       ON item_prices(currency);
CREATE INDEX IF NOT EXISTS idx_item_prices_billing_cycle  ON item_prices(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_item_prices_is_active      ON item_prices(is_active);
CREATE INDEX IF NOT EXISTS idx_item_prices_valid_range    ON item_prices(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_item_prices_lookup         ON item_prices(item_id, currency, billing_cycle)
    WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_item_prices_valid          ON item_prices(item_id, valid_from, valid_until)
    WHERE is_active = TRUE;

-- One active price per item/currency/billing_cycle
CREATE UNIQUE INDEX IF NOT EXISTS uq_item_prices_item_currency_cycle
    ON item_prices(item_id, currency, billing_cycle)
    WHERE is_active = TRUE;

COMMENT ON TABLE  item_prices IS '1 service_item can have multiple prices (different currencies, billing_cycles)';
COMMENT ON COLUMN item_prices.unit_amount       IS 'Unit price in smallest currency unit (VND dong, USD cents)';
COMMENT ON COLUMN item_prices.flat_amount       IS 'Fixed fee added when pricing_model = per_unit';
COMMENT ON COLUMN item_prices.valid_until       IS 'NULL = price valid indefinitely (grandfathering)';
COMMENT ON COLUMN item_prices.trial_period_days IS 'Number of trial days applicable to this price';


-- ============================================
-- PRICE_TIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS price_tiers (
    id          BIGINT PRIMARY KEY,
    price_id    BIGINT NOT NULL,
    tier_order  INT NOT NULL,
    from_unit   INT NOT NULL,
    to_unit     INT,                              -- NULL = unlimited
    unit_amount BIGINT NOT NULL DEFAULT 0,
    flat_amount BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_price_tiers_price    FOREIGN KEY (price_id) REFERENCES item_prices(id) ON DELETE CASCADE,
    CONSTRAINT uq_price_tiers_order    UNIQUE (price_id, tier_order),
    CONSTRAINT chk_price_tiers_from    CHECK (from_unit >= 0),
    CONSTRAINT chk_price_tiers_range   CHECK (to_unit IS NULL OR to_unit > from_unit),
    CONSTRAINT chk_price_tiers_amounts CHECK (unit_amount >= 0 AND flat_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_price_tiers_price_id    ON price_tiers(price_id);
CREATE INDEX IF NOT EXISTS idx_price_tiers_lookup      ON price_tiers(price_id, from_unit);
CREATE INDEX IF NOT EXISTS idx_price_tiers_price_order ON price_tiers(price_id, tier_order);

COMMENT ON TABLE  price_tiers IS 'Price tiers for pricing_model: tiered, volume, stairstep';
COMMENT ON COLUMN price_tiers.from_unit   IS 'From which unit (inclusive), e.g. 1, 11, 51';
COMMENT ON COLUMN price_tiers.to_unit     IS 'To which unit (inclusive), NULL = unlimited';
COMMENT ON COLUMN price_tiers.unit_amount IS 'Price per unit in tier (tiered/volume)';
COMMENT ON COLUMN price_tiers.flat_amount IS 'Fixed fee for entire tier (stairstep)';
