-- ============================================================================
-- Migration: Fix Statistics to Exclude Cancelled Records
-- Description: Update statistics queries to properly handle cancelled 
--              subscriptions and billing records with Customers table
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_billing_dashboard_stats CASCADE;
DROP VIEW IF EXISTS v_paid_billing_records CASCADE;
DROP VIEW IF EXISTS v_valid_billing_records CASCADE;
DROP VIEW IF EXISTS v_active_subscriptions CASCADE;

-- ============================================================================
-- PART 1: Create helper views for clean statistics
-- ============================================================================

-- View: Active subscriptions only (exclude cancelled)
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT 
    s.*,
    c.full_name as customer_name,
    c.email as customer_email,
    c.phone_number as customer_phone,
    c.tax_code as customer_tax_code,
    c.address as customer_address,
    pl.name as plan_name
FROM subscriptions s
LEFT JOIN customers c ON s.customer_id = c.id
LEFT JOIN plans pl ON s.plan_id = pl.id
WHERE s.deleted_at IS NULL
  AND s.status IN ('active', 'trial', 'expired')  -- Exclude 'cancelled'
;

COMMENT ON VIEW v_active_subscriptions IS 
'Active subscriptions only - excludes cancelled subscriptions for accurate statistics';

-- View: Valid billing records (exclude cancelled)
CREATE OR REPLACE VIEW v_valid_billing_records AS
SELECT 
    br.*,
    s.plan_id,
    s.status as subscription_status
FROM billing_records br
LEFT JOIN subscriptions s ON br.subscription_id = s.id
WHERE br.deleted_at IS NULL
  AND br.status != 'cancelled'  -- Exclude cancelled records
;

COMMENT ON VIEW v_valid_billing_records IS 
'Valid billing records only - excludes cancelled records for accurate revenue statistics';

-- View: Paid billing records for revenue calculation
CREATE OR REPLACE VIEW v_paid_billing_records AS
SELECT 
    br.*,
    s.plan_id,
    s.plan_code,
    s.billing_cycle
FROM billing_records br
INNER JOIN subscriptions s ON br.subscription_id = s.id
WHERE br.deleted_at IS NULL
  AND br.status = 'paid'
  AND s.deleted_at IS NULL
;

COMMENT ON VIEW v_paid_billing_records IS 
'Paid billing records with subscription details for revenue analytics';

-- ============================================================================
-- PART 2: Create statistics functions
-- ============================================================================

-- Function: Get revenue statistics excluding cancelled records
CREATE OR REPLACE FUNCTION get_revenue_stats(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS TABLE (
    total_revenue BIGINT,
    paid_invoice_count BIGINT,
    avg_revenue_per_customer NUMERIC,
    unique_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(br.amount), 0)::BIGINT as total_revenue,
        COUNT(*)::BIGINT as paid_invoice_count,
        COALESCE(
            SUM(br.amount)::NUMERIC / NULLIF(COUNT(DISTINCT br.customer_id), 0),
            0
        ) as avg_revenue_per_customer,
        COUNT(DISTINCT br.customer_id)::BIGINT as unique_customers
    FROM v_paid_billing_records br
    WHERE br.billing_date >= p_start_date
      AND br.billing_date < p_end_date;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_revenue_stats IS 
'Calculate revenue statistics excluding cancelled billing records';

-- Function: Get subscription statistics by status (exclude cancelled from active counts)
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
    status VARCHAR(20),
    count BIGINT,
    percentage NUMERIC
) AS $$
DECLARE
    total_active BIGINT;
BEGIN
    -- Get total active subscriptions (exclude cancelled)
    SELECT COUNT(*) INTO total_active
    FROM subscriptions
    WHERE deleted_at IS NULL
      AND status IN ('active', 'trial', 'expired');
    
    RETURN QUERY
    SELECT 
        s.status::VARCHAR(20),
        COUNT(*)::BIGINT as count,
        CASE 
            WHEN total_active > 0 THEN 
                ROUND((COUNT(*)::NUMERIC / total_active * 100), 2)
            ELSE 0
        END as percentage
    FROM subscriptions s
    WHERE s.deleted_at IS NULL
      AND s.status IN ('active', 'trial', 'expired')
    GROUP BY s.status
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_subscription_stats IS 
'Get subscription statistics excluding cancelled subscriptions';

