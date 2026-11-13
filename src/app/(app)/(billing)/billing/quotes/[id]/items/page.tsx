'use client';

import { useParams, useRouter } from 'next/navigation';
import { Heading } from '@/components';
import { Button, Skeleton } from '@/components/ui';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ArrowLeft } from 'lucide-react';
import { QuoteDetail } from '@/libs/responses';
import { ErrorCustom } from '@/components/loading/error_custom';
import { useState } from 'react';
import { QuoteLineItemsForm } from '@/components/forms/quote-line-items.form';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const [refreshKey] = useState(0);

  const { quote, isLoading, isError } = QuoteDetail(quoteId, refreshKey);

  const handleSuccess = () => {
    router.push(`/billing/quotes/${quoteId}`);
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
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Quote not found</div>
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
            name={`Manage Items - ${quote.quote_number}`}
            desc="Add, edit, or remove line items from this quote"
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
          <QuoteLineItemsForm
            quoteId={quoteId}
            billingCycle={quote.billing_cycle || 'monthly'}
            onSuccess={handleSuccess}
          />
        </div>
      </section>
    </PermissionGate>
  );
}
