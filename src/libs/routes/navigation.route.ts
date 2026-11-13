import { ComponentsIcons, Icons } from "../../assets/icons";
import { ROUTES } from "./routes";

const PORTAL = "portal";

export const sidebarData = {
  navMain: [
    {
      title: "Home",
      url: `/${PORTAL}`,
      icon: ComponentsIcons.Home,
      color: "#009CDE",
    },
    {
      title: "Dashboard",
      url: `${PORTAL}/dashboard`,
      icon: ComponentsIcons.LayoutDashboard,
      color: "#009CDE",
    },

    // {
    //   title: 'Monitor',
    //   url: '/monitor',
    //   icon: ComponentsIcons.GroupIcon,
    //   color: '#457205',
    // },
    {
      title: "Report",
      url: ROUTES.REPORT,
      icon: ComponentsIcons.ChartNoAxesGanttIcon,
      color: "#F5851E",
    },
    // {
    //   title: 'Members',
    //   url: '/member',
    //   icon: ComponentsIcons.Users,
    //   color: '#35063E',
    // },
  ],
  navSuport: [
    {
      title: "Ticket",
      url: "/ticket",
      icon: ComponentsIcons.Bug,
      color: "#FFF",
    },
  ],
};

export const adminData = {
  navMain: [
    {
      title: "Dashboard",
      url: ROUTES.DASHBOARD,
      icon: ComponentsIcons.LayoutDashboard,
    },
    {
      title: "Health",
      url: "/health",
      icon: Icons.HeartPulseIcon,
    },
  ],
  // CMS Navigation - These are placeholder links
  // The actual routes are under /properties/[propertyId]
  navPortfolio: [
    {
      title: "Category",
      url: "/cms/categories", // Navigate to properties to select a property first
      icon: ComponentsIcons.Shapes,
    },
    {
      title: "Post",
      url: "/cms/posts", // Navigate to properties to select a property first
      icon: ComponentsIcons.FileText,
    },
    {
      title: "Tag",
      url: "/cms/tags", // Navigate to properties to select a property first
      icon: ComponentsIcons.Newspaper,
    },
    {
      title: "Mentions",
      url: "/cms/mentions", // Navigate to properties to select a property first
      icon: ComponentsIcons.Newspaper,
    },
  ],

  navGallery: [
    {
      title: "Galleries",
      url: "/cms/galleries", // Navigate to properties to select a property first
      icon: ComponentsIcons.Shapes,
    },
  ],

  navContact: [
    {
      title: "Contact",
      url: "/contact", // Navigate to properties to select a property first
      icon: ComponentsIcons.Shapes,
    },
  ],

  navEmail: [
    {
      title: "Mail",
      url: "/mail",
      icon: ComponentsIcons.Mail,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: ComponentsIcons.FileText,
    },
    {
      title: "Logs",
      url: "/logs",
      icon: ComponentsIcons.Logs,
    },
    {
      title: "Send",
      url: "/send",
      icon: ComponentsIcons.Mail,
    },
  ],

  navCms: [
    {
      title: "Category",
      url: "category", // Will become: /properties/[propertyId]/category
      icon: ComponentsIcons.Shapes,
    },
    {
      title: "Post",
      url: "post", // Will become: /properties/[propertyId]/post
      icon: ComponentsIcons.FileText,
    },
    {
      title: "Tag",
      url: "mention", // Will become: /properties/[propertyId]/news
      icon: ComponentsIcons.Newspaper,
    },
  ],
  navDocument: [
    {
      title: "User",
      url: "user", // Will become: /properties/[propertyId]/document
      icon: ComponentsIcons.GroupIcon,
    },
    {
      title: "Blocked",
      url: "blocked", // Will become: /properties/[propertyId]/document
      icon: ComponentsIcons.ShieldBan,
    },
  ],
  navStatisCms: [
    {
      title: "Setting",
      url: "settings",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Gallery",
      url: "gallery",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Monitor",
      url: "monitor",
      icon: ComponentsIcons.Settings2,
    },
  ],
  navBilling: [
    {
      title: "Billing",
      url: "billing",
      icon: ComponentsIcons.ReceiptText,
    },
  ],
  navPlans: [
    {
      title: "Plans",
      url: "/billing/plans",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Records",
      url: "/billing/records",
      icon: ComponentsIcons.PieChart,
    },
  ],

  navJournal: [
    {
      title: "Journal Entries",
      url: "/accounting/journal",
      icon: ComponentsIcons.Settings2,
    },

  ],

  navExchange: [
    {
      title: "Exchange Rates",
      url: "/accounting/exchange-rates",
      icon: ComponentsIcons.Settings2,
    },
  ],

  navAccSetting: [
    {
      title: "Chart of Accounts",
      url: "/accounting/settings/chart-of-accounts",
      icon: ComponentsIcons.Settings2,
    },
  ],

  navReport: [
    {
      title: "Reports",
      url: "/accounting/reports",
      icon: ComponentsIcons.PieChart,
    },
    {
      title: "General Ledger",
      url: "/accounting/reports/general-ledger",
      icon: ComponentsIcons.PieChart,
    },
    {
      title: "Trial Balance",
      url: "/accounting/reports/trial-balance",
      icon: ComponentsIcons.PieChart,
    },
    {
      title: "Revenue",
      url: "/accounting/reports/revenue",
      icon: ComponentsIcons.PieChart,
    },
    {
      title: "Receivable Aging",
      url: "/accounting/reports/receivable-aging",
      icon: ComponentsIcons.PieChart,
    },
  ],

  navQuotes: [
    {
      title: "Quotes",
      url: "/billing/quotes",
      icon: ComponentsIcons.Settings2,
    },
    // {
    //   title: 'Overdue Invoices',
    //   url: '/billing/invoices/overdue',
    //   icon: ComponentsIcons.Settings2,
    // },
  ],

  navInvoices: [
    {
      title: "Invoices",
      url: "/billing/invoices",
      icon: ComponentsIcons.Settings2,
    },
    // {
    //   title: 'Overdue Invoices',
    //   url: '/billing/invoices/overdue',
    //   icon: ComponentsIcons.Settings2,
    // },
  ],

  navServiceItem: [
    {
      title: "Service Category",
      url: "/packages/categories",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Service Item",
      url: "/packages/item",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Coupons",
      url: "/packages/coupons",
      icon: ComponentsIcons.Settings2,
    },
    // {
    //   title: 'Statistics & Reports',
    //   url: '/billing/statistics',
    //   icon: ComponentsIcons.Settings2,
    // },
  ],

  navSubscriptions: [
    {
      title: "Sell package",
      url: "/packages/subscriptions/provision",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Subscriptions",
      url: "/packages/subscriptions",
      icon: ComponentsIcons.Settings2,
    },
    {
      title: "Expiring soon",
      url: "/packages/subscriptions/expiring",
      icon: ComponentsIcons.Settings2,
    },
  ],

  navHealth: [
    {
      title: "Category",
      url: "category",
      icon: ComponentsIcons.Shapes,
    },
    {
      title: "Blog",
      url: "blog",
      icon: ComponentsIcons.FileText,
    },
    {
      title: "News",
      url: "news",
      icon: ComponentsIcons.Newspaper,
    },
  ],


  // navTeam: [
  //   // {
  //   //   title: 'Team',
  //   //   url: ROUTES.ADMIN_TEAM,
  //   //   icon: ComponentsIcons.GroupIcon,
  //   //   items: [
  //   //     {
  //   //       title: 'All Team',
  //   //       url: ROUTES.ADMIN_TEAM,
  //   //     },
  //   //     {
  //   //       title: 'Create Team',
  //   //       url: '/team/create-team',
  //   //     },
  //   //   ],
  //   // },
  // ],
  navServices: [
    // {
    //   title: 'Project',
    //   url: '/project',
    //   icon: ComponentsIcons.List,
    // },
    // {
    //   title: 'Type',
    //   url: ROUTES.ADMIN_TYPE,
    //   icon: ComponentsIcons.ClipboardList,
    // },
    {
      title: "Report",
      url: "/report",
      icon: ComponentsIcons.ClipboardList,
    },
    {
      title: "Error",
      url: "/error",
      icon: ComponentsIcons.ClipboardList,
    },
  ],
};

export const navAdminItems = [
  {
    icon: ComponentsIcons.LayoutDashboard,
    href: "/",
    label: "Dashboard",
    roles: ["super_admin", "admin", "manager", "user"],
    resource: null, // Không cần permission, ai cũng vào được
  },
  {
    icon: ComponentsIcons.Users,
    href: "/customer",
    label: "Customer",
    roles: ["super_admin", "admin", "agency"],
    resource: "customer" as const,
  },
  {
    icon: ComponentsIcons.ReceiptText,
    href: "/billing",
    label: "Billing",
    roles: ["super_admin", "admin", "agency"],
    resource: "admin_user" as const,
  },
  {
    icon: ComponentsIcons.List,
    href: "/packages",
    label: "Packages",
    roles: ["super_admin", "admin", "agency"],
    resource: "customer" as const,
  },
  {
    icon: ComponentsIcons.DollarSign,
    href: "/accounting",
    label: "Accounting",
    roles: ["super_admin", "admin", "agency"],
    resource: "admin_user" as const,
  },
  {
    icon: ComponentsIcons.BarChart3,
    href: "/analytics",
    label: "Reports",
    roles: ["super_admin", "admin", "agency"],
    resource: "analytic" as const,
  },

];
