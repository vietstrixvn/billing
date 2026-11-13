'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ArrowLeft } from 'lucide-react';
import { Heading } from '@/components';
import { ForbiddenCard } from '@/components/cards/404.card';
import { InvoiceForm } from '@/components/forms/invoice.form';

export default function Page() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/billing/invoices');
  };

  return (
    <PermissionGate
      resource="billing"
      action="create"
      fallback={<ForbiddenCard />}
    >
      <section>
        <div className="flex items-center justify-between mb-6">
          <Heading
            name="Create Invoice"
            desc="Generate a new invoice for a billing record"
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
          <InvoiceForm onSuccess={handleSuccess} />
        </div>
      </section>
    </PermissionGate>
  );
}
