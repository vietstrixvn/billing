'use client';

import { useRouter, useParams } from 'next/navigation';
import { Heading } from '@/components';
import { Button } from '@/components/ui';
import { EditServiceItemForm } from '@/components/forms/edit-service-item.form';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const handleSuccess = () => {
    router.push('/packages/item');
  };

  return (
    <PermissionGate
      resource="billing"
      action="update"
      fallback={<ForbiddenCard />}
    >
      <section>
        <div className="flex items-center justify-between mb-6">
          <Heading
            name="Edit Service Item"
            desc="Update service item information"
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
          <EditServiceItemForm itemId={itemId} onSuccess={handleSuccess} />
        </div>
      </section>
    </PermissionGate>
  );
}
