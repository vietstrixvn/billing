'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import { PlanIncludedItemList } from '@/libs/responses';
import { useDeletePlanIncludedItem } from '@/hooks/billing/usePlanIncludedItem';
import { ErrorCustom } from '@/components/loading/error_custom';
import { Heading } from '@/components';
import { PlanIncludedItemTable } from '@/components/tables/billing';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { AddItemsToPlanForm } from '@/components/forms/add-items-to-plan.form';

export default function PlanItemsPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');

  const { items, isLoading, isError } = PlanIncludedItemList(
    planId,
    refreshKey,
    true // Include prices to avoid N+1 API calls
  );
  const deleteMutation = useDeletePlanIncludedItem(planId);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.service_item?.name.toLowerCase().includes(q) ||
        item.service_item?.code.toLowerCase().includes(q);
      // Note: pricing_type filter removed as it's not part of ServiceItem type
      return matchSearch;
    });
  }, [items, search]);

  const existingItemIds = useMemo(() => {
    return items
      .map((item) => String(item.service_item_id || item.service_item?.id || ''))
      .filter(Boolean);
  }, [items]);

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setRefreshKey((prev) => prev + 1);
      },
    });
  }

  function handleEdit(id: string) {
    router.push(`/billing/plans/${planId}/items/${id}/edit`);
  }

  if (isError) {
    return <ErrorCustom />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/billing/plans/${planId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Heading
            name="Plan items"
            desc={`Service items included in plan #${planId.slice(-6)}`}
          />
        </div>
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <PermissionGate
            resource="billing"
            action="create"
            fallback={<ForbiddenCard />}
          >
            <AddItemsToPlanForm
              planId={planId}
              existingItemIds={existingItemIds}
              onSuccess={() => setRefreshKey((prev) => prev + 1)}
            />
          </PermissionGate>
        </div>
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <Input
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm bg-white border-neutral-200 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-400"
              />
            </div>

            <span className="ml-auto text-xs text-neutral-400 tabular-nums">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Table */}
          <PlanIncludedItemTable
            items={filtered}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />

          {/* Footer meta */}
          <div className="flex items-center gap-4 mt-4 text-xs text-neutral-400">
            <span>
              Plan ID:{' '}
              <code className="font-mono text-neutral-500">{planId}</code>
            </span>
            <span className="text-neutral-200">|</span>
            <span>
              Last synced:{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
