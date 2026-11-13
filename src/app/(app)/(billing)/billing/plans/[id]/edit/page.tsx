'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Heading } from '@/components';
import { Button } from '@/components/ui';
import { PlanForm } from '@/components/forms/plan.form';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ArrowLeft } from 'lucide-react';
import { PlanDetail } from '@/libs/responses';
import { LoadingSpin } from '@/components/loading';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [refreshKey] = useState(0);

  const { plan, isLoading, isError } = PlanDetail(id, refreshKey);

  const handleSuccess = () => {
    router.push('/billing/plans');
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpin />
        </div>
      </section>
    );
  }

  if (isError || !plan) {
    return (
      <section>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load plan details</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </section>
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
            name={`Edit Plan: ${plan.name}`}
            desc="Update subscription plan details"
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
          <PlanForm onSuccess={handleSuccess} initialData={plan} mode="edit" />
        </div>
      </section>
    </PermissionGate>
  );
}
