'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import type { ProvisionResult } from '@/types/billing/responses';

interface ProvisionResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ProvisionResult | null;
  onDone?: () => void;
}

export function ProvisionResultDialog({
  open,
  onOpenChange,
  result,
  onDone,
}: ProvisionResultDialogProps) {
  if (!result) return null;

  const { subscription, billing_record, invoice } = result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Provision successful
          </DialogTitle>
          <DialogDescription>
            Subscription, billing record and invoice were created. Mark the
            billing record as paid after payment is received.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 text-sm">
          <ResultLink
            label="Subscription"
            href={`/packages/subscriptions/${subscription.id}`}
            detail={`${subscription.plan_code} · ${subscription.status}`}
          />
          <ResultLink
            label="Billing record"
            href={`/billing/records/${billing_record.id}`}
            detail={`${billing_record.status} · ${billing_record.amount.toLocaleString()} ${billing_record.currency}`}
          />
          <ResultLink
            label="Invoice"
            href={`/billing/invoices/${invoice.id}`}
            detail={`${invoice.invoice_number} · ${invoice.invoice_amount.toLocaleString()} ${invoice.currency}`}
          />
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild>
            <Link href={`/billing/records/${billing_record.id}`}>
              Mark as paid
            </Link>
          </Button>
          <Button
            className="bg-main"
            onClick={() => {
              onOpenChange(false);
              onDone?.();
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultLink({
  label,
  href,
  detail,
}: {
  label: string;
  href: string;
  detail: string;
}) {
  return (
    <li className="flex items-start justify-between gap-2 rounded-md border p-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <Button variant="ghost" size="sm" asChild>
        <Link href={href}>
          Open <ExternalLink className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </li>
  );
}
