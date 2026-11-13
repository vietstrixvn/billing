/**
 * Centralized API Endpoints & Transport Handlers
 * Compatible with REST Gateway & gRPC Auth Service (proto/auth.proto)
 */

import { fetchWithAuth } from '@/store/utils';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vietstrix.com";
const partnerId = process.env.NEXT_PUBLIC_PARTNER_ID || "870362799967043584"; // Hoặc partner ID mặc định

// Base path chuẩn chứa partnerId: https://api.vietstrix.com/api/root/v1/keng_vietnam
const apiPath = `${baseUrl.replace(/\/+$/, '')}/api/root/v1/${partnerId}`;

// Helper tự động xử lý gạch chéo
const buildUrl = (path: string) => `${apiPath}${path.startsWith('/') ? path : `/${path}`}`;

const buildLocalUrl = (path: string) => `/api/v1${path}`;

export const endpoints = {
  auth: {
    login: buildLocalUrl(`/auth/login`),
    logout: buildLocalUrl(`/auth/logout`),
    profile: buildLocalUrl(`/auth/profile`),
    password: buildLocalUrl(`/auth/password`),
    refresh: buildLocalUrl(`/auth/refresh`),
    otp: buildLocalUrl(`/auth/otp`),
    verify: buildLocalUrl(`/auth/verify`),
    bigin: buildLocalUrl(`/auth/passkeys/login/begin`),
    finish: buildLocalUrl(`/auth/passkeys/login/finish`),
  },
  two_fa: {
    setup: buildUrl(`/2fa/setup`),
    verify: buildUrl(`/2fa/verify`),
    disable: buildUrl(`/2fa/disable`),
    verifyLogin: buildUrl(`/2fa/verify-login`),
  },
  passkeys: {
    begin: buildUrl(`/passkeys/register/begin`),
    finish: buildUrl(`/passkeys/register/finish`),
    list: buildUrl(`/passkeys`),
    detail: (id: string) => buildUrl(`/passkeys/${id}`),
  },
  admin: {
    loginHistories: buildUrl(`/admin/login-histories`),
    sessions: buildUrl(`/admin/sessions`),
    root_sessions: buildUrl(`/admin/root-sessions`),
  },
  rbac: {
    roles: {
      list: buildUrl(`/rbac/roles`),
      detail: (id: string) => buildUrl(`/rbac/roles/${id}`),
    },
    permissions: {
      list: buildUrl(`/rbac/permissions`),
      detail: (id: string) => buildUrl(`/rbac/permissions/${id}`),
    },
    resources: {
      list: buildUrl(`/rbac/resources`),
      detail: (id: string) => buildUrl(`/rbac/resources/${id}`),
    },
    utils: {
      effectivePermissions: (userId: string) =>
        buildUrl(`/rbac/effective-permissions/${userId}`),
    },
    userRoles: {
      assign: buildUrl(`/rbac/user-roles/assign`),
      remove: buildUrl(`/rbac/user-roles/remove`),
    },
    rolePermissions: {
      list: (roleId: string) => buildUrl(`/rbac/role-permissions/${roleId}`),
      assign: (roleId: string) => buildUrl(`/rbac/role-permissions/${roleId}/assign`),
      remove: (roleId: string) => buildUrl(`/rbac/role-permissions/${roleId}/remove`),
    },
  },
  customers: {
    list: buildUrl(`/customers`),
    detail: (id: string) => buildUrl(`/customers/${id}`),
    billing: {
      billing: (id: string | number) => buildUrl(`/billing/properties/${id}/billing`),
      record: (id: string | number) => buildUrl(`/billing/properties/${id}/billing-records`),
      invoices: (id: string | number) => buildUrl(`/billing/properties/${id}/invoices`),
      subscriptions: (id: string | number) => buildUrl(`/billing/properties/${id}/subscriptions`),
      log: (id: string | number) => buildUrl(`/billing/properties/${id}/subscription-logs`),
    },
  },
  clients: {
    list: buildUrl(`/billing/clients`),
    detail: (id: string) => buildUrl(`/billing/clients/${id}`),
    create: buildUrl(`/billing/clients`),
    update: (id: string) => buildUrl(`/billing/clients/${id}`),
    delete: (id: string) => buildUrl(`/billing/clients/${id}`),
    contacts: {
      add: (clientId: string) => buildUrl(`/billing/clients/${clientId}/contacts`),
      update: (clientId: string, contactId: string) =>
        buildUrl(`/billing/clients/${clientId}/contacts/${contactId}`),
      delete: (clientId: string, contactId: string) =>
        buildUrl(`/billing/clients/${clientId}/contacts/${contactId}`),
    },
    invoices: (clientId: string) => buildUrl(`/billing/clients/${clientId}/invoices`),
  },
  customer: {
    billing: {
      billing: (id: string | number) => buildUrl(`/billing/properties/${id}/billing`),
      record: (id: string | number) => buildUrl(`/billing/properties/${id}/billing-records`),
      invoices: (id: string | number) => buildUrl(`/billing/properties/${id}/invoices`),
      subscriptions: (id: string | number) => buildUrl(`/billing/properties/${id}/subscriptions`),
      log: (id: string | number) => buildUrl(`/billing/properties/${id}/subscription-logs`),
    },
  },
  property: {
    billing: {
      billing: (id: string | number) => buildUrl(`/billing/properties/${id}/billing`),
      record: (id: string | number) => buildUrl(`/billing/properties/${id}/billing-records`),
      invoices: (id: string | number) => buildUrl(`/billing/properties/${id}/invoices`),
      subscriptions: (id: string | number) => buildUrl(`/billing/properties/${id}/subscriptions`),
      log: (id: string | number) => buildUrl(`/billing/properties/${id}/subscription-logs`),
    },
  },
  // ========================================================================
  // BILLING & ACCOUNTING ROUTES
  // ========================================================================

  // Service Categories
  service_category: {
    list: buildUrl(`/billing/service-categories`),
    detail: (id: string) => buildUrl(`/billing/service-categories/${id}`),
    code: (id: string) => buildUrl(`/billing/service-categories/code/${id}`),
  },

  // Service Items
  service_item: {
    list: buildUrl(`/billing/service-items`),
    detail: (id: string) => buildUrl(`/billing/service-items/${id}`),
    code: (id: string) => buildUrl(`/billing/service-items/code/${id}`),
  },

  // Item Prices
  item_prices: {
    // Get all prices for a service item
    list: (itemId: string) => buildUrl(`/billing/service-items/${itemId}/prices`),
    // Get active price for a service item
    active: (itemId: string) => buildUrl(`/billing/service-items/${itemId}/prices/active`),
    // Create new price for a service item
    create: (itemId: string) => buildUrl(`/billing/service-items/${itemId}/prices`),
    // Get/Update/Delete specific item price
    detail: (priceId: string) => buildUrl(`/packages/item-prices/${priceId}`),
    // Price Tiers Management
    tiers: (priceId: string) => buildUrl(`/packages/item-prices/${priceId}/tiers`),
  },

  // Plans
  plan: {
    list: buildUrl(`/billing/plans`),
    detail: (id: string) => buildUrl(`/billing/plans/${id}`),
    code: (id: string) => buildUrl(`/billing/plans/code/${id}`),
  },

  // Plan Included Items
  plan_items: {
    // Get plan included items
    list: (planId: string) => buildUrl(`/billing/plans/${planId}/included-items`),
    // Add item to plan
    add: (planId: string) => buildUrl(`/billing/plans/${planId}/included-items`),
    // Set all plan items (replace)
    set: (planId: string) => buildUrl(`/billing/plans/${planId}/included-items`),
    // Update/Delete specific plan included item
    detail: (id: string) => buildUrl(`/billing/plan-included-items/${id}`),
  },

  // Subscriptions
  subscriptions: {
    // List & Create
    list: buildUrl(`/packages/subscriptions`),
    // Get subscription by ID
    detail: (id: string) => buildUrl(`/packages/subscriptions/${id}`),
    // Update subscription status
    status: (id: string) => buildUrl(`/packages/subscriptions/${id}/status`),
    // Extend subscription
    extend: (id: string) => buildUrl(`/packages/subscriptions/${id}/extend`),
    // Change plan
    change_plan: (id: string) => buildUrl(`/packages/subscriptions/${id}/change-plan`),
    // Update billing info
    billing: (id: string) => buildUrl(`/packages/subscriptions/${id}/billing`),

    // Toggle auto-renewal
    auto_renew: (id: string) => buildUrl(`/packages/subscriptions/${id}/auto-renew`),
    // Cancel subscription (DELETE)
    cancel: (id: string) => buildUrl(`/packages/subscriptions/${id}`),
    // Get subscription logs
    logs: (id: string) => buildUrl(`/packages/subscriptions/${id}/logs`),
    // All subscription logs
    sub_log: buildUrl(`/billing/subscription-logs`),
    // Get subscription addons
    addons: (id: string) => buildUrl(`/packages/subscriptions/${id}/addons`),
    // Add addon to subscription
    add_addon: (id: string) => buildUrl(`/packages/subscriptions/${id}/addons`),

    provision: buildUrl(`/packages/subscriptions/provision`), // POST - flow chính
    renew: (id: string) => buildUrl(`/packages/subscriptions/${id}/renew`), // POST
    // addon cost
    addon_cost: (id: string) => buildUrl(`/packages/subscriptions/${id}/addons/cost`),

    items: (id: string) => buildUrl(`/packages/subscriptions/${id}/items`),
    update_qty: (id: string, itemId: string) => buildUrl(`/packages/subscriptions/${id}/items/${itemId}/quantity`),
    finalize: (id: string) => buildUrl(`/packages/subscriptions/${id}/finalize`),
  },

  // Subscription Addons
  subscription_addons: {
    detail: (id: string) => buildUrl(`/billing/subscription-addons/${id}`),
    quantity: (id: string) => buildUrl(`/billing/subscription-addons/${id}/quantity`),
    activate: (id: string) => buildUrl(`/billing/subscription-addons/${id}/activate`),
    deactivate: (id: string) => buildUrl(`/billing/subscription-addons/${id}/deactivate`),
    cost: (id: string) => buildUrl(`/billing/subscription-addons/${id}/cost`),
    remove: (subscriptionId: string, addonId: string) =>
      buildUrl(`/packages/subscriptions/${subscriptionId}/addons/${addonId}`), // DELETE
  },
  // Addons
  addons: {
    // List & Create addons
    list: buildUrl(`/billing/addons`),
    // Get/Update/Delete addon by ID
    detail: (id: string) => buildUrl(`/billing/addons/${id}`),
    // Get addon prices
    prices: (addonId: string) => buildUrl(`/billing/addons/${addonId}/prices`),
    // Create addon price
    create_price: (addonId: string) => buildUrl(`/billing/addons/${addonId}/prices`),

    slug: (slug: string) => buildUrl(`/billing/addons/slug/${slug}`),
    activate: (id: string) => buildUrl(`/billing/addons/${id}/activate`),
    deactivate: (id: string) => buildUrl(`/billing/addons/${id}/deactivate`),
  },

  addon_prices: {
    detail: (priceId: string) => buildUrl(`/billing/addon-prices/${priceId}`),
    active: (addonId: string) => buildUrl(`/billing/addons/${addonId}/prices/active`),
    activate: (id: string) => buildUrl(`/billing/addon-prices/${id}/activate`),
    deactivate: (id: string) => buildUrl(`/billing/addon-prices/${id}/deactivate`),
  },

  // Coupons
  coupons: {
    // Coupon endpoints
    list: buildUrl(`/billing/coupons`),
    detail: (id: string) => buildUrl(`/billing/coupons/${id}`),
    canRedeem: (id: string) => buildUrl(`/billing/coupons/${id}/can-redeem`),
    calculateDiscount: (id: string) => buildUrl(`/billing/coupons/${id}/calculate-discount`),

    // Coupon code endpoints
    codes: (couponId: string) => buildUrl(`/billing/coupons/${couponId}/codes`),
    generateCodes: (couponId: string) => buildUrl(`/billing/coupons/${couponId}/codes/generate`),
  },

  coupon_codes: {
    detail: (id: string) => buildUrl(`/billing/coupon-codes/${id}`),
    byCode: (code: string) => buildUrl(`/billing/coupon-codes/code/${code}`),
    validate: buildUrl(`/billing/coupon-codes/validate`),
    canRedeem: (code: string) => buildUrl(`/billing/coupon-codes/${code}/can-redeem`),
    redeem: (code: string) => buildUrl(`/billing/coupon-codes/${code}/redeem`),
    activate: (id: string) => buildUrl(`/billing/coupon-codes/${id}/activate`),
    deactivate: (id: string) => buildUrl(`/billing/coupon-codes/${id}/deactivate`),
  },

  // Quotes
  quotes: {
    // List & Create quotes
    list: buildUrl(`/billing/quotes`),
    // Get/Update/Delete quote by ID
    detail: (id: string) => buildUrl(`/billing/quotes/${id}`),
    // Get quote by number
    byNumber: (quoteNumber: string) => buildUrl(`/billing/quotes/number/${quoteNumber}`),
    // Quote actions
    status: (id: string) => buildUrl(`/billing/quotes/${id}/status`),
    send: (id: string) => buildUrl(`/billing/quotes/${id}/send`),
    approve: (id: string) => buildUrl(`/billing/quotes/${id}/approve`),
    reject: (id: string) => buildUrl(`/billing/quotes/${id}/reject`),
    expire: (id: string) => buildUrl(`/billing/quotes/${id}/expire`),
    recalculate: (id: string) => buildUrl(`/billing/quotes/${id}/recalculate`),
    createSubscription: (id: string) => buildUrl(`/billing/quotes/${id}/create-subscription`),
    // Quote line items
    lineItems: (quoteId: string) => buildUrl(`/billing/quotes/${quoteId}/line-items`),
    batchLineItems: (quoteId: string) => buildUrl(`/billing/quotes/${quoteId}/line-items/batch`),
    total: (quoteId: string) => buildUrl(`/billing/quotes/${quoteId}/total`),
  },

  // Quote Line Items
  quote_line_items: {
    // Get/Update/Delete specific line item
    detail: (id: string) => buildUrl(`/billing/quote-line-items/${id}`),
  },

  // Refunds
  refunds: {
    // List & Create refunds
    list: buildUrl(`/billing/refunds`),
    // Get/Delete refund by ID
    detail: (id: string) => buildUrl(`/billing/refunds/${id}`),
    // Update refund status
    status: (id: string) => buildUrl(`/billing/refunds/${id}/status`),
  },

  // Billing Records
  billing: {
    // Billing Records
    records: buildUrl(`/billing/billing-records`),
    detail: (id: string) => buildUrl(`/billing/billing-records/${id}`),
    status: (id: string) => buildUrl(`/billing/billing-records/${id}/status`),
  },

  // Invoices
  invoices: {
    // List & Create invoices
    list: buildUrl(`/billing/invoices`),
    // Get invoices by period
    period: buildUrl(`/billing/invoices/period`),
    // Get/Update/Delete invoice by ID
    detail: (id: number | string) => buildUrl(`/billing/invoices/${id}`),
  },

  // Invoice Items
  invoices_item: {
    detail: (invoiceId: number | string) => buildUrl(`/billing/invoices/${invoiceId}/items`),
    item: (id: string) => buildUrl(`/billing/invoice-items/${id}`),
    set: (invoiceId: number | string) => buildUrl(`/billing/invoices/${invoiceId}/items`),
  },

  // Billing Statistics
  billing_statistics: {
    overview: buildUrl(`/billing/statistics/overview`),
    revenue: buildUrl(`/billing/statistics/revenue`),
    subscriptions: buildUrl(`/billing/statistics/subscriptions`),
    payments: buildUrl(`/billing/statistics/payments`),
    expiring: buildUrl(`/billing/statistics/expiring`),
    alerts: buildUrl(`/billing/statistics/alerts`),
    plans: buildUrl(`/billing/statistics/plans`),
    invoices: buildUrl(`/billing/statistics/invoices`),
    top_customers: buildUrl(`/billing/statistics/top-customers`),
  },

  // Accounting
  accounting: {
    // Journal Entries — static paths first, param paths after
    journal_period: buildUrl(`/accounting/journal-entries/period`),
    journal_list: buildUrl(`/accounting/journal-entries`),
    journal_entries: (id: string) => buildUrl(`/accounting/journal-entries/${id}`),
    journal_reverse: (id: string) => buildUrl(`/accounting/journal-entries/${id}/reverse`),
    // Exchange Rates — static paths first, param paths after
    exchange_current: buildUrl(`/accounting/exchange-rates/current`),
    exchange_rates: buildUrl(`/accounting/exchange-rates`),
    // Chart of Accounts
    chart_of_accounts: buildUrl(`/accounting/chart-of-accounts`),
    // Reports
    report_general_ledger: buildUrl(`/accounting/reports/general-ledger`),
    report_trial_balance: buildUrl(`/accounting/reports/trial-balance`),
    report_revenue: buildUrl(`/accounting/reports/revenue`),
    report_receivable_aging: buildUrl(`/accounting/reports/receivable-aging`),
    report_journal_stats: buildUrl(`/accounting/reports/journal-stats`),
  },
};

/**
 * Common API fetch handler for hooks and stores
 */
export async function handleAPI<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<{ response: Response; data: T }> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetchWithAuth(url, options);
  if (!response) {
    throw new Error('Session expired or unauthorized request');
  }

  const data: T = await response.json();
  return { response, data };
}


