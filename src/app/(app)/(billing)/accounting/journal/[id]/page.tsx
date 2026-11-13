'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components';
import { Button } from '@/components/ui';
import { JournalEntryDetail } from '@/libs/responses';
import { useReverseJournalEntry } from '@/hooks/billing';
import { formatSmartDate as formatDate } from '@/utils';
import { ArrowLeft, RotateCcw, Download } from 'lucide-react';
import { exportJournalToXls } from '@/utils/exportJournalXls';

const TYPE_COLORS: Record<string, string> = {
  invoice_issued: 'bg-blue-100 text-blue-700',
  payment_received: 'bg-green-100 text-green-700',
  refund: 'bg-red-100 text-red-700',
  reversal: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  posted: 'bg-green-100 text-green-700',
  reversed: 'bg-red-100 text-red-700',
  voided: 'bg-yellow-100 text-yellow-700',
};

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reverseReason, setReverseReason] = useState('');
  const [showReverseModal, setShowReverseModal] = useState(false);

  const { journalEntry, isLoading, isError } = JournalEntryDetail(id);
  const reverseEntry = useReverseJournalEntry();

  const handleReverse = () => {
    if (!reverseReason.trim()) return;
    reverseEntry.mutate(
      { id, dto: { reason: reverseReason } },
      {
        onSuccess: () => {
          setShowReverseModal(false);
          setReverseReason('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading...
      </div>
    );
  }

  if (isError || !journalEntry) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Failed to load journal entry
      </div>
    );
  }

  const canReverse =
    journalEntry.status === 'posted' && !journalEntry.reverses_entry_id;

  return (
    <section className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Heading
            name={journalEntry.entry_number}
            desc={`Journal entry — ${journalEntry.type.replace(/_/g, ' ')}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              exportJournalToXls(
                [journalEntry],
                `${journalEntry.entry_number}.xlsx`
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Export XLS
          </Button>
          {canReverse && (
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setShowReverseModal(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reverse Entry
            </Button>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Entry Number', value: journalEntry.entry_number },
          { label: 'Date', value: formatDate(journalEntry.entry_date) },
          {
            label: 'Type',
            value: (
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[journalEntry.type] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {journalEntry.type.replace(/_/g, ' ')}
              </span>
            ),
          },
          {
            label: 'Status',
            value: (
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[journalEntry.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {journalEntry.status}
              </span>
            ),
          },
          {
            label: 'Source',
            value: `${journalEntry.source_type} / ${journalEntry.source_id}`,
          },
          { label: 'Currency', value: journalEntry.currency },
          {
            label: 'Total Debit',
            value: (
              <span className="font-mono font-semibold text-gray-800">
                {formatVND(journalEntry.total_debit)}
              </span>
            ),
          },
          {
            label: 'Total Credit',
            value: (
              <span className="font-mono font-semibold text-gray-800">
                {formatVND(journalEntry.total_credit)}
              </span>
            ),
          },
        ].map((item) => (
          <div key={item.label} className="bg-white border p-4">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <div className="text-sm font-medium text-gray-800">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {journalEntry.notes && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          {journalEntry.notes}
        </div>
      )}

      {/* Journal Lines */}
      <div className="bg-white border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-medium text-gray-700">Journal Lines</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                #
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Account Code
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Account Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Description
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Debit
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Credit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {journalEntry.lines.map((line) => (
              <tr key={line.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{line.sort_order}</td>
                <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                  {line.account_code}
                </td>
                <td className="px-4 py-3 text-gray-800">{line.account_name}</td>
                <td className="px-4 py-3 text-gray-500">{line.description}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {line.debit_amount > 0 ? formatVND(line.debit_amount) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {line.credit_amount > 0 ? formatVND(line.credit_amount) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t font-semibold">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right text-gray-600">
                Total
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatVND(journalEntry.total_debit)}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatVND(journalEntry.total_credit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Reverse Modal */}
      {showReverseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              Reverse Journal Entry
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This will create a new storno entry with reversed debit/credit
              amounts.
            </p>
            <textarea
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              placeholder="Reason for reversal (required)"
              className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main resize-none h-24"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowReverseModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleReverse}
                disabled={!reverseReason.trim() || reverseEntry.isPending}
              >
                {reverseEntry.isPending ? 'Reversing...' : 'Confirm Reverse'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