-- Function: Get plan performance (exclude cancelled subscriptions)
CREATE OR REPLACE FUNCTION get_plan_performance()
RETURNS TABLE (
    plan_id BIGINT,
    plan_name VARCHAR(100),
    plan_code VARCHAR(50),
    active_subscriptions BIGINT,
    total_revenue BIGINT,
    avg_revenue_per_sub NUMERIC,
    churn_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as plan_id,
        p.name as plan_name,
        p.code as plan_code,
        COUNT(DISTINCT s.id)::BIGINT as active_subscriptions,
        COALESCE(SUM(br.amount), 0)::BIGINT as total_revenue,
        COALESCE(
            SUM(br.amount)::NUMERIC / NULLIF(COUNT(DISTINCT s.id), 0),
            0
        ) as avg_revenue_per_sub,
        (
            SELECT COUNT(*)::BIGINT
            FROM subscriptions s2
            WHERE s2.plan_id = p.id
              AND s2.status = 'cancelled'
              AND s2.cancelled_at >= NOW() - INTERVAL '30 days'
        ) as churn_count
    FROM plans p
    LEFT JOIN subscriptions s ON p.id = s.plan_id 
        AND s.deleted_at IS NULL
        AND s.status IN ('active', 'trial')
    LEFT JOIN billing_records br ON s.id = br.subscription_id
        AND br.status = 'paid'
        AND br.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
      AND p.is_active = true
    GROUP BY p.id, p.name, p.code
    ORDER BY active_subscriptions DESC, total_revenue DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_plan_performance IS 
'Get plan performance metrics excluding cancelled subscriptions from active counts';

-- Function: Get expiring subscriptions (exclude already cancelled)
CREATE OR REPLACE FUNCTION get_expiring_subscriptions(
    p_days INT,
    p_limit INT DEFAULT 100,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    subscription_id BIGINT,
    customer_id BIGINT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    plan_name VARCHAR(100),
    billing_cycle VARCHAR(20),
    billing_amount BIGINT,
    expires_at TIMESTAMP,
    days_until_expiry INT,
    auto_renew BOOLEAN,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as subscription_id,
        s.customer_id,
        c.full_name as customer_name,
        c.email as customer_email,
        pl.name as plan_name,
        s.billing_cycle::VARCHAR(20),
        s.billing_amount,
        s.expires_at,
        EXTRACT(DAY FROM (s.expires_at - NOW()))::INT as days_until_expiry,
        s.auto_renew,
        s.status::VARCHAR(20)
    FROM subscriptions s
    INNER JOIN customers c ON s.customer_id = c.id
    INNER JOIN plans pl ON s.plan_id = pl.id
    WHERE s.deleted_at IS NULL
      AND s.status IN ('active', 'trial')  -- Exclude cancelled
      AND s.expires_at BETWEEN NOW() AND NOW() + (p_days || ' days')::INTERVAL
    ORDER BY s.expires_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_expiring_subscriptions IS 
'Get expiring subscriptions excluding cancelled ones';

-- Function: Calculate revenue at risk (exclude cancelled)
CREATE OR REPLACE FUNCTION get_revenue_at_risk(p_days INT)
RETURNS BIGINT AS $$
DECLARE
    revenue_at_risk BIGINT;
BEGIN
    SELECT COALESCE(SUM(s.billing_amount), 0)
    INTO revenue_at_risk
    FROM subscriptions s
    WHERE s.deleted_at IS NULL
      AND s.status IN ('active', 'trial')  -- Exclude cancelled
      AND s.auto_renew = false
      AND s.expires_at BETWEEN NOW() AND NOW() + (p_days || ' days')::INTERVAL;
    
    RETURN revenue_at_risk;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_revenue_at_risk IS 
'Calculate revenue at risk from expiring non-auto-renew subscriptions (excludes cancelled)';

-- Function: Get top customers by revenue (exclude cancelled billing records)
CREATE OR REPLACE FUNCTION get_top_customers(
    p_limit INT DEFAULT 10,
    p_period VARCHAR(20) DEFAULT 'all'
)
RETURNS TABLE (
    customer_id BIGINT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total_revenue BIGINT,
    invoice_count BIGINT,
    avg_invoice_amount NUMERIC,
    active_subscription_count BIGINT,
    last_payment_date TIMESTAMP
) AS $$
DECLARE
    start_date TIMESTAMP;
BEGIN
    -- Determine start date based on period
    CASE p_period
        WHEN 'month' THEN start_date := NOW() - INTERVAL '1 month';
        WHEN 'quarter' THEN start_date := NOW() - INTERVAL '3 months';
        WHEN 'year' THEN start_date := NOW() - INTERVAL '1 year';
        ELSE start_date := '1970-01-01'::TIMESTAMP;
    END CASE;
    
    RETURN QUERY
    SELECT 
        c.id as customer_id,
        c.full_name as customer_name,
        c.email as customer_email,
        COALESCE(SUM(br.amount), 0)::BIGINT as total_revenue,
        COUNT(br.id)::BIGINT as invoice_count,
        COALESCE(AVG(br.amount), 0) as avg_invoice_amount,
        (
            SELECT COUNT(*)::BIGINT
            FROM subscriptions s
            WHERE s.customer_id = c.id
              AND s.deleted_at IS NULL
              AND s.status IN ('active', 'trial')
        ) as active_subscription_count,
        MAX(br.billing_date) as last_payment_date
    FROM customers c
    LEFT JOIN billing_records br ON c.id = br.customer_id
        AND br.status = 'paid'
        AND br.deleted_at IS NULL
        AND br.billing_date >= start_date
    WHERE c.deleted_at IS NULL
    GROUP BY c.id, c.full_name, c.email
    HAVING COALESCE(SUM(br.amount), 0) > 0
    ORDER BY total_revenue DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_top_customers IS 
'Get top customers by revenue excluding cancelled billing records';

-- ============================================================================
-- PART 3: Create indexes for better performance
-- ============================================================================

-- Index for filtering cancelled billing records
CREATE INDEX IF NOT EXISTS idx_billing_records_status_not_cancelled 
ON billing_records(status, billing_date) 
WHERE status != 'cancelled' AND deleted_at IS NULL;

COMMENT ON INDEX idx_billing_records_status_not_cancelled IS 
'Partial index for non-cancelled billing records to speed up statistics queries';

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_active_status 
ON subscriptions(status, expires_at) 
WHERE status IN ('active', 'trial', 'expired') AND deleted_at IS NULL;

COMMENT ON INDEX idx_subscriptions_active_status IS 
'Partial index for active subscriptions to speed up statistics queries';

-- Index for subscription cancellation tracking
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancelled_at 
ON subscriptions(cancelled_at, customer_id) 
WHERE cancelled_at IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX idx_subscriptions_cancelled_at IS 
'Index for tracking subscription cancellations for churn analysis';

-- Composite index for revenue queries
CREATE INDEX IF NOT EXISTS idx_billing_records_paid_date_customer 
ON billing_records(status, billing_date, customer_id) 
WHERE status = 'paid' AND deleted_at IS NULL;

COMMENT ON INDEX idx_billing_records_paid_date_customer IS 
'Composite index for revenue queries by customer and date';

-- ============================================================================
-- PART 4: Create materialized view for dashboard (optional, for performance)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_billing_dashboard_stats AS
SELECT 
    -- Revenue metrics
    (SELECT COALESCE(SUM(amount), 0) FROM v_paid_billing_records 
     WHERE billing_date >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30_days,
    
    (SELECT COALESCE(SUM(amount), 0) FROM v_paid_billing_records 
     WHERE billing_date >= CURRENT_DATE - INTERVAL '7 days') as revenue_last_7_days,
    
    (SELECT COUNT(*) FROM v_paid_billing_records 
     WHERE billing_date >= CURRENT_DATE - INTERVAL '30 days') as paid_invoices_last_30_days,
    
    -- Subscription metrics
    (SELECT COUNT(*) FROM subscriptions 
     WHERE deleted_at IS NULL AND status = 'active') as active_subscriptions,
    
    (SELECT COUNT(*) FROM subscriptions 
     WHERE deleted_at IS NULL AND status = 'trial') as trial_subscriptions,
    
    (SELECT COUNT(*) FROM subscriptions 
     WHERE deleted_at IS NULL AND status = 'cancelled' 
     AND cancelled_at >= CURRENT_DATE - INTERVAL '30 days') as cancelled_last_30_days,
    
    -- Payment metrics
    (SELECT COUNT(*) FROM billing_records 
     WHERE deleted_at IS NULL AND status = 'pending') as pending_payments,
    
    (SELECT COUNT(*) FROM invoices i
     INNER JOIN billing_records br ON i.billing_record_id = br.id
     WHERE i.due_at < NOW() AND br.status != 'paid' 
     AND i.deleted_at IS NULL AND br.deleted_at IS NULL) as overdue_invoices,
    
    -- Expiring subscriptions
    (SELECT COUNT(*) FROM subscriptions 
     WHERE deleted_at IS NULL AND status IN ('active', 'trial')
     AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days') as expiring_next_30_days,
    
    -- Revenue at risk
    (SELECT COALESCE(SUM(billing_amount), 0) FROM subscriptions 
     WHERE deleted_at IS NULL AND status IN ('active', 'trial')
     AND auto_renew = false
     AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days') as revenue_at_risk,
    
    -- Last updated
    NOW() as last_updated
;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_billing_dashboard_stats_unique 
ON mv_billing_dashboard_stats(last_updated);

COMMENT ON MATERIALIZED VIEW mv_billing_dashboard_stats IS 
'Materialized view for dashboard statistics - refresh every 5 minutes';

-- ============================================================================
-- PART 5: Create refresh function for materialized view
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_billing_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_billing_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_billing_dashboard_stats IS 
'Refresh billing dashboard statistics materialized view';
