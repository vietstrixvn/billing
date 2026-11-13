'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/customs/header.design';
import { Container } from '@/components/wrappers/container';
import { ServiceItemForm } from '@/components/forms/service-item.form';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/packages/item');
  };

  return (
    <PermissionGate
      resource="billing"
      action="create"
      fallback={<ForbiddenCard />}
    >
      <Container className="mt-8 space-y-6">
        <Header title="Create Service Item" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Define a new billable product or service with pricing configuration.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </button>
        </div>

        <ServiceItemForm onSuccess={handleSuccess} />
      </Container>
    </PermissionGate>
  );
}
