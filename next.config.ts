import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	output: "standalone",

	reactStrictMode: true,

	// Optimize CSS and JavaScript
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},

	// Enable experimental features for better performance
	experimental: {
		optimizePackageImports: ["react-icons", "lucide-react"],
	},

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "hcm03.vstorage.vngcloud.vn",
			},
			{
				protocol: "https",
				hostname: "img.youtube.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
		],
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},

	async rewrites() {
		// Use environment variable for API URL (gRPC Auth Server / Gateway)
		const apiUrl =
			process.env.NEXT_PUBLIC_API_URL ||
			process.env.NEXT_PUBLIC_BASE_URL ||
			process.env.GRPC_AUTH_SERVER_URL ||
			"https://grpc.vietstrix.com";

		return [
			// Local gRPC Auth Route Handler Aliases
			{
				source: "/api/root/v1/auth/:path*",
				destination: "/api/v1/auth/:path*",
			},
			// Internal Admin Route Aliases
			{
				source: "/api/v1/admin/service-categories",
				destination: "/api/v1/catalog/categories",
			},
			{
				source: "/api/v1/admin/service-categories/:path*",
				destination: "/api/v1/catalog/categories/:path*",
			},
			{
				source: "/api/v1/admin/service-items",
				destination: "/api/v1/catalog/items",
			},
			{
				source: "/api/v1/admin/service-items/:path*",
				destination: "/api/v1/catalog/items/:path*",
			},
			{
				source: "/api/v1/admin/plans",
				destination: "/api/v1/catalog/plans",
			},
			{
				source: "/api/v1/admin/plans/:path*",
				destination: "/api/v1/catalog/plans/:path*",
			},
			{
				source: "/api/v1/admin/subscriptions",
				destination: "/api/v1/subscriptions",
			},
			{
				source: "/api/v1/admin/subscriptions/:path*",
				destination: "/api/v1/subscriptions/:path*",
			},
			{
				source: "/api/v1/admin/invoices",
				destination: "/api/v1/invoices",
			},
			{
				source: "/api/v1/admin/invoices/:path*",
				destination: "/api/v1/invoices/:path*",
			},
			{
				source: "/api/v1/admin/customers",
				destination: "/api/v1/customers",
			},
			{
				source: "/api/v1/admin/customers/:path*",
				destination: "/api/v1/customers/:path*",
			},
			{
				source: "/api/v1/admin/accounting/journal-entries",
				destination: "/api/v1/accounting/journal-entries",
			},
			{
				source: "/api/v1/admin/accounting/journal-entries/:path*",
				destination: "/api/v1/accounting/journal-entries/:path*",
			},
			// Detail [id] alias routes
			{
				source: "/api/v1/admin/subscriptions/:id",
				destination: "/api/v1/subscriptions/:id",
			},
			{
				source: "/api/v1/admin/invoices/:id",
				destination: "/api/v1/invoices/:id",
			},
			{
				source: "/api/v1/admin/addons/:id",
				destination: "/api/v1/addons/:id",
			},
			{
				source: "/api/v1/admin/coupons/:id",
				destination: "/api/v1/coupons/:id",
			},
			{
				source: "/api/v1/admin/quotes/:id",
				destination: "/api/v1/quotes/:id",
			},
			{
				source: "/api/v1/admin/service-categories/:id",
				destination: "/api/v1/catalog/categories/:id",
			},
			{
				source: "/api/v1/admin/service-items/:id",
				destination: "/api/v1/catalog/items/:id",
			},
			{
				source: "/api/v1/admin/plans/:id",
				destination: "/api/v1/catalog/plans/:id",
			},
			// Billing statistics
			{
				source: "/api/v1/admin/billing/statistics/:path*",
				destination: "/api/v1/billing/statistics/:path*",
			},
			// External fallback rewrites
			{
				source: "/api/v1/:path*",
				destination: `${apiUrl}/api/v1/:path*`,
			},
			{
				source: "/api/root/v1/:path*",
				destination: "/api/v1/:path*",
			},
		];
	},



	async headers() {
		return [
			{
				source: "/:all*(svg|jpg|png|webp|avif)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/_next/static/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/admin/monitor/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value:
							"default-src 'self'; frame-src 'self' http://localhost:3001 https://*.grafana.net; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
					},
				],
			},
		];
	},
};

export default nextConfig;


