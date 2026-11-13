function deepFreeze<T>(obj: T): T {
  Object.getOwnPropertyNames(obj).forEach((key) => {
    const prop = (obj as any)[key];
    if (typeof prop === "object" && prop !== null) {
      deepFreeze(prop);
    }
  });
  return Object.freeze(obj);
}

type RouteMap = {
  readonly HOME: string;
  readonly COMPANY: string;
  readonly REPORT: string;

  // Auth routes
  readonly LOGIN: string;

  // Admin routes
  readonly DASHBOARD: string;


  // Billing
  readonly ADMIN_BILLING: string;
  readonly ADMIN_BILLING_PLANS: string;
  readonly ADMIN_BILLING_RECORDS: string;
  readonly ADMIN_BILLING_INVOICES: string;
  readonly ADMIN_BILLING_CATEGORIES: string;
  readonly ADMIN_BILLING_ITEMS: string;
  readonly ADMIN_BILLING_SUBSCRIPTIONS: string;

  // Profile
  readonly ADMIN_PROFILE: string;
  readonly ADMIN_PROFILE_SETTINGS: string;
  readonly ADMIN_PROFILE_SESSIONS: string;
  readonly ADMIN_PROFILE_HISTORY: string;
};

const PORTAL = "portal";

export const ROUTES: Readonly<RouteMap> = deepFreeze({
  HOME: `/${PORTAL}`,
  COMPANY: `/${PORTAL}/company`,
  REPORT: `/${PORTAL}/report`,
  // Auth routes
  LOGIN: "/sign-in",

  // Admin routes
  DASHBOARD: "/",
  ADMIN_ANALYTICS: "/analytics",
  ADMIN_HEALTH: "/health",


  // Billing
  ADMIN_BILLING: "/billing",
  ADMIN_BILLING_PLANS: "/billing/plans",
  ADMIN_BILLING_RECORDS: "/billing/records",
  ADMIN_BILLING_INVOICES: "/billing/invoices",
  ADMIN_BILLING_CATEGORIES: "/packages/categories",
  ADMIN_BILLING_ITEMS: "/packages/item",
  ADMIN_BILLING_SUBSCRIPTIONS: "/packages/subscriptions",

  // Profile
  ADMIN_PROFILE: "/profile",
  ADMIN_PROFILE_SETTINGS: "/profile/settings",
  ADMIN_PROFILE_SESSIONS: "/profile/sessions",
  ADMIN_PROFILE_HISTORY: "/profile/history",

} as const);
