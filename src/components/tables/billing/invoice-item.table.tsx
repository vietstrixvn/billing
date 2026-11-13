'use client';

import type React from 'react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui';
import { InvoiceItemList } from '@/libs/responses';
import { ErrorCustom } from '@/components/loading/error_custom';

interface InvoiceItemTableProps {
  invoiceId: string;
}

export const InvoiceItemTable: React.FC<InvoiceItemTableProps> = ({
  invoiceId,
}) => {
  const [refreshKey] = useState(0);
  const { items, isLoading, isError } = InvoiceItemList(invoiceId, refreshKey);

  if (isError) {
    return (
      <div className="border border-gray-200 p-8">
        <ErrorCustom />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200  overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Discount
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 3 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Description
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
              Qty
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
              Unit Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
              Discount
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items && items.length > 0 ? (
            items.map((item: any, index: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.service_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.category_name}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-center text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">
                  {item.unit_price.toLocaleString()} {item.currency}
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">
                  {item.discount_percent > 0 ? (
                    <span className="text-red-600">
                      -{item.discount_percent}%
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                  {item.total_price.toLocaleString()} {item.currency}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
