

-- ============================================
-- PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
    id          BIGINT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP,
    CONSTRAINT uni_plans_code UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_plans_code       ON plans(code);
CREATE INDEX IF NOT EXISTS idx_plans_is_active  ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_sort_order ON plans(sort_order);
CREATE INDEX IF NOT EXISTS idx_plans_deleted_at ON plans(deleted_at);


-- ============================================
-- PLAN_INCLUDED_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS plan_included_items (
    id              BIGINT PRIMARY KEY,
    plan_id         BIGINT NOT NULL,
    service_item_id BIGINT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
    price_override  BIGINT,                          -- NULL = dùng giá từ item_prices
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_plan_included_items   UNIQUE (plan_id, service_item_id),
    CONSTRAINT fk_plan_item_plan        FOREIGN KEY (plan_id)         REFERENCES plans(id),
    CONSTRAINT fk_plan_item_service     FOREIGN KEY (service_item_id) REFERENCES service_items(id)
);

CREATE INDEX IF NOT EXISTS idx_plan_included_items_plan_id  ON plan_included_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_included_items_plan_sort ON plan_included_items(plan_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_plan_included_items_service   ON plan_included_items(service_item_id);

COMMENT ON TABLE  plan_included_items IS 'Static template: plan includes which service_items, quantity, and optional features';
COMMENT ON COLUMN plan_included_items.is_optional    IS 'TRUE = item can be deselected during registration';
COMMENT ON COLUMN plan_included_items.price_override IS 'Override price for this plan only; NULL = taken from item_prices per subscription billing_cycle';