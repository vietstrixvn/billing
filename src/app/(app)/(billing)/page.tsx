'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { useAuthStore } from '@/store';
import {
    CreditCard,
    Receipt,
    ArrowUpRight,
    Plus,
    FileText,
    Activity,
    Package,
} from 'lucide-react';
import WelcomeBanner from '@/components/cards/wellcome.card';
import { Heading } from '@/components/customs/heading.custom';

export default function BillingDashboardPage() {
    const { data: user, isLoading } = useCurrentUser();
    const authStoreUser = useAuthStore((state) => state.userInfo);

    const displayName =
        user?.first_name || user?.username || authStoreUser?.first_name || 'Quản trị viên';

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-8">
            <Heading
                name="Dashboard Monitoring"
                desc="Overview of your operation portal"
            />
            {/* Welcome Hero Banner */}
            <WelcomeBanner />
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-indigo-600" />
                    Quick Actions
                </h2>
            </div>
            {/* Quick Click Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Link
                    href="/billing/records/create"
                    className="group bg-white p-5 border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-4"
                >
                    <div className="p-3 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Plus className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                                Create Invoice
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-1" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Tạo mới hóa đơn ghi nhận</p>
                    </div>
                </Link>

                <Link
                    href="/billing/quotes/create"
                    className="group bg-white p-5 border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex items-center gap-4"
                >
                    <div className="p-3 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors truncate">
                                Create Quote
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-1" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Soạn thảo báo giá khách hàng</p>
                    </div>
                </Link>

                <Link
                    href="/billing/records"
                    className="group bg-white p-5 border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-4"
                >
                    <div className="p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Receipt className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                                Invoice Management
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-1" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Danh sách & trạng thái hóa đơn</p>
                    </div>
                </Link>

                <Link
                    href="/packages/item"
                    className="group bg-white p-5 border border-slate-200/80 shadow-sm hover:border-orange-400 hover:shadow-md transition-all flex items-center gap-4"
                >
                    <div className="p-3 bg-orange-50 text-orange-600 group-hover:bg-orange-800 group-hover:text-white transition-colors">
                        <Package className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors truncate">
                                Item Management
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-1" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Danh mục sản phẩm & dịch vụ</p>
                    </div>
                </Link>
            </div>

            {/* Quick Access Modules */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        Phân Hệ Quản Lý Billing
                    </h2>
                    <span className="text-xs text-slate-500">Vietstrix Central Modules</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Link
                        href="/billing/records"
                        className="group bg-white p-6 border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <FileText className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Quản Lý Hóa Đơn</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Tạo hóa đơn, xem danh sách hóa đơn theo kỳ, xuất file PDF và theo dõi trạng thái thanh toán.
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/packages/subscriptions"
                        className="group bg-white p-6 border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Package className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Gói Dịch Vụ & Subscriptions</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Quản lý danh sách các gói dịch vụ (Monthly/Annual), gia hạn tự động và nâng cấp tài khoản.
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/accounting"
                        className="group bg-white p-6 border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Kế Toán & Báo Cáo</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Sổ cái tổng hợp (General Ledger), bảng cân đối phát sinh (Trial Balance) và báo cáo doanh thu.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
