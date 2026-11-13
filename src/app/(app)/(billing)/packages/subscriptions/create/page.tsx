'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Clock } from 'lucide-react';

import { SubscriptionForm } from '@/components/forms/subscription.form';
import { SubscriptionNewForm } from '@/components/forms/subscription-new.form';
import { useCreateSubscription } from '@/hooks/billing/useSubscription';
import type {
  CreateSubscriptionDTO,
  CreateSubscriptionLegacyDTO,
} from '@/types';
import { toast } from 'sonner';
import { cn } from '@/utils';

const FORMAT_OPTIONS = [
  {
    id: 'new',
    label: 'Standard',
    badge: 'Recommended',
    icon: Zap,
    description: 'Automated billing cycles & discount tracking.',
    features: [
      'Auto-calculated expiry dates',
      'Monthly or yearly billing',
      'Expiry set automatically',
      'Discount code tracking',
    ],
    accent: 'blue',
  },
  {
    id: 'legacy',
    label: 'Legacy',
    badge: 'Advanced',
    icon: Clock,
    description: 'Manual control over plan ID, dates and status.',
    features: [
      'Manual plan ID input',
      'Custom start & expiry dates',
      'Manual status control',
      'Full manual configuration',
    ],
    accent: 'amber',
  },
] as const;

type FormatId = 'new' | 'legacy';

export default function Page() {
  const router = useRouter();
  const createMutation = useCreateSubscription();
  const [activeFormat, setActiveFormat] = useState<FormatId>('new');

  const handleSubmit = (
    data: CreateSubscriptionDTO | CreateSubscriptionLegacyDTO
  ) => {
    createMutation.mutate(data as any, {
      onSuccess: () => {
        router.push('/packages/subscriptions');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create subscription');
      },
    });
  };

  const selectedFormat = FORMAT_OPTIONS.find((f) => f.id === activeFormat)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/packages/subscriptions')}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Billing
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Subscriptions
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                New
              </span>
            </div>
            <h1 className="text-base font-semibold text-gray-900 mt-0.5">
              Create Subscription
            </h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar — format selector */}
          <div className="col-span-3 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3 px-1">
              Format
            </p>

            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = activeFormat === option.id;
              const isLegacy = option.id === 'legacy';

              return (
                <button
                  key={option.id}
                  onClick={() => setActiveFormat(option.id)}
                  className={cn(
                    'w-full text-left p-3.5 border transition-all duration-150',
                    isActive
                      ? isLegacy
                        ? 'bg-amber-50 border-amber-300 shadow-sm'
                        : 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        'mt-0.5 w-7 h-7 flex items-center justify-center flex-shrink-0',
                        isActive
                          ? isLegacy
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            isActive ? 'text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {option.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-medium px-1.5 py-0.5 uppercase tracking-wide',
                            isActive
                              ? isLegacy
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {option.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Feature list for selected format */}
            <div
              className={cn(
                'mt-4 p-3.5 border-l-2',
                activeFormat === 'legacy'
                  ? 'border-l-amber-400 bg-amber-50/60'
                  : 'border-l-blue-400 bg-blue-50/60'
              )}
            >
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-2">
                Includes
              </p>
              <ul className="space-y-1.5">
                {selectedFormat.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span
                      className={cn(
                        'mt-0.5 w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center text-[10px] font-bold',
                        activeFormat === 'legacy'
                          ? 'text-amber-500'
                          : 'text-blue-500'
                      )}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {activeFormat === 'legacy' && (
                <p className="mt-3 text-[11px] text-amber-700 border-t border-amber-200 pt-2.5">
                  Use for special cases or backward compatibility only.
                </p>
              )}
            </div>
          </div>

          {/* Main form area */}
          <div className="col-span-9">
            <div className="bg-white border border-gray-200">
              {/* Form header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Subscription Details
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeFormat === 'new'
                      ? 'Fill in the fields below. Expiry dates will be calculated automatically.'
                      : 'Manually configure all subscription fields including plan ID and dates.'}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 uppercase tracking-wider',
                    activeFormat === 'legacy'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  )}
                >
                  {activeFormat === 'new' ? 'Standard Format' : 'Legacy Format'}
                </span>
              </div>

              {/* Form body */}
              <div className="px-6 py-6">
                {activeFormat === 'new' ? (
                  <SubscriptionNewForm
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending}
                  />
                ) : (
                  <SubscriptionForm
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
