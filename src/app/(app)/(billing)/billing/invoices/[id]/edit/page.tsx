'use client';

import { useParams, useRouter } from 'next/navigation';
import { Heading } from '@/components';
import { Button, Skeleton } from '@/components/ui';
import { EditInvoiceForm } from '@/components/forms/edit-invoice.form';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ArrowLeft } from 'lucide-react';
import { InvoiceDetail } from '@/libs/responses';
import { ErrorCustom } from '@/components/loading/error_custom';
import { useState } from 'react';
import { ForbiddenCard } from '@/components/cards/404.card';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [refreshKey] = useState(0);

  const { invoice, isLoading, isError } = InvoiceDetail(invoiceId, refreshKey);

  const handleSuccess = () => {
    router.push(`/billing/invoices/${invoiceId}`);
  };

  if (isError) {
    return (
      <div className="p-6">
        <ErrorCustom />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="bg-white rounded-md border border-gray-300 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Invoice not found</div>
      </div>
    );
  }

  return (
    <PermissionGate
      resource="billing"
      action="update"
      fallback={<ForbiddenCard />}
    >
      <section>
        <div className="flex items-center justify-between mb-6">
          <Heading
            name={`Edit Invoice ${invoice.invoice_number}`}
            desc="Update invoice details and amounts"
          />
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="mt-6">
          <EditInvoiceForm invoice={invoice} onSuccess={handleSuccess} />
        </div>
      </section>
    </PermissionGate>
  );
}
