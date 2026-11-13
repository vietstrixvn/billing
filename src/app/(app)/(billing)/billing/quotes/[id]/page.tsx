'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heading } from '@/components';
import { Button, Skeleton } from '@/components/ui';
import { QuoteDetail, QuoteLineItemList } from '@/libs/responses';
import {
  useSendQuote,
  useApproveQuote,
  useRejectQuote,
  useExpireQuote,
  useRecalculateQuote,
  useCreateSubscriptionFromQuote,
  useDeleteQuote,
} from '@/hooks/billing';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Trash2,
  Plus,
} from 'lucide-react';
import { formatSmartDate } from '@/utils';
import { toast } from 'sonner';
import { QuestionDialog } from '@/components/panels/question.panel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { quote, isLoading, isError } = QuoteDetail(quoteId, refreshKey);
  const { items: lineItems, isLoading: itemsLoading } = QuoteLineItemList(
    quoteId,
    refreshKey
  );

  // Mutations
  const sendMutation = useSendQuote(quoteId);
  const approveMutation = useApproveQuote(quoteId);
  const rejectMutation = useRejectQuote(quoteId);
  const expireMutation = useExpireQuote(quoteId);
  const recalculateMutation = useRecalculateQuote(quoteId);
  const createSubMutation = useCreateSubscriptionFromQuote(quoteId);
  const deleteMutation = useDeleteQuote();

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync();
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send quote');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve quote');
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ reason: rejectReason });
      setShowRejectDialog(false);
      setRejectReason('');
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject quote');
    }
  };

  const handleExpire = async () => {
    try {
      await expireMutation.mutateAsync();
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to expire quote');
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculateMutation.mutateAsync();
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to recalculate quote');
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const response = await createSubMutation.mutateAsync();
      if (response?.data?.id) {
        toast.success('Subscription created successfully');
        router.push(`/packages/subscriptions/${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subscription');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(quoteId);
      setShowDeleteDialog(false);
      router.push('/billing/quotes');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete quote');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Approved',
      },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      expired: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        label: 'Expired',
      },
    };

    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span
        className={`px-3 py-1 text-sm rounded-md font-medium ${statusInfo.bg} ${statusInfo.text}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const canSend = quote?.status === 'draft';
  const canApprove = quote?.status === 'sent' || quote?.status === 'draft';
  const canReject = quote?.status === 'sent' || quote?.status === 'draft';
  const canExpire = quote?.status === 'sent';
  const canCreateSubscription =
    quote?.status === 'approved' && !quote?.subscription_id;
  const canDelete = quote?.status !== 'approved';
  const canEdit = quote?.status === 'draft';

  return (
    <PermissionGate
      resource="billing"
      action="read"
      fallback={<ForbiddenCard />}
    >
      <section>
        <div className="flex items-center justify-between mb-6">
          <Heading name="Quote Details" desc="View and manage quote" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !quote ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load quote details</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card with Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {quote.quote_number}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Property ID: {quote.property_id}
                  </p>
                </div>
                {getStatusBadge(quote.status)}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/billing/quotes/${quoteId}/file`)
                  }
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View PDF
                </Button>

                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/billing/quotes/${quoteId}/items`)
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Manage Line Items
                  </Button>
                )}

                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRecalculate}
                    disabled={recalculateMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`}
                    />
                    Recalculate
                  </Button>
                )}

                {canSend && (
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                    Send to Customer
                  </Button>
                )}

                {canApprove && (
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                )}

                {canReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                )}

                {canExpire && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExpire}
                    disabled={expireMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Mark Expired
                  </Button>
                )}

                {canCreateSubscription && (
                  <Button
                    size="sm"
                    onClick={handleCreateSubscription}
                    disabled={createSubMutation.isPending}
                    className="flex items-center gap-2 bg-main hover:bg-main-700"
                  >
                    <FileText className="w-4 h-4" />
                    Create Subscription
                  </Button>
                )}

                {canDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Total Amount
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(quote.total_amount, quote.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Billing Cycle
                  </p>
                  <p className="text-lg font-semibold text-gray-700 capitalize">
                    {quote.billing_cycle ? quote.billing_cycle.replace('_', ' ') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Valid Until
                  </p>
                  <p className="text-lg font-semibold text-gray-700">
                    {formatSmartDate(quote.valid_until)}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quote Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Sub Total
                  </p>
                  <p className="text-base text-gray-900">
                    {formatCurrency(quote.sub_total, quote.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Discount Amount
                  </p>
                  <p className="text-base text-gray-900">
                    {formatCurrency(quote.discount_amount, quote.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Tax Amount
                  </p>
                  <p className="text-base text-gray-900">
                    {formatCurrency(quote.tax_amount, quote.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Created By
                  </p>
                  <p className="text-base text-gray-900">
                    User ID: {quote.created_by}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Created At
                  </p>
                  <p className="text-base text-gray-900">
                    {formatSmartDate(quote.created_at)}
                  </p>
                </div>
                {quote.approved_at && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Approved At
                    </p>
                    <p className="text-base text-gray-900">
                      {formatSmartDate(quote.approved_at)}
                    </p>
                  </div>
                )}
                {quote.subscription_id && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Subscription ID
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-mono text-blue-600"
                      onClick={() =>
                        router.push(
                          `/packages/subscriptions/${quote.subscription_id}`
                        )
                      }
                    >
                      {quote.subscription_id}
                    </Button>
                  </div>
                )}
              </div>

              {quote.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Notes
                  </p>
                  <p className="text-base text-gray-700 whitespace-pre-wrap">
                    {quote.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Line Items Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Line Items
                </h3>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/billing/quotes/${quoteId}/items`)
                    }
                  >
                    Manage Items
                  </Button>
                )}
              </div>

              {itemsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading line items...</p>
                </div>
              ) : !lineItems || lineItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">No line items added yet</p>
                  {canEdit && (
                    <Button
                      onClick={() =>
                        router.push(`/billing/quotes/${quoteId}/items`)
                      }
                      className="bg-main hover:bg-main-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line Items
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Item
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Source
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Discount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lineItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="font-medium">{item.item_name}</div>
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.notes}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span
                              className={`px-2 py-1 text-xs rounded-md font-medium ${item.source === 'plan'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                                }`}
                            >
                              {item.source}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(item.unit_price, item.currency)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.discount_amount > 0 ? (
                              formatCurrency(
                                item.discount_amount,
                                item.currency
                              )
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(item.total_price, item.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Reject Quote</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this quote? You can optionally
                provide a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Reason (optional)
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <QuestionDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          question="Delete Quote"
          description="Are you sure you want to delete this quote? This action cannot be undone."
          onConfirm={handleDelete}
        />
      </section>
    </PermissionGate>
  );
}
