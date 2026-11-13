-- ============================================
-- ADDONS TABLE
-- Master definition of recurring/service capability
-- NOT subscription runtime state
-- ============================================
CREATE TABLE IF NOT EXISTS addons (
    id          BIGINT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(200) NOT NULL,
    description TEXT,
    addon_type  VARCHAR(20) NOT NULL DEFAULT 'fixed', -- fixed | quantity | metered
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_addons_slug      UNIQUE (slug),
    CONSTRAINT chk_addons_addon_type CHECK (addon_type IN ('fixed', 'quantity', 'metered'))
);

CREATE INDEX IF NOT EXISTS idx_addons_addon_type ON addons(addon_type);
CREATE INDEX IF NOT EXISTS idx_addons_is_active  ON addons(is_active);

COMMENT ON TABLE  addons IS 'Master catalog of billable service capabilities/features';
COMMENT ON COLUMN addons.addon_type IS 'fixed = on/off feature; quantity = billed by quantity; metered = usage-based';


-- ============================================
-- ADDON_PRICES TABLE
-- ============================================
-- billing_cycle enum: monthly | quarterly | semi-annually | annual | biennial | triennial | quinquennial | one_time
CREATE TABLE IF NOT EXISTS addon_prices (
    id               BIGINT PRIMARY KEY,
    addon_id         BIGINT NOT NULL,
    currency         CHAR(3) NOT NULL DEFAULT 'VND',
    billing_cycle    VARCHAR(20) NOT NULL,
    pricing_model    VARCHAR(20) NOT NULL DEFAULT 'flat',
    unit_amount      BIGINT NOT NULL DEFAULT 0,
    min_quantity     INT,
    max_quantity     INT,
    default_quantity INT NOT NULL DEFAULT 1,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from       DATE,
    valid_until      DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_addon_prices_addon          FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE CASCADE,
    CONSTRAINT chk_addon_prices_billing_cycle CHECK (billing_cycle  IN ('monthly', 'quarterly', 'semi-annually', 'annual', 'biennial', 'triennial', 'quinquennial', 'one_time')),
    CONSTRAINT chk_addon_prices_pricing_model CHECK (pricing_model  IN ('flat', 'per_unit', 'tiered')),
    CONSTRAINT chk_addon_prices_unit_amount   CHECK (unit_amount >= 0),
    CONSTRAINT chk_addon_prices_qty_range     CHECK (min_quantity IS NULL OR max_quantity IS NULL OR min_quantity <= max_quantity)
);

CREATE INDEX IF NOT EXISTS idx_addon_prices_addon_id      ON addon_prices(addon_id);
CREATE INDEX IF NOT EXISTS idx_addon_prices_billing_cycle ON addon_prices(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_addon_prices_is_active     ON addon_prices(is_active);
CREATE INDEX IF NOT EXISTS idx_addon_prices_valid_range   ON addon_prices(valid_from, valid_until);

COMMENT ON COLUMN addon_prices.unit_amount      IS 'Unit price in smallest currency unit';
COMMENT ON COLUMN addon_prices.min_quantity     IS 'Minimum required quantity';
COMMENT ON COLUMN addon_prices.max_quantity     IS 'Maximum limit, NULL = unlimited';
COMMENT ON COLUMN addon_prices.default_quantity IS 'Default quantity when added to subscription';