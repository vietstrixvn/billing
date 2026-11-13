-- ============================================
-- BILLING STATISTICS API INDEXES
-- ============================================
-- Description: Optimized composite indexes for billing statistics queries
-- Related spec: billing-statistics-api
-- Requirements: 12.1-12.3

-- ============================================
-- BILLING RECORDS COMPOSITE INDEXES
-- ============================================

-- Composite index for statistics queries filtering by customer, status, and date range
-- Optimizes queries like: WHERE customer_id = ? AND status = 'paid' AND billing_date BETWEEN ? AND ?
-- Used by: GetTotalRevenue, GetRevenueByPeriod, GetAverageRevenuePerCustomer
CREATE INDEX IF NOT EXISTS idx_billing_records_customer_status_date 
ON billing_records(customer_id, status, billing_date DESC)
WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_billing_records_customer_status_date IS 
'Optimizes billing statistics queries filtering by customer, status, and date range. Critical for revenue calculations.';

-- ============================================
-- INVOICES COMPOSITE INDEXES
-- ============================================

-- Composite index for payment statistics and aging reports
-- Optimizes queries like: WHERE due_at < NOW() AND paid_at IS NULL (overdue payments)
-- Used by: GetOverduePaymentCount, GetPaymentRate, GetAgingReport
CREATE INDEX IF NOT EXISTS idx_invoices_due_paid 
ON invoices(due_at, paid_at)
WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_invoices_due_paid IS 
'Optimizes invoice payment statistics and aging report queries. Critical for payment tracking and overdue detection.';

-- ============================================
-- STATISTICS UPDATE
-- ============================================
-- Update table statistics for query planner to use new indexes effectively

ANALYZE billing_records;
ANALYZE invoices;
