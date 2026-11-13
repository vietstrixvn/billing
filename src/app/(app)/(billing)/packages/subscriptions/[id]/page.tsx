'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Layers,
  Package,
  Plus,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  SubscriptionDetail,
  SubscriptionLogList,
  BillingRecordList,
  SubscriptionAddonList,
} from '@/libs/responses';
import {
  SubscriptionLogTable,
  BillingRecordTable,
  SubscriptionAddonTable,
} from '@/components/tables/billing';
import { useSubscriptionAddonsCost } from '@/hooks/billing';
import { AddSubscriptionAddonDialog } from '@/components/dialogs/billing/add-subscription-addon.dialog';
import { formatSmartDate } from '@/utils';
import { ErrorCustom } from '@/components/loading/error_custom';
import { ChangeSubscriptionStatusDialog } from '@/components/dialogs/billing/change-subscription-status.dialog';
import { ChangeSubscriptionPlanDialog } from '@/components/dialogs/billing/change-subscription-plan.dialog';
import { UpdateBillingDialog } from '@/components/dialogs/billing/update-billing.dialog';
import { ToggleAutoRenewDialog } from '@/components/dialogs/billing/toggle-auto-renew.dialog';
import { ExtendSubscriptionDialog } from '@/components/dialogs/billing/extend-subscription-dialog';
import { RenewSubscriptionDialog } from '@/components/dialogs/billing/renew-subscription.dialog';
import { ProvisionResultDialog } from '@/components/dialogs/billing/provision-result.dialog';
import type { ProvisionResult } from '@/types/billing/responses';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddAddonDialog, setShowAddAddonDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [showUpdateBillingDialog, setShowUpdateBillingDialog] = useState(false);
  const [showToggleAutoRenewDialog, setShowToggleAutoRenewDialog] =
    useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [renewResult, setRenewResult] = useState<ProvisionResult | null>(null);
  const [showRenewResult, setShowRenewResult] = useState(false);

  const { subscription, isLoading, isError } = SubscriptionDetail(
    id,
    refreshKey
  );

  const {
    logs,
    isLoading: logsLoading,
    isError: logsError,
  } = SubscriptionLogList(id, refreshKey);

  const {
    records,
    isLoading: recordsLoading,
    isError: recordsError,
  } = BillingRecordList(1, { subscription_id: id }, refreshKey);

  const {
    addons,
    isLoading: addonsLoading,
    isError: addonsError,
  } = SubscriptionAddonList(id, refreshKey);

  const { data: addonsCostData } = useSubscriptionAddonsCost(id, refreshKey);
  const addonsCost = addonsCostData?.data;

  useEffect(() => {
    if (searchParams.get('action') === 'renew') {
      setShowRenewDialog(true);
    }
  }, [searchParams]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    trial: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Trial' },
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
    suspended: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      label: 'Suspended',
    },
    cancelled: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Cancelled',
    },
  };

  const getStatusStyle = (status: string) =>
    statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !subscription) {
    return <ErrorCustom />;
  }

  const statusStyle = getStatusStyle(subscription.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/packages/subscriptions')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Subscription Details
            </h1>
            <p className="text-sm text-gray-500">ID: {subscription.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-sm rounded-md font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.label}
          </span>
          <div className="flex flex-wrap gap-3">
            {[
              {
                label: 'Change Status',
                onClick: () => setShowStatusDialog(true),
              },
              {
                label: 'Extend Subscription',
                onClick: () => setShowExtendDialog(true),
              },
              {
                label: 'Renew',
                onClick: () => setShowRenewDialog(true),
              },
              {
                label: 'Change Plan',
                onClick: () => setShowChangePlanDialog(true),
              },
              {
                label: 'Update Billing',
                onClick: () => setShowUpdateBillingDialog(true),
              },
            ].map(({ label, onClick }) => (
              <Button
                key={label}
                onClick={onClick}
                className="rounded-none border-b-2 border-b-blue-500 bg-white text-blue-500 shadow-md hover:bg-primary-50 hover:brightness-90 transition-all"
              >
                {label}
              </Button>
            ))}

            {subscription.auto_renew !== undefined && (
              <Button
                className="rounded-none border-b-2 border-b-main bg-white text-main shadow-md hover:bg-primary-50 hover:brightness-90 transition-all"
                onClick={() => setShowToggleAutoRenewDialog(true)}
              >
                {subscription.auto_renew ? 'Disable' : 'Enable'} Auto-Renewal
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-main text-white">
          <TabsTrigger value="info">Subscription Info</TabsTrigger>
          <TabsTrigger value="addons">
            Addons ({addons.length})
          </TabsTrigger>
          <TabsTrigger value="records">Billing Records</TabsTrigger>
          <TabsTrigger value="logs">Change Logs</TabsTrigger>
        </TabsList>

        {/* Tab 1: Subscription Information */}
        <TabsContent value="info" className="space-y-6">
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
                  <p className="text-base font-mono">
                    {subscription.property_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Plan Code
                  </label>
                  <p className="text-base font-mono">
                    {subscription.plan_code}
                  </p>
                </div>
                {subscription.plan && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Plan Name
                    </label>
                    <p className="text-base">{subscription.plan.name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-base capitalize">{subscription.status}</p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.billing_cycle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Billing Cycle
                    </label>
                    <p className="text-base capitalize">
                      {subscription.billing_cycle.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {subscription.billing_amount !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Billing Amount
                    </label>
                    <p className="text-base font-semibold text-main">
                      {subscription.billing_amount.toLocaleString()}{' '}
                      {subscription.currency || 'VND'}
                    </p>
                  </div>
                )}
                {subscription.original_price !== undefined &&
                  subscription.original_price > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Original Price
                      </label>
                      <p className="text-base text-gray-600 line-through">
                        {subscription.original_price.toLocaleString()}{' '}
                        {subscription.currency || 'VND'}
                      </p>
                    </div>
                  )}
                {subscription.discount_amount !== undefined &&
                  subscription.discount_amount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Discount Applied
                      </label>
                      <p className="text-base text-green-600 font-medium">
                        -{subscription.discount_amount.toLocaleString()}{' '}
                        {subscription.currency || 'VND'}
                        {subscription.discount_code && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {subscription.discount_code}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                {subscription.auto_renew !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Auto-Renewal
                    </label>
                    <p className="text-base">
                      {subscription.auto_renew ? (
                        <span className="text-green-600 font-medium">
                          Enabled
                        </span>
                      ) : (
                        <span className="text-gray-600">Disabled</span>
                      )}
                    </p>
                  </div>
                )}
                {subscription.days_until_expiry !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Days Until Expiry
                    </label>
                    <p
                      className={`text-base font-medium ${subscription.days_until_expiry < 7
                        ? 'text-red-600'
                        : subscription.days_until_expiry < 30
                          ? 'text-orange-600'
                          : 'text-green-600'
                        }`}
                    >
                      {subscription.days_until_expiry} days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Started At
                  </label>
                  <p className="text-base">
                    {formatSmartDate(subscription.started_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Expires At
                  </label>
                  <p className="text-base">
                    {formatSmartDate(subscription.expires_at)}
                  </p>
                </div>
                {subscription.trial_ends_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trial Ends At
                    </label>
                    <p className="text-base">
                      {formatSmartDate(subscription.trial_ends_at)}
                    </p>
                  </div>
                )}
                {subscription.next_billing_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Next Billing At
                    </label>
                    <p className="text-base font-medium text-blue-600">
                      {formatSmartDate(subscription.next_billing_at)}
                    </p>
                  </div>
                )}
                {subscription.cancelled_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Cancelled At
                    </label>
                    <p className="text-base text-red-600">
                      {formatSmartDate(subscription.cancelled_at)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <p className="text-base">
                    {formatSmartDate(subscription.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Updated At
                  </label>
                  <p className="text-base">
                    {formatSmartDate(subscription.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.override_by && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Override By
                    </label>
                    <p className="text-base font-mono">
                      {subscription.override_by}
                    </p>
                  </div>
                )}
                {subscription.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Notes
                    </label>
                    <p className="text-base text-gray-700">
                      {subscription.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Addons */}
        <TabsContent value="addons" className="space-y-6">
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Subscription addons
              </CardTitle>
              <Button
                className="bg-main text-white"
                size="sm"
                onClick={() => setShowAddAddonDialog(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add addon
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addonsCost && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
                  <span className="font-medium text-blue-800">
                    Estimated addon cost (recurring):{' '}
                  </span>
                  <span className="font-semibold">
                    {(addonsCost.cost ?? 0).toLocaleString()}{' '}
                    {addonsCost.currency ?? 'VND'}
                  </span>
                  <p className="mt-1 text-xs text-blue-600">
                    Included in renew / provision calculations via snapshot
                    prices.
                  </p>
                </div>
              )}
              <SubscriptionAddonTable
                subscriptionId={id}
                addons={addons}
                isLoading={addonsLoading}
                isError={addonsError}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Billing Records */}
        <TabsContent value="records" className="space-y-6">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BillingRecordTable
                records={records}
                isLoading={recordsLoading}
                isError={recordsError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Change Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Change Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionLogTable
                logs={logs}
                isLoading={logsLoading}
                isError={logsError}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ChangeSubscriptionStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        subscriptionId={id}
        currentStatus={subscription.status}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <ChangeSubscriptionPlanDialog
        open={showChangePlanDialog}
        onOpenChange={setShowChangePlanDialog}
        subscriptionId={id}
        currentPlanId={subscription.plan_id}
        currentPlanName={subscription.plan?.name}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <UpdateBillingDialog
        open={showUpdateBillingDialog}
        onOpenChange={setShowUpdateBillingDialog}
        subscriptionId={id}
        currentBillingCycle={subscription.billing_cycle}
        currentAmount={subscription.billing_amount}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <ToggleAutoRenewDialog
        open={showToggleAutoRenewDialog}
        onOpenChange={setShowToggleAutoRenewDialog}
        subscriptionId={id}
        currentValue={subscription.auto_renew ?? false}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <ExtendSubscriptionDialog
        open={showExtendDialog}
        onOpenChange={setShowExtendDialog}
        subscriptionId={id}
        currentExpiresAt={subscription.expires_at}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <RenewSubscriptionDialog
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
        subscriptionId={id}
        planCode={subscription.plan_code}
        onSuccess={(result) => {
          setRenewResult(result);
          setShowRenewResult(true);
          setRefreshKey((prev) => prev + 1);
        }}
      />
      <ProvisionResultDialog
        open={showRenewResult}
        onOpenChange={setShowRenewResult}
        result={renewResult}
        onDone={() => setRefreshKey((prev) => prev + 1)}
      />
      <AddSubscriptionAddonDialog
        open={showAddAddonDialog}
        onOpenChange={setShowAddAddonDialog}
        subscriptionId={id}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
