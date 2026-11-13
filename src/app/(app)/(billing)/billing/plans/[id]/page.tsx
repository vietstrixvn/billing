'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Package } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { PlanDetail } from '@/libs/responses';
import { formatSmartDate } from '@/utils';
import { ErrorCustom } from '@/components/loading/error_custom';
import { Heading, RefreshButton } from '@/components';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);

  const { plan, isLoading, isError } = PlanDetail(id, refreshKey);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !plan) {
    return <ErrorCustom />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/billing/plans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Heading name={plan.name} desc={`Plan Code: ${plan.code}`} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-sm rounded-md font-medium ${plan.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
              }`}
          >
            {plan.is_active ? 'Active' : 'Inactive'}
          </span>
          <RefreshButton onClick={handleRefresh} />

          <Button
            variant="outline"
            onClick={() => router.push(`/billing/plans/${plan.id}/edit`)}
          >
            Edit Plan
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-main text-white">
          <TabsTrigger value="info">Plan Information</TabsTrigger>
          <TabsTrigger value="items">Included Items</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Tab 1: Plan Information */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Plan Name
                  </label>
                  <p className="text-base font-semibold">{plan.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Plan Code
                  </label>
                  <p className="text-base font-mono">{plan.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-base text-gray-700">
                    {plan.description || 'No description'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-base">
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sort Order
                  </label>
                  <p className="text-base">{plan.sort_order}</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Included Items
                  </label>
                  <p className="text-3xl font-bold text-main">
                    {plan.included_items?.length || 0}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <p className="text-base">
                    {formatSmartDate(plan.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Updated At
                  </label>
                  <p className="text-base">
                    {formatSmartDate(plan.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="rounded-none bg-blue-50 border-blue-200">
            <CardContent>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Regarding Package Prices{' '}
                  </h4>
                  <p className="text-sm text-blue-800">
                    The price of the package is calculated based on the services included in the
                    package. Each service may have different prices depending on the billing
                    cycle (monthly, quarterly, annually). See the &quot;Included Services&quot;
                    tab to manage services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Included Items */}
        <TabsContent value="items" className="space-y-6">
          <Card className="rounded-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Included Service Items
                </CardTitle>
                <div className="space-x-4">
                  <Button
                    className="bg-main text-white hover:bg-primary-800"
                    onClick={() =>
                      router.push(`/billing/plans/${plan.id}/items`)
                    }
                  >
                    Manage Items
                  </Button>
                  <Button
                    className="bg-main text-white hover:bg-primary-800"
                    onClick={() =>
                      router.push(`/billing/plans/${plan.id}/items/add`)
                    }
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {plan.included_items && plan.included_items.length > 0 ? (
                <div className="space-y-4">
                  {plan.included_items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-main text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-main">
                            {item.service_item?.name || 'Unknown Service'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.service_item?.description || 'No description'}
                          </p>
                          {item.service_item?.code && (
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                              Code: {item.service_item.code}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.is_unlimited ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Unlimited
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-300 font-bold">
                            Qty: {item.quantity} {item.service_item?.unit || ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No items included in this plan
                  </p>
                  <Button
                    className="mt-4 bg-main text-white hover:bg-primary-800"
                    onClick={() =>
                      router.push(`/billing/plans/${plan.id}/items/add`)
                    }
                  >
                    Add First Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Subscriptions Using This Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Subscription list will be displayed here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Shows all properties subscribed to this plan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
