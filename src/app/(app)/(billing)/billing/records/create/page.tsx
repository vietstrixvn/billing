'use client';

import { useRouter } from 'next/navigation';
import { Heading } from '@/components';
import { Button } from '@/components/ui';
import { BillingRecordForm } from '@/components/forms/billing-record.form';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/billing/records');
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
            name="Create Billing Record"
            desc="Create a new billing record for a subscription"
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

        <div className="mt-6 bg-white p-8">
          <BillingRecordForm onSuccess={handleSuccess} />
        </div>
      </section>
    </PermissionGate>
  );
}
