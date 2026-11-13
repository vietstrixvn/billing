'use client';

import { useRouter } from 'next/navigation';
import { Heading } from '@/components';
import { Button } from '@/components/ui';
import { PlanForm } from '@/components/forms/plan.form';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/billing/plans');
  };

  return (
    <PermissionGate
      resource="billing"
      action="create"
      fallback={<ForbiddenCard />}
    >
      <section>
        <div className="flex items-center justify-between mb-6">
          <Heading name="Create Plan" desc="Add a new subscription plan" />
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
          <PlanForm onSuccess={handleSuccess} />
        </div>
      </section>
    </PermissionGate>
  );
}
