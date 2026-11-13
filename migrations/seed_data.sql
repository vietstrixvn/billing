

-- ============================================
-- SEED PLANS
-- ============================================
INSERT INTO plans (
    id,
    name,
    code,
    description,
    sort_order,
    is_active,
    created_at,
    updated_at
) VALUES
(
    827066062380994603,
    'Trial',
    'trial',
    'Try it free for 30 days, with all the features of the Basic package.',
    0,
    true,
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15'
),
(
    827066062380994604,
    'Basic',
    'basic',
    'The basic package for properties includes all system features.',
    1,
    true,
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15'
),
(
    827066062380994605,
    'Basic + Domain',
    'basic_domain',
    'The Basic package includes domain management; the root admin handles all domain configuration.',
    2,
    true,
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 1. SERVICE CATEGORIES
-- ============================================
INSERT INTO service_categories (id, name, code, sort_order, is_active, created_at, updated_at)
VALUES
    (900000000000000001, 'Interface Design',        'interface_design',      1, true, NOW(), NOW()),
    (900000000000000002, 'Website Functionality',   'website_functionality', 2, true, NOW(), NOW()),
    (900000000000000003, 'Support Features',        'support_features',      3, true, NOW(), NOW()),
    (900000000000000004, 'Statistics & Analysis',   'statistics_analysis',   4, true, NOW(), NOW()),
    (900000000000000005, 'Training & Support',      'training_support',      5, true, NOW(), NOW()),
    (900000000000000006, 'Resources & Maintenance', 'resources_maintenance', 6, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. SERVICE ITEMS
-- ============================================

-- Interface Design
INSERT INTO service_items (
    id, category_id, name, code, description,
    item_type, billing_type, unit_label,
    sort_order, is_active, created_at, updated_at
) VALUES
(
    910000000000000001, 900000000000000001,
    'UI/UX Design', 'ui_ux_design',
    'User interface and user experience design service.',
    'one_time', 'one_time', NULL,
    1, true, NOW(), NOW()
),
(
    910000000000000002, 900000000000000001,
    'Responsive Design', 'responsive_design',
    'Responsive design for mobile, tablet, and desktop devices.',
    'one_time', 'one_time', NULL,
    2, true, NOW(), NOW()
),
(
    910000000000000003, 900000000000000001,
    'Number of Interfaces', 'number_of_interfaces',
    'Number of designed interfaces. Pricing is calculated per interface with quantity discounts available.',
    'usage', 'metered', 'interface',
    3, true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Website Functionality
INSERT INTO service_items (
    id, category_id, name, code, description,
    item_type, billing_type, unit_label,
    sort_order, is_active, created_at, updated_at
) VALUES
(
    910000000000000010, 900000000000000002,
    'Static Website Module', 'module_static_website',
    'Basic static website module including homepage, about page, and contact page.',
    'one_time', 'one_time', NULL,
    1, true, NOW(), NOW()
),
(
    910000000000000011, 900000000000000002,
    'User Module', 'module_user',
    'User management module including registration, login, and role permissions.',
    'one_time', 'one_time', NULL,
    2, true, NOW(), NOW()
),
(
    910000000000000012, 900000000000000002,
    'Product Module', 'module_product',
    'Product management module including categories, search, and product details.',
    'one_time', 'one_time', NULL,
    3, true, NOW(), NOW()
),
(
    910000000000000013, 900000000000000002,
    'Blog Module', 'module_blog',
    'Blog module including articles, categories, tags, and comments.',
    'one_time', 'one_time', NULL,
    4, true, NOW(), NOW()
),
(
    910000000000000014, 900000000000000002,
    'SEO Module', 'module_seo',
    'SEO module including meta tags, sitemap, schema markup, and canonical URLs.',
    'one_time', 'one_time', NULL,
    5, true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Support Features
INSERT INTO service_items (
    id, category_id, name, code, description,
    item_type, billing_type, unit_label,
    sort_order, is_active, created_at, updated_at
) VALUES
(
    910000000000000020, 900000000000000003,
    'Call to Action', 'feature_cta',
    'Design and integration of call-to-action components such as banners, popups, and signup forms.',
    'one_time', 'one_time', NULL,
    1, true, NOW(), NOW()
),
(
    910000000000000021, 900000000000000003,
    'Button System', 'feature_button',
    'Button system design aligned with brand guidelines.',
    'one_time', 'one_time', NULL,
    2, true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Statistics & Analysis
INSERT INTO service_items (
    id, category_id, name, code, description,
    item_type, billing_type, unit_label,
    sort_order, is_active, created_at, updated_at
) VALUES
(
    910000000000000030, 900000000000000004,
    'User Behavior Dashboard', 'dashboard_user_behavior',
    'Dashboard for user behavior analytics including page views, sessions, and conversion funnels.',
    'one_time', 'one_time', NULL,
    1, true, NOW(), NOW()
),
(
    910000000000000031, 900000000000000004,
    'Internal Dashboard', 'dashboard_internal',
    'Internal dashboard for revenue, orders, and new user tracking.',
    'one_time', 'one_time', NULL,
    2, true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Training & Support
INSERT INTO service_items (
    id, category_id, name, code, description,
    item_type, billing_type, unit_label,
    sort_order, is_active, created_at, updated_at
) VALUES
(
    910000000000000040, 900000000000000005,
    'User Training', 'training_user',
    'Training sessions for client teams on system usage.',
    'addon', 'one_time', NULL,
    1, true, NOW(), NOW()
),
(
    910000000000000041, 900000000000000005,
    'Warranty', 'support_warranty',
    'Bug fix warranty after project delivery.',
    'addon', 'recurring', NULL,
    2, true, NOW(), NOW()
),
(
    910000000000000042, 900000000000000005,
    'Technical Support', 'support_technical',
    'Technical support via ticket, email, and live chat.',
    'addon', 'recurring', NULL,
    3, true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Resources & Maintenance
INSERT INTO service_items (
    id, category_id, name, code, description,
    item_type, billing_type, unit_label,
    sort_order, is_active, created_at, updated_at
) VALUES
(
    910000000000000050, 900000000000000006,
    'Domain Name', 'resource_domain',
    'Domain registration and management service. Charged annually.',
    'plan', 'recurring', 'year',
    1, true, NOW(), NOW()
),
(
    910000000000000051, 900000000000000006,
    'Server / Hosting', 'resource_server',
    'Server or shared hosting rental service. Charged monthly.',
    'plan', 'recurring', 'month',
    2, true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. ITEM PRICES
-- ============================================
INSERT INTO item_prices (id, item_id, name, currency, billing_cycle, pricing_model, unit_amount, flat_amount)
VALUES
-- Interface Design
(930000000000000001, 910000000000000001, 'UI/UX Design – One-time VND',        'VND', 'one_time', 'flat',     700000, 0),
(930000000000000002, 910000000000000002, 'Responsive Design – One-time VND',   'VND', 'one_time', 'flat',     200000, 0),
(930000000000000003, 910000000000000003, 'Per Interface VND',                  'VND', 'one_time', 'per_unit',  70000, 0),
-- Website Functionality
(930000000000000004, 910000000000000010, 'Static Website Module – One-time VND', 'VND', 'one_time', 'flat', 1000000, 0),
(930000000000000005, 910000000000000011, 'User Module – One-time VND',           'VND', 'one_time', 'flat',  500000, 0),
(930000000000000006, 910000000000000012, 'Product Module – One-time VND',        'VND', 'one_time', 'flat',  500000, 0),
(930000000000000007, 910000000000000013, 'Blog Module – One-time VND',           'VND', 'one_time', 'flat',  500000, 0),
(930000000000000008, 910000000000000014, 'SEO Module – One-time VND',            'VND', 'one_time', 'flat',  100000, 0),
-- Support Features
(930000000000000009, 910000000000000020, 'Call to Action – One-time VND', 'VND', 'one_time', 'flat', 300000, 0),
(930000000000000010, 910000000000000021, 'Button System – One-time VND',  'VND', 'one_time', 'flat', 200000, 0),
-- Statistics & Analysis
(930000000000000011, 910000000000000030, 'User Behavior Dashboard – One-time VND', 'VND', 'one_time', 'flat', 500000, 0),
(930000000000000012, 910000000000000031, 'Internal Dashboard – One-time VND',      'VND', 'one_time', 'flat', 300000, 0),
-- Training & Support (free — unit_amount = 0)
(930000000000000013, 910000000000000040, 'User Training – Included',   'VND', 'one_time', 'flat', 0, 0),
(930000000000000014, 910000000000000041, 'Warranty – Included',        'VND', 'one_time', 'flat', 0, 0),
(930000000000000015, 910000000000000042, 'Technical Support – Included', 'VND', 'one_time', 'flat', 0, 0),
-- Annual pricing for training items
(930000000000000016, 910000000000000040, 'User Training – Annual',     'VND', 'annual', 'flat', 0, 0),
(930000000000000017, 910000000000000041, 'Warranty – Annual',          'VND', 'annual', 'flat', 0, 0),
-- Resources & Maintenance
(930000000000000018, 910000000000000050, 'Domain Name – Annual VND',        'VND', 'annual',  'per_unit', 350000, 0),
(930000000000000019, 910000000000000051, 'Server / Hosting – Monthly VND',  'VND', 'monthly', 'per_unit', 120000, 0),
(930000000000000020, 910000000000000051, 'Server / Hosting – Annual VND',   'VND', 'annual',  'per_unit', 1440000, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. PLAN_INCLUDED_ITEMS
-- ============================================

-- Trial plan (827066062380994603) - Same as Basic
INSERT INTO plan_included_items (id, plan_id, service_item_id, sort_order, created_at)
VALUES
    -- Interface Design
    (920000000000000201, 827066062380994603, 910000000000000001,  1, NOW()),
    (920000000000000202, 827066062380994603, 910000000000000002,  2, NOW()),
    (920000000000000203, 827066062380994603, 910000000000000003,  3, NOW()),
    -- Website Functionality
    (920000000000000210, 827066062380994603, 910000000000000010,  4, NOW()),
    (920000000000000211, 827066062380994603, 910000000000000011,  5, NOW()),
    (920000000000000212, 827066062380994603, 910000000000000012,  6, NOW()),
    (920000000000000213, 827066062380994603, 910000000000000013,  7, NOW()),
    (920000000000000214, 827066062380994603, 910000000000000014,  8, NOW()),
    -- Support Features
    (920000000000000220, 827066062380994603, 910000000000000020,  9, NOW()),
    (920000000000000221, 827066062380994603, 910000000000000021, 10, NOW()),
    -- Statistics & Analysis
    (920000000000000230, 827066062380994603, 910000000000000030, 11, NOW()),
    (920000000000000231, 827066062380994603, 910000000000000031, 12, NOW()),
    -- Training & Support
    (920000000000000240, 827066062380994603, 910000000000000040, 13, NOW()),
    (920000000000000241, 827066062380994603, 910000000000000041, 14, NOW()),
    (920000000000000242, 827066062380994603, 910000000000000042, 15, NOW())
ON CONFLICT (plan_id, service_item_id) DO NOTHING;

-- Basic plan (827066062380994604)
INSERT INTO plan_included_items (id, plan_id, service_item_id, sort_order, created_at)
VALUES
    -- Interface Design
    (920000000000000001, 827066062380994604, 910000000000000001,  1, NOW()),
    (920000000000000002, 827066062380994604, 910000000000000002,  2, NOW()),
    (920000000000000003, 827066062380994604, 910000000000000003,  3, NOW()),
    -- Website Functionality
    (920000000000000010, 827066062380994604, 910000000000000010,  4, NOW()),
    (920000000000000011, 827066062380994604, 910000000000000011,  5, NOW()),
    (920000000000000012, 827066062380994604, 910000000000000012,  6, NOW()),
    (920000000000000013, 827066062380994604, 910000000000000013,  7, NOW()),
    (920000000000000014, 827066062380994604, 910000000000000014,  8, NOW()),
    -- Support Features
    (920000000000000020, 827066062380994604, 910000000000000020,  9, NOW()),
    (920000000000000021, 827066062380994604, 910000000000000021, 10, NOW()),
    -- Statistics & Analysis
    (920000000000000030, 827066062380994604, 910000000000000030, 11, NOW()),
    (920000000000000031, 827066062380994604, 910000000000000031, 12, NOW()),
    -- Training & Support
    (920000000000000040, 827066062380994604, 910000000000000040, 13, NOW()),
    (920000000000000041, 827066062380994604, 910000000000000041, 14, NOW()),
    (920000000000000042, 827066062380994604, 910000000000000042, 15, NOW()),
    -- Resources & Maintenance
    (920000000000000052, 827066062380994604, 910000000000000051, 16, NOW())
ON CONFLICT (plan_id, service_item_id) DO NOTHING;

-- Basic + Domain plan (827066062380994605)
INSERT INTO plan_included_items (id, plan_id, service_item_id, sort_order, created_at)
VALUES
    -- Interface Design
    (920000000000000101, 827066062380994605, 910000000000000001,  1, NOW()),
    (920000000000000102, 827066062380994605, 910000000000000002,  2, NOW()),
    (920000000000000103, 827066062380994605, 910000000000000003,  3, NOW()),
    -- Website Functionality
    (920000000000000110, 827066062380994605, 910000000000000010,  4, NOW()),
    (920000000000000111, 827066062380994605, 910000000000000011,  5, NOW()),
    (920000000000000112, 827066062380994605, 910000000000000012,  6, NOW()),
    (920000000000000113, 827066062380994605, 910000000000000013,  7, NOW()),
    (920000000000000114, 827066062380994605, 910000000000000014,  8, NOW()),
    -- Support Features
    (920000000000000120, 827066062380994605, 910000000000000020,  9, NOW()),
    (920000000000000121, 827066062380994605, 910000000000000021, 10, NOW()),
    -- Statistics & Analysis
    (920000000000000130, 827066062380994605, 910000000000000030, 11, NOW()),
    (920000000000000131, 827066062380994605, 910000000000000031, 12, NOW()),
    -- Training & Support
    (920000000000000140, 827066062380994605, 910000000000000040, 13, NOW()),
    (920000000000000141, 827066062380994605, 910000000000000041, 14, NOW()),
    (920000000000000142, 827066062380994605, 910000000000000042, 15, NOW()),
    -- Resources & Maintenance (chỉ Basic+Domain mới có)
    (920000000000000150, 827066062380994605, 910000000000000050, 16, NOW()),
    (920000000000000151, 827066062380994605, 910000000000000051, 17, NOW())
ON CONFLICT (plan_id, service_item_id) DO NOTHING;

-- ============================================
-- ANALYZE
-- ============================================
ANALYZE service_categories;
ANALYZE service_items;
ANALYZE item_prices;
ANALYZE plan_included_items;

-- ============================================
-- ACCOUNTING SEED DATA
-- (Giữ nguyên — không liên quan đến các bảng đã đổi)
-- ============================================

-- ============================================
-- 1. CHART OF ACCOUNTS (Hệ thống tài khoản VAS)
-- ============================================
INSERT INTO chart_of_accounts (
    id, customer_id, code, name, name_en, type, normal_balance,
    parent_code, is_active, sort_order, description,
    created_at, updated_at
) VALUES

(950000000000001000, NULL, '111', 'Tiền mặt', 'Cash on hand', 'asset', 'debit', NULL, true, 10, NULL, NOW(), NOW()),
(950000000000001001, NULL, '1111', 'Tiền Việt Nam', 'Vietnamese dong', 'asset', 'debit', '111', true, 20, NULL, NOW(), NOW()),
(950000000000001002, NULL, '1112', 'Ngoại tệ', 'Foreign currencies', 'asset', 'debit', '111', true, 30, NULL, NOW(), NOW()),
(950000000000001003, NULL, '1113', 'Vàng tiền tệ', 'Monetary Gold', 'asset', 'debit', '111', true, 40, NULL, NOW(), NOW()),
(950000000000001004, NULL, '112', 'Tiền gửi ngân hàng', 'Cash in banks', 'asset', 'debit', NULL, true, 50, NULL, NOW(), NOW()),
(950000000000001005, NULL, '1121', 'Tiền Việt Nam', 'Vietnamese dong', 'asset', 'debit', '112', true, 60, NULL, NOW(), NOW()),
(950000000000001006, NULL, '1122', 'Ngoại tệ', 'Foreign currencies', 'asset', 'debit', '112', true, 70, NULL, NOW(), NOW()),
(950000000000001007, NULL, '1123', 'Vàng tiền tệ', 'Monetary Gold', 'asset', 'debit', '112', true, 80, NULL, NOW(), NOW()),
(950000000000001008, NULL, '113', 'Tiền đang chuyển', 'Cash in transit', 'asset', 'debit', NULL, true, 90, NULL, NOW(), NOW()),
(950000000000001009, NULL, '1131', 'Tiền Việt Nam', 'Vietnamese dong', 'asset', 'debit', '113', true, 100, NULL, NOW(), NOW()),
(950000000000001010, NULL, '1132', 'Ngoại tệ', 'Foreign currencies', 'asset', 'debit', '113', true, 110, NULL, NOW(), NOW()),
(950000000000001011, NULL, '121', 'Chứng khoán kinh doanh', 'Trading Securities', 'asset', 'debit', NULL, true, 120, NULL, NOW(), NOW()),
(950000000000001012, NULL, '1211', 'Cổ phiếu', 'Shares', 'asset', 'debit', '121', true, 130, NULL, NOW(), NOW()),
(950000000000001013, NULL, '1212', 'Trái phiếu', 'Bonds', 'asset', 'debit', '121', true, 140, NULL, NOW(), NOW()),
(950000000000001014, NULL, '1218', 'Chứng khoán và công cụ tài chính khác', 'Securities and other financial instruments', 'asset', 'debit', '121', true, 150, NULL, NOW(), NOW()),
(950000000000001015, NULL, '128', 'Đầu tư nắm giữ đến ngày đáo hạn', 'Investments held to maturity', 'asset', 'debit', NULL, true, 160, NULL, NOW(), NOW()),
(950000000000001016, NULL, '1281', 'Tiền gửi có kỳ hạn', 'Time deposits', 'asset', 'debit', '128', true, 170, NULL, NOW(), NOW()),
(950000000000001017, NULL, '1282', 'Trái phiếu', 'Bonds', 'asset', 'debit', '128', true, 180, NULL, NOW(), NOW()),
(950000000000001018, NULL, '1283', 'Cho vay', 'Loan', 'asset', 'debit', '128', true, 190, NULL, NOW(), NOW()),
(950000000000001019, NULL, '1288', 'Các khoản đầu tư khác nắm giữ đến ngày đáo hạn', 'Other investments held to maturity', 'asset', 'debit', '128', true, 200, NULL, NOW(), NOW()),
(950000000000001020, NULL, '131', 'Phải thu của khách hàng', 'Trade Receivables', 'asset', 'debit', NULL, true, 210, NULL, NOW(), NOW()),
(950000000000001021, NULL, '133', 'Thuế GTGT được khấu trừ', 'Deductible VAT', 'asset', 'debit', NULL, true, 220, NULL, NOW(), NOW()),
(950000000000001022, NULL, '1331', 'Thuế GTGT được khấu trừ của hàng hoá, dịch vụ', 'Deductible VAT of goods and services', 'asset', 'debit', '133', true, 230, NULL, NOW(), NOW()),
(950000000000001023, NULL, '1332', 'Thuế GTGT được khấu trừ của TSCĐ', 'Deductible VAT of fixed assets', 'asset', 'debit', '133', true, 240, NULL, NOW(), NOW()),
(950000000000001024, NULL, '136', 'Phải thu nội bộ', 'Internal Receivables', 'asset', 'debit', NULL, true, 250, NULL, NOW(), NOW()),
(950000000000001025, NULL, '1361', 'Vốn kinh doanh ở các đơn vị trực thuộc', 'Working capital provided to sub-units', 'asset', 'debit', '136', true, 260, NULL, NOW(), NOW()),
(950000000000001026, NULL, '1362', 'Phải thu nội bộ về chênh lệch tỷ giá', 'Internal Receivables on foreign exchange diff', 'asset', 'debit', '136', true, 270, NULL, NOW(), NOW()),
(950000000000001027, NULL, '1363', 'Phải thu nội bộ về chi phí đi vay đủ điều kiện được vốn hoá', 'Internal Receivables on borrowing cost eligible for capitalization', 'asset', 'debit', '136', true, 280, NULL, NOW(), NOW()),
(950000000000001028, NULL, '1368', 'Phải thu nội bộ khác', 'Other internal receivables', 'asset', 'debit', '136', true, 290, NULL, NOW(), NOW()),
(950000000000001029, NULL, '138', 'Phải thu khác', 'Other receivables', 'asset', 'debit', NULL, true, 300, NULL, NOW(), NOW()),
(950000000000001030, NULL, '1381', 'Tài sản thiếu chờ xử lý', 'Shortage of assets awaiting resolution', 'asset', 'debit', '138', true, 310, NULL, NOW(), NOW()),
(950000000000001031, NULL, '1385', 'Phải thu về cổ phần hoá', 'Privatization receivables', 'asset', 'debit', '138', true, 320, NULL, NOW(), NOW()),
(950000000000001032, NULL, '1388', 'Phải thu khác', 'Other receivables', 'asset', 'debit', '138', true, 330, NULL, NOW(), NOW()),
(950000000000001033, NULL, '141', 'Tạm ứng', 'Advances', 'asset', 'debit', NULL, true, 340, NULL, NOW(), NOW()),
(950000000000001034, NULL, '151', 'Hàng mua đang đi đường', 'Goods in transit', 'asset', 'debit', NULL, true, 350, NULL, NOW(), NOW()),
(950000000000001035, NULL, '152', 'Nguyên liệu, vật liệu', 'Raw materials', 'asset', 'debit', NULL, true, 360, NULL, NOW(), NOW()),
(950000000000001036, NULL, '153', 'Công cụ, dụng cụ', 'Tools & supplies', 'asset', 'debit', NULL, true, 370, NULL, NOW(), NOW()),
(950000000000001037, NULL, '1531', 'Công cụ, dụng cụ', 'Tools & supplies', 'asset', 'debit', '153', true, 380, NULL, NOW(), NOW()),
(950000000000001038, NULL, '1532', 'Bao bì luân chuyển', 'Packaging rotation', 'asset', 'debit', '153', true, 390, NULL, NOW(), NOW()),
(950000000000001039, NULL, '1533', 'Đồ dùng cho thuê', 'Instrument for rent', 'asset', 'debit', '153', true, 400, NULL, NOW(), NOW()),
(950000000000001040, NULL, '1534', 'Thiết bị, phụ tùng thay thế', 'Equipment & spare parts', 'asset', 'debit', '153', true, 410, NULL, NOW(), NOW()),
(950000000000001041, NULL, '154', 'Chi phí sản xuất, kinh doanh dở dang', 'Work in process', 'asset', 'debit', NULL, true, 420, NULL, NOW(), NOW()),
(950000000000001042, NULL, '155', 'Thành phẩm', 'Finished products', 'asset', 'debit', NULL, true, 430, NULL, NOW(), NOW()),
(950000000000001043, NULL, '1551', 'Thành phẩm nhập kho', 'Finished products', 'asset', 'debit', '155', true, 440, NULL, NOW(), NOW()),
(950000000000001044, NULL, '1557', 'Thành phẩm bất động sản', 'Real estate finished goods', 'asset', 'debit', '155', true, 450, NULL, NOW(), NOW()),
(950000000000001045, NULL, '156', 'Hàng hóa', 'Merchandise goods', 'asset', 'debit', NULL, true, 460, NULL, NOW(), NOW()),
(950000000000001046, NULL, '1561', 'Giá mua hàng hóa', 'Purchase costs', 'asset', 'debit', '156', true, 470, NULL, NOW(), NOW()),
(950000000000001047, NULL, '1562', 'Chi phí thu mua hàng hóa', 'Incidental expense', 'asset', 'debit', '156', true, 480, NULL, NOW(), NOW()),
(950000000000001048, NULL, '1567', 'Hàng hoá bất động sản', 'Property Inventories', 'asset', 'debit', '156', true, 490, NULL, NOW(), NOW()),
(950000000000001049, NULL, '157', 'Hàng gửi đi bán', 'Outward goods on consignment', 'asset', 'debit', NULL, true, 500, NULL, NOW(), NOW()),
(950000000000001050, NULL, '158', 'Hàng hoá kho bảo thuế', 'Goods in bonded warehouse', 'asset', 'debit', NULL, true, 510, NULL, NOW(), NOW()),
(950000000000001051, NULL, '161', 'Chi sự nghiệp', 'Government source expenditure', 'asset', 'debit', NULL, true, 520, NULL, NOW(), NOW()),
(950000000000001052, NULL, '1611', 'Chi sự nghiệp năm trước', 'Previous years expenditure', 'asset', 'debit', '161', true, 530, NULL, NOW(), NOW()),
(950000000000001053, NULL, '1612', 'Chi sự nghiệp năm nay', 'Current years expenditure', 'asset', 'debit', '161', true, 540, NULL, NOW(), NOW()),
(950000000000001054, NULL, '171', 'Giao dịch mua bán lại trái phiếu chính phủ', 'Government bonds purchase-resale', 'asset', 'debit', NULL, true, 550, NULL, NOW(), NOW()),
(950000000000001055, NULL, '211', 'Tài sản cố định hữu hình', 'Tangible fixed assets', 'asset', 'debit', NULL, true, 560, NULL, NOW(), NOW()),
(950000000000001056, NULL, '2111', 'Nhà cửa, vật kiến trúc', 'Building & structures', 'asset', 'debit', '211', true, 570, NULL, NOW(), NOW()),
(950000000000001057, NULL, '2112', 'Máy móc, thiết bị', 'Machinery & Equipment', 'asset', 'debit', '211', true, 580, NULL, NOW(), NOW()),
(950000000000001058, NULL, '2113', 'Phương tiện vận tải, truyền dẫn', 'Transportation & transmission vehicles', 'asset', 'debit', '211', true, 590, NULL, NOW(), NOW()),
(950000000000001059, NULL, '2114', 'Thiết bị, dụng cụ quản lý', 'Office equipment', 'asset', 'debit', '211', true, 600, NULL, NOW(), NOW()),
(950000000000001060, NULL, '2115', 'Cây lâu năm, súc vật làm việc và cho sản phẩm', 'Perenial trees, working and producing animals', 'asset', 'debit', '211', true, 610, NULL, NOW(), NOW()),
(950000000000001061, NULL, '2118', 'Tài sản cố định khác', 'Other tangible fixed assets', 'asset', 'debit', '211', true, 620, NULL, NOW(), NOW()),
(950000000000001062, NULL, '212', 'Tài sản cố định thuê tài chính', 'Financial leased assets', 'asset', 'debit', NULL, true, 630, NULL, NOW(), NOW()),
(950000000000001063, NULL, '2121', 'TSCĐ hữu hình thuê tài chính', 'Financial leased tangible assets', 'asset', 'debit', '212', true, 640, NULL, NOW(), NOW()),
(950000000000001064, NULL, '2122', 'TSCĐ vô hình thuê tài chính', 'Financial leased intangible assets', 'asset', 'debit', '212', true, 650, NULL, NOW(), NOW()),
(950000000000001065, NULL, '213', 'Tài sản cố định vô hình', 'Intangible fixed assets', 'asset', 'debit', NULL, true, 660, NULL, NOW(), NOW()),
(950000000000001066, NULL, '2131', 'Quyền sử dụng đất', 'Land use right', 'asset', 'debit', '213', true, 670, NULL, NOW(), NOW()),
(950000000000001067, NULL, '2132', 'Quyền phát hành', 'Copyrights', 'asset', 'debit', '213', true, 680, NULL, NOW(), NOW()),
(950000000000001068, NULL, '2133', 'Bản quyền, bằng sáng chế', 'Patents', 'asset', 'debit', '213', true, 690, NULL, NOW(), NOW()),
(950000000000001069, NULL, '2134', 'Nhãn hiệu, tên thương mại', 'Trademarks and brand name', 'asset', 'debit', '213', true, 700, NULL, NOW(), NOW()),
(950000000000001070, NULL, '2135', 'Chương trình phần mềm', 'Computer Software', 'asset', 'debit', '213', true, 710, NULL, NOW(), NOW()),
(950000000000001071, NULL, '2136', 'Giấy phép và giấy phép nhượng quyền', 'License & franchises', 'asset', 'debit', '213', true, 720, NULL, NOW(), NOW()),
(950000000000001072, NULL, '2138', 'TSCĐ vô hình khác', 'Other intangible fixed assets', 'asset', 'debit', '213', true, 730, NULL, NOW(), NOW()),
(950000000000001073, NULL, '214', 'Hao mòn tài sản cố định', 'Depreciation of fixed assets', 'asset', 'debit', NULL, true, 740, NULL, NOW(), NOW()),
(950000000000001074, NULL, '2141', 'Hao mòn TSCĐ hữu hình', 'Depreciation of tangible fixed assets', 'asset', 'debit', '214', true, 750, NULL, NOW(), NOW()),
(950000000000001075, NULL, '2142', 'Hao mòn TSCĐ thuê tài chính', 'Depreciation of financial leased assets', 'asset', 'debit', '214', true, 760, NULL, NOW(), NOW()),
(950000000000001076, NULL, '2143', 'Hao mòn TSCĐ vô hình', 'Depreciation of intangible fixed assets', 'asset', 'debit', '214', true, 770, NULL, NOW(), NOW()),
(950000000000001077, NULL, '2147', 'Hao mòn bất động sản đầu tư', 'Depreciation of Investment properties', 'asset', 'debit', '214', true, 780, NULL, NOW(), NOW()),
(950000000000001078, NULL, '217', 'Bất động sản đầu tư', 'Investment properties', 'asset', 'debit', NULL, true, 790, NULL, NOW(), NOW()),
(950000000000001079, NULL, '221', 'Đầu tư vào công ty con', 'Investment in subsidiaries', 'asset', 'debit', NULL, true, 800, NULL, NOW(), NOW()),
(950000000000001080, NULL, '222', 'Đầu tư vào công ty liên doanh, liên kết', 'Investment in Joint venture and associates', 'asset', 'debit', NULL, true, 810, NULL, NOW(), NOW()),
(950000000000001081, NULL, '228', 'Đầu tư khác', 'Other investments', 'asset', 'debit', NULL, true, 820, NULL, NOW(), NOW()),
(950000000000001082, NULL, '2281', 'Đầu tư góp vốn vào đơn vị khác', 'Equity investment in other entity', 'asset', 'debit', '228', true, 830, NULL, NOW(), NOW()),
(950000000000001083, NULL, '2288', 'Đầu tư khác', 'Other investment', 'asset', 'debit', '228', true, 840, NULL, NOW(), NOW()),
(950000000000001084, NULL, '229', 'Dự phòng tổn thất tài sản', 'Allowance for impairment of assets', 'asset', 'debit', NULL, true, 850, NULL, NOW(), NOW()),
(950000000000001085, NULL, '2291', 'Dự phòng giảm giá chứng khoán kinh doanh', 'Allowance for decline in value of trading securities', 'asset', 'debit', '229', true, 860, NULL, NOW(), NOW()),
(950000000000001086, NULL, '2292', 'Dự phòng tổn thất đầu tư vào đơn vị khác', 'Allowance for investment loss in other entity', 'asset', 'debit', '229', true, 870, NULL, NOW(), NOW()),
(950000000000001087, NULL, '2293', 'Dự phòng phải thu khó đòi', 'Allowance for doubtful debt', 'asset', 'debit', '229', true, 880, NULL, NOW(), NOW()),
(950000000000001088, NULL, '2294', 'Dự phòng giảm giá hàng tồn kho', 'Inventory reserve', 'asset', 'debit', '229', true, 890, NULL, NOW(), NOW()),
(950000000000001089, NULL, '241', 'Xây dựng cơ bản dở dang', 'Construction in progress', 'asset', 'debit', NULL, true, 900, NULL, NOW(), NOW()),
(950000000000001090, NULL, '2411', 'Mua sắm TSCĐ', 'Acquisition of Fixed assets', 'asset', 'debit', '241', true, 910, NULL, NOW(), NOW()),
(950000000000001091, NULL, '2412', 'Xây dựng cơ bản', 'Construction in progress', 'asset', 'debit', '241', true, 920, NULL, NOW(), NOW()),
(950000000000001092, NULL, '2413', 'Sửa chữa lớn TSCĐ', 'Extra-ordinary repair of fixed assets', 'asset', 'debit', '241', true, 930, NULL, NOW(), NOW()),
(950000000000001093, NULL, '242', 'Chi phí trả trước', 'Prepaid expenses', 'asset', 'debit', NULL, true, 940, NULL, NOW(), NOW()),
(950000000000001094, NULL, '243', 'Tài sản thuế thu nhập hoãn lại', 'Deffered tax assets', 'asset', 'debit', NULL, true, 950, NULL, NOW(), NOW()),
(950000000000001095, NULL, '244', 'Cầm cố, thế chấp, ký quỹ, ký cược', 'Mortgage, collaterals and deposits', 'asset', 'debit', NULL, true, 960, NULL, NOW(), NOW()),
(950000000000001096, NULL, '331', 'Phải trả cho người bán', 'Trade Payables', 'liability', 'credit', NULL, true, 970, NULL, NOW(), NOW()),
(950000000000001097, NULL, '333', 'Thuế và các khoản phải nộp Nhà nước', 'Taxes and other payable to State Budget', 'liability', 'credit', NULL, true, 980, NULL, NOW(), NOW()),
(950000000000001098, NULL, '3331', 'Thuế giá trị gia tăng phải nộp', 'Value Added Tax (VAT)', 'liability', 'credit', '333', true, 990, NULL, NOW(), NOW()),
(950000000000001099, NULL, '33311', 'Thuế GTGT đầu ra', 'VAT output', 'liability', 'credit', '3331', true, 1000, NULL, NOW(), NOW()),
(950000000000001100, NULL, '33312', 'Thuế GTGT hàng nhập khẩu', 'VAT on imported goods', 'liability', 'credit', '3331', true, 1010, NULL, NOW(), NOW()),
(950000000000001101, NULL, '3332', 'Thuế tiêu thụ đặc biệt', 'Special consumption tax', 'liability', 'credit', '333', true, 1020, NULL, NOW(), NOW()),
(950000000000001102, NULL, '3333', 'Thuế xuất, nhập khẩu', 'Import & export duties', 'liability', 'credit', '333', true, 1030, NULL, NOW(), NOW()),
(950000000000001103, NULL, '3334', 'Thuế thu nhập doanh nghiệp', 'Corporate Income Tax', 'liability', 'credit', '333', true, 1040, NULL, NOW(), NOW()),
(950000000000001104, NULL, '3335', 'Thuế thu nhập cá nhân', 'Personal income tax', 'liability', 'credit', '333', true, 1050, NULL, NOW(), NOW()),
(950000000000001105, NULL, '3336', 'Thuế tài nguyên', 'Natural resources using tax', 'liability', 'credit', '333', true, 1060, NULL, NOW(), NOW()),
(950000000000001106, NULL, '3337', 'Thuế nhà đất, tiền thuê đất', 'Land & housing tax, land rental charges', 'liability', 'credit', '333', true, 1070, NULL, NOW(), NOW()),
(950000000000001107, NULL, '3338', 'Thuế bảo vệ môi trường và các loại thuế khác', 'Environment protection tax and other taxes', 'liability', 'credit', '333', true, 1080, NULL, NOW(), NOW()),
(950000000000001108, NULL, '33381', 'Thuế bảo vệ môi trường', 'Environment protection tax', 'liability', 'credit', '3338', true, 1090, NULL, NOW(), NOW()),
(950000000000001109, NULL, '33382', 'Các loại thuế khác', 'Other taxes', 'liability', 'credit', '3338', true, 1100, NULL, NOW(), NOW()),
(950000000000001110, NULL, '3339', 'Phí, lệ phí và các khoản phải nộp khác', 'Fee & charge & other payables', 'liability', 'credit', '333', true, 1110, NULL, NOW(), NOW()),
(950000000000001111, NULL, '334', 'Phải trả người lao động', 'Payable to employees', 'liability', 'credit', NULL, true, 1120, NULL, NOW(), NOW()),
(950000000000001112, NULL, '3341', 'Phải trả công nhân viên', 'Payable to employees', 'liability', 'credit', '334', true, 1130, NULL, NOW(), NOW()),
(950000000000001113, NULL, '3348', 'Phải trả người lao động khác', 'Payable to other', 'liability', 'credit', '334', true, 1140, NULL, NOW(), NOW()),
(950000000000001114, NULL, '335', 'Chi phí phải trả', 'Accrued expenses', 'liability', 'credit', NULL, true, 1150, NULL, NOW(), NOW()),
(950000000000001115, NULL, '336', 'Phải trả nội bộ', 'Internal payables', 'liability', 'credit', NULL, true, 1160, NULL, NOW(), NOW()),
(950000000000001116, NULL, '3361', 'Phải trả nội bộ về vốn kinh doanh', 'Internal payables for working capital received', 'liability', 'credit', '336', true, 1170, NULL, NOW(), NOW()),
(950000000000001117, NULL, '3362', 'Phải trả nội bộ về chênh lệch tỷ giá', 'Internal payables for foreign exchange diff', 'liability', 'credit', '336', true, 1180, NULL, NOW(), NOW()),
(950000000000001118, NULL, '3363', 'Phải trả nội bộ về chi phí đi vay đủ điều kiện được vốn hoá', 'Internal payables for borrowing cost eligible for capitalization', 'liability', 'credit', '336', true, 1190, NULL, NOW(), NOW()),
(950000000000001119, NULL, '3368', 'Phải trả nội bộ khác', 'Other internal payables', 'liability', 'credit', '336', true, 1200, NULL, NOW(), NOW()),
(950000000000001120, NULL, '337', 'Thanh toán theo tiến độ kế hoạch hợp đồng xây dựng', 'Progress billings for construction contract', 'liability', 'credit', NULL, true, 1210, NULL, NOW(), NOW()),
(950000000000001121, NULL, '338', 'Phải trả, phải nộp khác', 'Other payables', 'liability', 'credit', NULL, true, 1220, NULL, NOW(), NOW()),
(950000000000001122, NULL, '3381', 'Tài sản thừa chờ giải quyết', 'Surplus of assets awaiting for resolution', 'liability', 'credit', '338', true, 1230, NULL, NOW(), NOW()),
(950000000000001123, NULL, '3382', 'Kinh phí công đoàn', 'Trade Union fees', 'liability', 'credit', '338', true, 1240, NULL, NOW(), NOW()),
(950000000000001124, NULL, '3383', 'Bảo hiểm xã hội', 'Social insurance', 'liability', 'credit', '338', true, 1250, NULL, NOW(), NOW()),
(950000000000001125, NULL, '3384', 'Bảo hiểm y tế', 'Health insurance', 'liability', 'credit', '338', true, 1260, NULL, NOW(), NOW()),
(950000000000001126, NULL, '3385', 'Phải trả về cổ phần hoá', 'Privatization payable', 'liability', 'credit', '338', true, 1270, NULL, NOW(), NOW()),
(950000000000001127, NULL, '3386', 'Bảo hiểm thất nghiệp', 'Unemployment insurance', 'liability', 'credit', '338', true, 1280, NULL, NOW(), NOW()),
(950000000000001128, NULL, '3387', 'Doanh thu chưa thực hiện', 'Unearned revenue', 'liability', 'credit', '338', true, 1290, NULL, NOW(), NOW()),
(950000000000001129, NULL, '3388', 'Phải trả, phải nộp khác', 'Others', 'liability', 'credit', '338', true, 1300, NULL, NOW(), NOW()),
(950000000000001130, NULL, '341', 'Vay dài hạn', 'Borrowings and finance lease liabilities', 'liability', 'credit', NULL, true, 1310, NULL, NOW(), NOW()),
(950000000000001131, NULL, '3411', 'Các khoản đi vay', 'Borrowings', 'liability', 'credit', '341', true, 1320, NULL, NOW(), NOW()),
(950000000000001132, NULL, '3412', 'Nợ thuê tài chính', 'Finance lease liabilities', 'liability', 'credit', '341', true, 1330, NULL, NOW(), NOW()),
(950000000000001133, NULL, '343', 'Trái phiếu phát hành', 'Issued bonds', 'liability', 'credit', NULL, true, 1340, NULL, NOW(), NOW()),
(950000000000001134, NULL, '3431', 'Trái phiếu thường', 'Ordinary bonds', 'liability', 'credit', '343', true, 1350, NULL, NOW(), NOW()),
(950000000000001135, NULL, '34311', 'Mệnh giá trái phiếu', 'Par value of bonds', 'liability', 'credit', '3431', true, 1360, NULL, NOW(), NOW()),
(950000000000001136, NULL, '34312', 'Chiết khấu trái phiếu', 'Bond discounts', 'liability', 'credit', '3431', true, 1370, NULL, NOW(), NOW()),
(950000000000001137, NULL, '34313', 'Phụ trội trái phiếu', 'Bond premiums', 'liability', 'credit', '3431', true, 1380, NULL, NOW(), NOW()),
(950000000000001138, NULL, '3432', 'Trái phiếu chuyển đổi', 'Convertible bonds', 'liability', 'credit', '343', true, 1390, NULL, NOW(), NOW()),
(950000000000001139, NULL, '344', 'Nhận ký quỹ, ký cược', 'Deposits received', 'liability', 'credit', NULL, true, 1400, NULL, NOW(), NOW()),
(950000000000001140, NULL, '347', 'Thuế thu nhập hoãn lại phải trả', 'Deferred tax liabilities', 'liability', 'credit', NULL, true, 1410, NULL, NOW(), NOW()),
(950000000000001141, NULL, '352', 'Dự phòng phải trả', 'Provisions payables', 'liability', 'credit', NULL, true, 1420, NULL, NOW(), NOW()),
(950000000000001142, NULL, '3521', 'Dự phòng bảo hành sản phẩm hàng hóa', 'Product warranty provisions', 'liability', 'credit', '352', true, 1430, NULL, NOW(), NOW()),
(950000000000001143, NULL, '3522', 'Dự phòng bảo hành công trình xây dựng', 'Construction warranty provisions', 'liability', 'credit', '352', true, 1440, NULL, NOW(), NOW()),
(950000000000001144, NULL, '3523', 'Dự phòng tái cơ cấu doanh nghiệp', 'Enterprise restructuring provisions', 'liability', 'credit', '352', true, 1450, NULL, NOW(), NOW()),
(950000000000001145, NULL, '3524', 'Dự phòng phải trả khác', 'Other provisions', 'liability', 'credit', '352', true, 1460, NULL, NOW(), NOW()),
(950000000000001146, NULL, '353', 'Quỹ khen thưởng phúc lợi', 'Bonus and welfare fund', 'liability', 'credit', NULL, true, 1470, NULL, NOW(), NOW()),
(950000000000001147, NULL, '3531', 'Quỹ khen thưởng', 'Bonus fund', 'liability', 'credit', '353', true, 1480, NULL, NOW(), NOW()),
(950000000000001148, NULL, '3532', 'Quỹ phúc lợi', 'Welfare fund', 'liability', 'credit', '353', true, 1490, NULL, NOW(), NOW()),
(950000000000001149, NULL, '3533', 'Quỹ phúc lợi đã hình thành TSCĐ', 'Welfare fund used for fixed asset acquisitions', 'liability', 'credit', '353', true, 1500, NULL, NOW(), NOW()),
(950000000000001150, NULL, '3534', 'Quỹ thưởng ban quản lý điều hành công ty', 'Management bonus fund', 'liability', 'credit', '353', true, 1510, NULL, NOW(), NOW()),
(950000000000001151, NULL, '356', 'Quỹ phát triển khoa học và công nghệ', 'Science and technology development fund', 'liability', 'credit', NULL, true, 1520, NULL, NOW(), NOW()),
(950000000000001152, NULL, '3561', 'Quỹ phát triển khoa học và công nghệ', 'Science and technology development fund', 'liability', 'credit', '356', true, 1530, NULL, NOW(), NOW()),
(950000000000001153, NULL, '3562', 'Quỹ phát triển khoa học và công nghệ đã hình thành TSCĐ', 'Science and technology development fund used for fixed asset acquisition', 'liability', 'credit', '356', true, 1540, NULL, NOW(), NOW()),
(950000000000001154, NULL, '357', 'Quỹ bình ổn giá', 'Price stabilization fund', 'liability', 'credit', NULL, true, 1550, NULL, NOW(), NOW()),
(950000000000001155, NULL, '411', 'Vốn đầu tư của chủ sở hữu', 'Owner''s equity', 'equity', 'credit', NULL, true, 1560, NULL, NOW(), NOW()),
(950000000000001156, NULL, '4111', 'Vốn góp của chủ sở hữu', 'Contributed capital', 'equity', 'credit', '411', true, 1570, NULL, NOW(), NOW()),
(950000000000001157, NULL, '41111', 'Cổ phiếu phổ thông có quyền biểu quyết', 'Ordinary shares with voting rights', 'equity', 'credit', '4111', true, 1580, NULL, NOW(), NOW()),
(950000000000001158, NULL, '41112', 'Cổ phiếu ưu đãi', 'Preference shares', 'equity', 'credit', '4111', true, 1590, NULL, NOW(), NOW()),
(950000000000001159, NULL, '4112', 'Thặng dư vốn cổ phần', 'Capital surplus', 'equity', 'credit', '411', true, 1600, NULL, NOW(), NOW()),
(950000000000001160, NULL, '4113', 'Thặng dư vốn cổ phần', 'Conversion options on convertible bonds', 'equity', 'credit', '411', true, 1610, NULL, NOW(), NOW()),
(950000000000001161, NULL, '4118', 'Vốn khác', 'Other capital', 'equity', 'credit', '411', true, 1620, NULL, NOW(), NOW()),
(950000000000001162, NULL, '412', 'Chênh lệch đánh giá lại tài sản', 'Revaluation differences on asset', 'equity', 'credit', NULL, true, 1630, NULL, NOW(), NOW()),
(950000000000001163, NULL, '413', 'Chênh lệch tỷ giá hối đoái', 'Foreign exchange differences', 'equity', 'credit', NULL, true, 1640, NULL, NOW(), NOW()),
(950000000000001164, NULL, '4131', 'Chênh lệch tỷ giá do đánh giá lại các khoản mục tiền tệ có gốc ngoại tệ', 'Exchange rate differences on revaluation of monetary items denominated in foreign currency', 'equity', 'credit', '413', true, 1650, NULL, NOW(), NOW()),
(950000000000001165, NULL, '4132', 'Chênh lệch tỷ giá hối đoái trong giai đoạn trước hoạt động', 'Exchange rate differences in preoperating period', 'equity', 'credit', '413', true, 1660, NULL, NOW(), NOW()),
(950000000000001166, NULL, '414', 'Quỹ đầu tư phát triển', 'Investment & development funds', 'equity', 'credit', NULL, true, 1670, NULL, NOW(), NOW()),
(950000000000001167, NULL, '417', 'Quỹ hỗ trợ sắp xếp doanh nghiệp', 'Enterprise reorganization assistance fund', 'equity', 'credit', NULL, true, 1680, NULL, NOW(), NOW()),
(950000000000001168, NULL, '418', 'Các quỹ khác thuộc vốn chủ sở hữu', 'Other equity funds', 'equity', 'credit', NULL, true, 1690, NULL, NOW(), NOW()),
(950000000000001169, NULL, '419', 'Cổ phiếu quỹ', 'Treasury stocks', 'equity', 'credit', NULL, true, 1700, NULL, NOW(), NOW()),
(950000000000001170, NULL, '421', 'Lợi nhuận sau thuế chưa phân phối', 'Undistributed profit after tax', 'equity', 'credit', NULL, true, 1710, NULL, NOW(), NOW()),
(950000000000001171, NULL, '4211', 'Lợi nhuận sau thuế chưa phân phối năm trước', 'Undistributed profit after tax of previous year', 'equity', 'credit', '421', true, 1720, NULL, NOW(), NOW()),
(950000000000001172, NULL, '4212', 'Lợi nhuận sau thuế chưa phân phối năm nay', 'Undistributed profit after tax of current year', 'equity', 'credit', '421', true, 1730, NULL, NOW(), NOW()),
(950000000000001173, NULL, '441', 'Nguồn vốn đầu tư xây dựng cơ bản', 'Capital expenditure funds', 'equity', 'credit', NULL, true, 1740, NULL, NOW(), NOW()),
(950000000000001174, NULL, '461', 'Nguồn kinh phí sự nghiệp', 'Government sourced funds', 'equity', 'credit', NULL, true, 1750, NULL, NOW(), NOW()),
(950000000000001175, NULL, '4611', 'Nguồn kinh phí sự nghiệp năm trước', 'Government sourced funds of previous year', 'equity', 'credit', '461', true, 1760, NULL, NOW(), NOW()),
(950000000000001176, NULL, '4612', 'Nguồn kinh phí sự nghiệp năm nay', 'Government sourced funds of current year', 'equity', 'credit', '461', true, 1770, NULL, NOW(), NOW()),
(950000000000001177, NULL, '466', 'Nguồn kinh phí đã hình thành TSCĐ', 'Non-business funds used for fixed asset acquisitions', 'equity', 'credit', NULL, true, 1780, NULL, NOW(), NOW()),
(950000000000001178, NULL, '511', 'Doanh thu bán hàng và cung cấp dịch vụ', 'Revenues', 'revenue', 'credit', NULL, true, 1790, NULL, NOW(), NOW()),
(950000000000001179, NULL, '5111', 'Doanh thu bán hàng hóa', 'Revenue from sales of merchandises', 'revenue', 'credit', '511', true, 1800, NULL, NOW(), NOW()),
(950000000000001180, NULL, '5112', 'Doanh thu bán các thành phẩm', 'Revenue from sales of finished goods', 'revenue', 'credit', '511', true, 1810, NULL, NOW(), NOW()),
(950000000000001181, NULL, '5113', 'Doanh thu cung cấp dịch vụ', 'Revenue from services rendered', 'revenue', 'credit', '511', true, 1820, NULL, NOW(), NOW()),
(950000000000001182, NULL, '5114', 'Doanh thu trợ cấp, trợ giá', 'Revenue from government grants', 'revenue', 'credit', '511', true, 1830, NULL, NOW(), NOW()),
(950000000000001183, NULL, '5117', 'Doanh thu kinh doanh bất động sản đầu tư', 'Revenue from investment properties', 'revenue', 'credit', '511', true, 1840, NULL, NOW(), NOW()),
(950000000000001184, NULL, '5118', 'Doanh thu khác', 'Other revenue', 'revenue', 'credit', '511', true, 1850, NULL, NOW(), NOW()),
(950000000000001185, NULL, '515', 'Doanh thu hoạt động tài chính', 'Financial income', 'revenue', 'credit', NULL, true, 1860, NULL, NOW(), NOW()),
(950000000000001186, NULL, '521', 'Các khoản giảm trừ doanh thu', 'Revenue deductions', 'revenue', 'credit', NULL, true, 1870, NULL, NOW(), NOW()),
(950000000000001187, NULL, '5211', 'Chiết khấu thương mại', 'Sales discounts', 'revenue', 'credit', '521', true, 1880, NULL, NOW(), NOW()),
(950000000000001188, NULL, '5212', 'Giảm giá hàng bán', 'Sales allowances', 'revenue', 'credit', '521', true, 1890, NULL, NOW(), NOW()),
(950000000000001189, NULL, '5213', 'Hàng bán bị trả lại', 'Sales returns', 'revenue', 'credit', '521', true, 1900, NULL, NOW(), NOW()),
(950000000000001190, NULL, '611', 'Mua hàng', 'Purchases', 'expense', 'debit', NULL, true, 1910, NULL, NOW(), NOW()),
(950000000000001191, NULL, '6111', 'Mua nguyên liệu, vật liệu', 'Raw material purchases', 'expense', 'debit', '611', true, 1920, NULL, NOW(), NOW()),
(950000000000001192, NULL, '6112', 'Mua hàng hóa', 'Goods purchases', 'expense', 'debit', '611', true, 1930, NULL, NOW(), NOW()),
(950000000000001193, NULL, '621', 'Chi phí nguyên liệu, vật liệu trực tiếp', 'Direct raw materials costs', 'expense', 'debit', NULL, true, 1940, NULL, NOW(), NOW()),
(950000000000001194, NULL, '622', 'Chi phí nhân công trực tiếp', 'Direct labor costs', 'expense', 'debit', NULL, true, 1950, NULL, NOW(), NOW()),
(950000000000001195, NULL, '623', 'Chi phí sử dụng máy thi công', 'Costs of construction machinery', 'expense', 'debit', NULL, true, 1960, NULL, NOW(), NOW()),
(950000000000001196, NULL, '6231', 'Chi phí nhân công', 'Labor cost', 'expense', 'debit', '623', true, 1970, NULL, NOW(), NOW()),
(950000000000001197, NULL, '6232', 'Chi phí vật liệu', 'Material cost', 'expense', 'debit', '623', true, 1980, NULL, NOW(), NOW()),
(950000000000001198, NULL, '6233', 'Chi phí dụng cụ sản xuất', 'Tools and instruments', 'expense', 'debit', '623', true, 1990, NULL, NOW(), NOW()),
(950000000000001199, NULL, '6234', 'Chi phí khấu hao máy thi công', 'Depreciation expense', 'expense', 'debit', '623', true, 2000, NULL, NOW(), NOW()),
(950000000000001200, NULL, '6237', 'Chi phí dịch vụ mua ngoài', 'Outside services', 'expense', 'debit', '623', true, 2010, NULL, NOW(), NOW()),
(950000000000001201, NULL, '6238', 'Chi phí bằng tiền khác', 'Other expenses', 'expense', 'debit', '623', true, 2020, NULL, NOW(), NOW()),
(950000000000001202, NULL, '627', 'Chi phí sản xuất chung', 'Production overheads', 'expense', 'debit', NULL, true, 2030, NULL, NOW(), NOW()),
(950000000000001203, NULL, '6271', 'Chi phí nhân viên phân xưởng', 'Factory staff costs', 'expense', 'debit', '627', true, 2040, NULL, NOW(), NOW()),
(950000000000001204, NULL, '6272', 'Chi phí nguyên, vật liệu', 'Material cost', 'expense', 'debit', '627', true, 2050, NULL, NOW(), NOW()),
(950000000000001205, NULL, '6273', 'Chi phí dụng cụ sản xuất', 'Tools and instruments', 'expense', 'debit', '627', true, 2060, NULL, NOW(), NOW()),
(950000000000001206, NULL, '6274', 'Chi phí khấu hao TSCĐ', 'Fixed asset depreciation', 'expense', 'debit', '627', true, 2070, NULL, NOW(), NOW()),
(950000000000001207, NULL, '6277', 'Chi phí dịch vụ mua ngoài', 'Outside services', 'expense', 'debit', '627', true, 2080, NULL, NOW(), NOW()),
(950000000000001208, NULL, '6278', 'Chi phí bằng tiền khác', 'Other expenses', 'expense', 'debit', '627', true, 2090, NULL, NOW(), NOW()),
(950000000000001209, NULL, '631', 'Giá thành sản xuất', 'Production costs', 'expense', 'debit', NULL, true, 2100, NULL, NOW(), NOW()),
(950000000000001210, NULL, '632', 'Giá vốn hàng bán', 'Costs of goods sold', 'expense', 'debit', NULL, true, 2110, NULL, NOW(), NOW()),
(950000000000001211, NULL, '635', 'Chi phí tài chính', 'Financial expenses', 'expense', 'debit', NULL, true, 2120, NULL, NOW(), NOW()),
(950000000000001212, NULL, '641', 'Chi phí bán hàng', 'Selling expenses', 'expense', 'debit', NULL, true, 2130, NULL, NOW(), NOW()),
(950000000000001213, NULL, '6411', 'Chi phí nhân viên', 'Employees costs', 'expense', 'debit', '641', true, 2140, NULL, NOW(), NOW()),
(950000000000001214, NULL, '6412', 'Chi phí vật liệu, bao bì', 'Materials and packing materials', 'expense', 'debit', '641', true, 2150, NULL, NOW(), NOW()),
(950000000000001215, NULL, '6413', 'Chi phí dụng cụ, đồ dùng', 'Tools and instruments', 'expense', 'debit', '641', true, 2160, NULL, NOW(), NOW()),
(950000000000001216, NULL, '6414', 'Chi phí khấu hao TSCĐ', 'Fixed asset depreciation', 'expense', 'debit', '641', true, 2170, NULL, NOW(), NOW()),
(950000000000001217, NULL, '6415', 'Chi phí bảo hành', 'Warranty expenses', 'expense', 'debit', '641', true, 2180, NULL, NOW(), NOW()),
(950000000000001218, NULL, '6417', 'Chi phí dịch vụ mua ngoài', 'Outside services', 'expense', 'debit', '641', true, 2190, NULL, NOW(), NOW()),
(950000000000001219, NULL, '6418', 'Chi phí bằng tiền khác', 'Other costs', 'expense', 'debit', '641', true, 2200, NULL, NOW(), NOW()),
(950000000000001220, NULL, '642', 'Chi phí quản lý doanh nghiệp', 'General & administration expenses', 'expense', 'debit', NULL, true, 2210, NULL, NOW(), NOW()),
(950000000000001221, NULL, '6421', 'Chi phí nhân viên quản lý', 'Employees cost', 'expense', 'debit', '642', true, 2220, NULL, NOW(), NOW()),
(950000000000001222, NULL, '6422', 'Chi phí vật liệu quản lý', 'Office supply expenses', 'expense', 'debit', '642', true, 2230, NULL, NOW(), NOW()),
(950000000000001223, NULL, '6423', 'Chi phí đồ dùng văn phòng', 'Stationery cost', 'expense', 'debit', '642', true, 2240, NULL, NOW(), NOW()),
(950000000000001224, NULL, '6424', 'Chi phí khấu hao TSCĐ', 'Fixed asset depreciation', 'expense', 'debit', '642', true, 2250, NULL, NOW(), NOW()),
(950000000000001225, NULL, '6425', 'Thuế, phí và lệ phí', 'Taxes, fees, charges', 'expense', 'debit', '642', true, 2260, NULL, NOW(), NOW()),
(950000000000001226, NULL, '6426', 'Chi phí dự phòng', 'Provision expenses', 'expense', 'debit', '642', true, 2270, NULL, NOW(), NOW()),
(950000000000001227, NULL, '6427', 'Chi phí dịch vụ mua ngoài', 'Outside services', 'expense', 'debit', '642', true, 2280, NULL, NOW(), NOW()),
(950000000000001228, NULL, '6428', 'Chi phí bằng tiền khác', 'Other costs', 'expense', 'debit', '642', true, 2290, NULL, NOW(), NOW()),
(950000000000001229, NULL, '711', 'Thu nhập khác', 'Other income', 'revenue', 'credit', NULL, true, 2300, NULL, NOW(), NOW()),
(950000000000001230, NULL, '811', 'Chi phí khác', 'Other expenses', 'expense', 'debit', NULL, true, 2310, NULL, NOW(), NOW()),
(950000000000001231, NULL, '821', 'Chi phí thuế thu nhập doanh nghiệp', 'Income tax expenses', 'expense', 'debit', NULL, true, 2320, NULL, NOW(), NOW()),
(950000000000001232, NULL, '8211', 'Chi phí thuế TNDN hiện hành', 'Current tax expenses', 'expense', 'debit', '821', true, 2330, NULL, NOW(), NOW()),
(950000000000001233, NULL, '8212', 'Chi phí thuế TNDN hoãn lại', 'Deferred tax expenses', 'expense', 'debit', '821', true, 2340, NULL, NOW(), NOW()),
(950000000000001234, NULL, '911', 'Xác định kết quả kinh doanh', 'Income Summary', 'expense', 'debit', NULL, true, 2350, NULL, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
-- ============================================
-- 2. EXCHANGE RATES
-- ============================================
INSERT INTO exchange_rates (
    id, date, from_currency, to_currency, rate, source, entered_by, notes,
    created_at, updated_at
) VALUES
(960000000000000001, '2026-04-01', 'USD', 'VND', 25350.00, 'vietcombank', 827066062380994560, 'Tỷ giá Vietcombank ngày 01/04/2026', NOW(), NOW()),
(960000000000000002, '2026-04-02', 'USD', 'VND', 25360.00, 'vietcombank', 827066062380994560, 'Tỷ giá Vietcombank ngày 02/04/2026', NOW(), NOW()),
(960000000000000003, '2026-04-03', 'USD', 'VND', 25340.00, 'vietcombank', 827066062380994560, 'Tỷ giá Vietcombank ngày 03/04/2026', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. ENTRY SEQUENCES
-- ============================================
INSERT INTO entry_sequences (id, prefix, year, month, seq_num)
VALUES
(970000000000000001, 'JE', 2026, 0, 2),
(970000000000000002, 'JE-REV', 2026, 0, 0)
ON CONFLICT (prefix, year) DO UPDATE SET seq_num = GREATEST(entry_sequences.seq_num, EXCLUDED.seq_num);

-- ============================================
-- 4. JOURNAL ENTRIES & LINES
-- ============================================
INSERT INTO journal_entries (
    id, customer_id, entry_number, type, status,
    entry_date, posted_at, source_type, source_id,
    total_debit, total_credit, currency,
    created_by, notes, created_at, updated_at
) VALUES (
    980000000000000001,
    NULL,
    'JE-2026-000001',
    'invoice_issued',
    'posted',
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15',
    'invoice',
    831040602526191703,
    1200000,
    1200000,
    'VND',
    NULL,
    'Xuất hóa đơn INV-2026-0001 cho property #831040602526191616',
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO journal_lines (
    id, journal_entry_id, account_code, account_name,
    debit_amount, credit_amount, currency, description, sort_order, created_at
) VALUES
(980000000000000101, 980000000000000001, '131', 'Phải thu của khách hàng', 1200000, 0, 'VND', 'Xuất hóa đơn INV-2026-0001 cho property #831040602526191616', 1, NOW()),
(980000000000000102, 980000000000000001, '5113', 'Doanh thu cung cấp dịch vụ', 0, 1200000, 'VND', 'Xuất hóa đơn INV-2026-0001 cho property #831040602526191616', 2, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO journal_entries (
    id, customer_id, entry_number, type, status,
    entry_date, posted_at, source_type, source_id,
    total_debit, total_credit, currency,
    created_by, notes, created_at, updated_at
) VALUES (
    980000000000000002,
    NULL,
    'JE-2026-000002',
    'payment_received',
    'posted',
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15',
    'billing_record',
    831040602526191702,
    1200000,
    1200000,
    'VND',
    NULL,
    'Thu tiền thanh toán hóa đơn - property #831040602526191616',
    '2026-04-01 13:25:15',
    '2026-04-01 13:25:15'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO journal_lines (
    id, journal_entry_id, account_code, account_name,
    debit_amount, credit_amount, currency, description, sort_order, created_at
) VALUES
(980000000000000201, 980000000000000002, '1121', 'Tiền gửi ngân hàng - VND', 1200000, 0, 'VND', 'Thu tiền thanh toán hóa đơn - property #831040602526191616 - Mã GD: BANK-2026-0001', 1, NOW()),
(980000000000000202, 980000000000000002, '131', 'Phải thu của khách hàng', 0, 1200000, 'VND', 'Thu tiền thanh toán hóa đơn - property #831040602526191616 - Mã GD: BANK-2026-0001', 2, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DEFAULT MEDIA FOR ADMIN AVATAR
-- ============================================
CREATE TABLE IF NOT EXISTS public.medias (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    path VARCHAR(500),
    type VARCHAR(50),
    status VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    module VARCHAR(50),
    resource VARCHAR(50),
    resource_id BIGINT,
    user_id BIGINT,
    property VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.galleries (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    description TEXT,
    total_images INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id BIGINT PRIMARY KEY,
    gallery_id BIGINT,
    media_id BIGINT,
    alt VARCHAR(255),
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.medias (
    id,
    name,
    path,
    type,
    status,
    is_deleted,
    module,
    resource,
    resource_id,
    user_id,
    property,
    created_at,
    updated_at
) VALUES 
(847648078990151681, 'glyphs-1779932690233.png', 'vietstrix/avatar/glyphs-1779932690233.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151682, 'glyphs-1779932827300.png', 'vietstrix/avatar/glyphs-1779932827300.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151683, 'glyphs-1779934880128.png', 'vietstrix/avatar/glyphs-1779934880128.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151684, 'glyphs-1779934883907.png', 'vietstrix/avatar/glyphs-1779934883907.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151685, 'glyphs-1779934888222.png', 'vietstrix/avatar/glyphs-1779934888222.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151686, 'glyphs-1779934892711.png', 'vietstrix/avatar/glyphs-1779934892711.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151687, 'glyphs-1779934899515.png', 'vietstrix/avatar/glyphs-1779934899515.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151688, 'glyphs-1779934903531.png', 'vietstrix/avatar/glyphs-1779934903531.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151689, 'glyphs-1779934907529.png', 'vietstrix/avatar/glyphs-1779934907529.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151690, 'glyphs-1779934911559.png', 'vietstrix/avatar/glyphs-1779934911559.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151691, 'glyphs-1779934957955.png', 'vietstrix/avatar/glyphs-1779934957955.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151692, 'glyphs-1779934969539.png', 'vietstrix/avatar/glyphs-1779934969539.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151693, 'glyphs-1779934973418.png', 'vietstrix/avatar/glyphs-1779934973418.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151694, 'glyphs-1779934987032.png', 'vietstrix/avatar/glyphs-1779934987032.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151695, 'glyphs-1779934991260.png', 'vietstrix/avatar/glyphs-1779934991260.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151696, 'glyphs-1779934994951.png', 'vietstrix/avatar/glyphs-1779934994951.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151697, 'glyphs-1779934999001.png', 'vietstrix/avatar/glyphs-1779934999001.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151698, 'glyphs-1779935002605.png', 'vietstrix/avatar/glyphs-1779935002605.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151699, 'glyphs-1779935057226.png', 'vietstrix/avatar/glyphs-1779935057226.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151700, 'glyphs-1779935077269.png', 'vietstrix/avatar/glyphs-1779935077269.png', 'image', 'uploaded', false, 'avatar', NULL, NULL, 827066062380994561, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED SYSTEM AVATAR GALLERY
-- ============================================
INSERT INTO public.galleries (id, name, slug, description, total_images, created_at, updated_at)
VALUES (847648078990151750, 'avatar', 'avatar', 'System avatar collection', 21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Link all seeded avatar media IDs to the system avatar gallery
INSERT INTO public.gallery_images (id, gallery_id, media_id, alt, tags, created_at, updated_at) VALUES
(847648078990151801, 847648078990151750, 847648078990151681, 'avatar1', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151802, 847648078990151750, 847648078990151682, 'avatar2', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151803, 847648078990151750, 847648078990151683, 'avatar3', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151804, 847648078990151750, 847648078990151684, 'avatar4', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151805, 847648078990151750, 847648078990151685, 'avatar5', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151806, 847648078990151750, 847648078990151686, 'avatar6', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151807, 847648078990151750, 847648078990151687, 'avatar7', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151808, 847648078990151750, 847648078990151688, 'avatar8', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151809, 847648078990151750, 847648078990151689, 'avatar9', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151810, 847648078990151750, 847648078990151690, 'avatar10', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151811, 847648078990151750, 847648078990151691, 'avatar11', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151812, 847648078990151750, 847648078990151692, 'avatar12', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151813, 847648078990151750, 847648078990151693, 'avatar13', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151814, 847648078990151750, 847648078990151694, 'avatar14', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151815, 847648078990151750, 847648078990151695, 'avatar15', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151816, 847648078990151750, 847648078990151696, 'avatar16', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151817, 847648078990151750, 847648078990151697, 'avatar17', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151818, 847648078990151750, 847648078990151698, 'avatar18', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151819, 847648078990151750, 847648078990151699, 'avatar19', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(847648078990151820, 847648078990151750, 847648078990151700, 'avatar20', 'avatar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ANALYZE ACCOUNTING TABLES
-- ============================================
ANALYZE exchange_rates;
ANALYZE chart_of_accounts;
ANALYZE entry_sequences;
ANALYZE journal_entries;
ANALYZE journal_lines;
ANALYZE quotes;
ANALYZE billing_line_items;   -- FIX: was quote_line_items (bảng không tồn tại)
ANALYZE refunds;
ANALYZE notification_logs;
ANALYZE addons;
ANALYZE addon_prices;
ANALYZE subscription_addons;
ANALYZE coupons;
ANALYZE coupon_codes;