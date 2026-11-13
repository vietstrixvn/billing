'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { useAuthStore } from '@/store';
import {
    CreditCard,
    TrendingUp,
    Receipt,
    Sparkles,
    ArrowUpRight,
    ShieldCheck,
    Building2,
    Clock,
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
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Doanh Thu Tháng
                        </span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-slate-900">0 ₫</span>
                        <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            +0.0% <ArrowUpRight className="h-3 w-3 ml-0.5" />
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">So với tháng trước</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Đăng Ký Đang Hoạt Động
                        </span>
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-slate-900">0</span>
                        <span className="text-xs text-slate-400">Subscriptions</span>
                    </div>
                    <p className="text-xs text-slate-500">Active recurring plans</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Hóa Đơn Đã Phát Hành
                        </span>
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <Receipt className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-slate-900">0</span>
                        <span className="text-xs text-slate-400">Invoices</span>
                    </div>
                    <p className="text-xs text-slate-500">Tổng hóa đơn ghi nhận</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Chờ Thanh Toán
                        </span>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-slate-900">0 ₫</span>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            0 Đơn
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">Cần xử lý quyết toán</p>
                </div>
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
                        href="/invoices"
                        className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
                        href="/subscriptions"
                        className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
                        className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
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
