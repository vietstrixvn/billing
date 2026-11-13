'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ErrorCustom } from '@/components/loading/error_custom';
import { AddItemsToPlanForm } from '@/components/forms/add-items-to-plan.form';
import { PlanIncludedItemList, PlanDetail } from '@/libs/responses';

export default function AddPlanItemPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const { plan, isError: isPlanError } = PlanDetail(planId, 0);
  const { items, isError: isItemsError } = PlanIncludedItemList(
    planId,
    0,
    false
  );

  const existingItemIds = useMemo(() => {
    return items.map((item) => item.service_item_id);
  }, [items]);

  const handleSuccess = () => {
    router.push(`/billing/plans/${planId}/items`);
  };

  if (isPlanError || isItemsError) {
    return <ErrorCustom />;
  }

  return (
    <PermissionGate
      resource="billing"
      action="create"
      fallback={<ForbiddenCard />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/billing/plans/${planId}/items`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Heading
              name="Add Items to Plan"
              desc={
                plan
                  ? `Plan: ${plan.name} (${plan.code})`
                  : `Plan #${planId.slice(-6)}`
              }
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl">
          <AddItemsToPlanForm
            planId={planId}
            existingItemIds={existingItemIds}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </PermissionGate>
  );
}
