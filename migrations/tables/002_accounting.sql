-- ============================================
-- EXCHANGE_RATES TABLE
-- ============================================
DROP TABLE IF EXISTS exchange_rates CASCADE;
CREATE TABLE IF NOT EXISTS exchange_rates (
    id             BIGINT PRIMARY KEY,
    date           DATE,
    from_currency  CHAR(3) NOT NULL,
    to_currency    CHAR(3) NOT NULL DEFAULT 'VND',
    rate           NUMERIC(18,6) NOT NULL,
    source         VARCHAR(100),
    entered_by     BIGINT,
    notes          TEXT,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_exchange_rates_rate CHECK (rate > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup ON exchange_rates(from_currency, to_currency, effective_date DESC);


-- ============================================
-- ENTRY_SEQUENCES TABLE
-- ============================================
DROP TABLE IF EXISTS entry_sequences CASCADE;
CREATE TABLE IF NOT EXISTS entry_sequences (
    id          BIGINT PRIMARY KEY,
    prefix      VARCHAR(50) NOT NULL,
    year        INT NOT NULL,
    month       INT NOT NULL DEFAULT 0,
    seq_num     INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_entry_sequences_prefix_year UNIQUE (prefix, year)
);


-- ============================================
-- CHART_OF_ACCOUNTS TABLE (VAS System)
-- ============================================
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id             BIGINT PRIMARY KEY,
    customer_id    BIGINT,
    code           VARCHAR(50) NOT NULL,
    name           VARCHAR(255) NOT NULL,
    name_en        VARCHAR(255),
    type           VARCHAR(50) NOT NULL, -- asset | liability | equity | revenue | expense
    normal_balance VARCHAR(10) NOT NULL DEFAULT 'debit',
    parent_code    VARCHAR(50),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order     INT NOT NULL DEFAULT 0,
    description    TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at     TIMESTAMP,

    CONSTRAINT fk_coa_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coa_code ON chart_of_accounts(code);
CREATE INDEX IF NOT EXISTS idx_coa_type ON chart_of_accounts(type);
CREATE INDEX IF NOT EXISTS idx_coa_customer_id ON chart_of_accounts(customer_id);


-- ============================================
-- JOURNAL_ENTRIES & LINES TABLES
-- ============================================
DROP TABLE IF EXISTS journal_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;

CREATE TABLE IF NOT EXISTS journal_entries (
    id           BIGINT PRIMARY KEY,
    customer_id  BIGINT,
    entry_number VARCHAR(50) NOT NULL,
    type         VARCHAR(50), -- invoice_issued | payment_received | refund_processed
    status       VARCHAR(20) NOT NULL DEFAULT 'posted',
    entry_date   TIMESTAMP NOT NULL,
    posted_at    TIMESTAMP,
    source_type  VARCHAR(50), -- invoice | billing_record | refund
    source_id    BIGINT,
    total_debit  BIGINT NOT NULL DEFAULT 0,
    total_credit BIGINT NOT NULL DEFAULT 0,
    currency     CHAR(3) NOT NULL DEFAULT 'VND',
    created_by   BIGINT,
    notes        TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_je_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journal_lines (
    id               BIGINT PRIMARY KEY,
    journal_entry_id BIGINT NOT NULL,
    account_code     VARCHAR(50) NOT NULL,
    account_name     VARCHAR(255) NOT NULL,
    debit_amount     BIGINT NOT NULL DEFAULT 0,
    credit_amount    BIGINT NOT NULL DEFAULT 0,
    currency         CHAR(3) NOT NULL DEFAULT 'VND',
    description      TEXT,
    sort_order       INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_jl_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_je_customer_id ON journal_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_jl_entry_id ON journal_lines(journal_entry_id);
