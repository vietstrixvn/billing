'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CreditCard, FileText, User } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import { BillingRecordDetail } from '@/libs/responses';
import { formatSmartDate } from '@/utils';
import { ErrorCustom } from '@/components/loading/error_custom';
import { RefreshButton } from '@/components';
import { UpdateBillingStatusDialog } from '@/components/dialogs/billing/update-billing-status-dialog';
import type { BillingRecordStatus } from '@/types/billing/responses';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const { record, isLoading, isError } = BillingRecordDetail(id, refreshKey);

  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending',
    },
    paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Cancelled',
    },
    refunded: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Refunded',
    },
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const typeConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    invoice: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Invoice' },
    credit: { bg: 'bg-green-100', text: 'text-green-700', label: 'Credit' },
    adjustment: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Adjustment',
    },
  };

  const getStatusStyle = (status: string) =>
    statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    };

  const getTypeStyle = (type: string) =>
    typeConfig[type] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: type,
    };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !record) {
    return <ErrorCustom />;
  }

  const statusStyle = getStatusStyle(record.status);
  const typeStyle = getTypeStyle(record.type);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/billing/records')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Billing Record Details
            </h1>
            <p className="text-sm text-gray-500">Record ID: {record.id}</p>
          </div>
          <RefreshButton onClick={handleRefresh} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-sm rounded-md font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.label}
          </span>
          <span
            className={`px-3 py-1 text-sm rounded-md font-medium ${typeStyle.bg} ${typeStyle.text}`}
          >
            {typeStyle.label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Property ID
              </label>
              <p className="text-base font-mono">{record.property_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Subscription ID
              </label>
              <p className="text-base font-mono">{record.subscription_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Amount
              </label>
              <p className="text-xl font-bold text-main">
                {formatCurrency(record.amount, record.currency)}
              </p>
              {record.type === 'invoice' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-xs text-blue-700">
                  <span className="font-semibold">Auto-Sync:</span> This
                  amount is automatically synced with the invoice total when
                  invoice items are added or updated.
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-base capitalize">{record.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <p className="text-base capitalize">{record.status}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Payment Method
              </label>
              <p className="text-base">
                {record.payment_method || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Reference Code
              </label>
              <p className="text-base font-mono">
                {record.reference_code || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Billing Date
              </label>
              <p className="text-base">
                {formatSmartDate(record.billing_date)}
              </p>
            </div>
            {record.paid_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Paid At
                </label>
                <p className="text-base">{formatSmartDate(record.paid_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.notes ? (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Notes
                </label>
                <p className="text-base text-gray-700">{record.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No notes on this record.</p>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created At
              </label>
              <p className="text-base">{formatSmartDate(record.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Updated At
              </label>
              <p className="text-base">{formatSmartDate(record.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/billing/records')}
        >
          Back to List
        </Button>
        <Button
          className="bg-main text-white hover:bg-primary-800"
          onClick={() => setShowStatusDialog(true)}
        >
          Update Status
        </Button>
      </div>

      <UpdateBillingStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        billingRecordId={id}
        currentStatus={record.status as BillingRecordStatus}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
