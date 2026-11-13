'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { QuoteDetail, QuoteLineItemList } from '@/libs/responses';

import { Skeleton } from '@/components/ui';
import { ErrorCustom } from '@/components/loading/error_custom';
import {
  defaultCompanyInfo,
  defaultClientInfo,
  CompanyInfo,
  ClientInfo,
} from '@/libs';
import { Arrows } from '@/assets';
import { QuoteEditorSidebar } from '@/components/customs/quote-editor-sidebar';
import QuoteDetailCustom from '@/components/customs/quote-detail.custom';

export default function Page() {
  const params = useParams();
  const quoteId = params.id as string;
  const [refreshKey] = useState(0);
  const router = useRouter();
  const [companyInfo, setCompanyInfo] =
    useState<CompanyInfo>(defaultCompanyInfo);
  const [clientInfo, setClientInfo] = useState<ClientInfo>(defaultClientInfo);

  const { quote, isLoading, isError } = QuoteDetail(quoteId, refreshKey);
  const { items, isLoading: itemsLoading } = QuoteLineItemList(
    quoteId,
    refreshKey
  );

  const handleCompanyChange = <K extends keyof CompanyInfo>(
    key: K,
    value: string
  ) => setCompanyInfo((prev) => ({ ...prev, [key]: value }));

  const handleClientChange = <K extends keyof ClientInfo>(
    key: K,
    value: string
  ) => setClientInfo((prev) => ({ ...prev, [key]: value }));

  const handleSaveCustomData = async () => {
    alert(
      'The data is ready to save! Check the console to see the data structure.'
    );
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
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="bg-white rounded-md shadow-lg p-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
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
    <div>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Arrows.ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1 max-h-[90vh] overflow-y-auto">
          <QuoteEditorSidebar
            companyInfo={companyInfo}
            clientInfo={clientInfo}
            onCompanyChange={handleCompanyChange}
            onClientChange={handleClientChange}
          />
        </div>
        <div className="lg:col-span-2">
          {!itemsLoading && items && (
            <QuoteDetailCustom
              quote={quote}
              items={items}
              companyInfo={companyInfo}
              clientInfo={clientInfo}
              onSave={handleSaveCustomData}
            />
          )}
        </div>
      </section>
    </div>
  );
}
