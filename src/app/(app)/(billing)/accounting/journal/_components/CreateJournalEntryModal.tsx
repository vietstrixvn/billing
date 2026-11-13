'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCreateJournalEntry } from '@/hooks/billing';
import { ChartOfAccountsList } from '@/libs/responses';
import type { CreateJournalEntryLineDTO } from '@/types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

// Preset templates: tự điền sẵn 2 dòng phổ biến
const TEMPLATES: Record<
  string,
  { label: string; lines: Partial<CreateJournalEntryLineDTO>[] }
> = {
  expense: {
    label: 'Chi phí',
    lines: [
      {
        account_code: '642',
        debit_amount: 0,
        credit_amount: 0,
        description: '',
      },
      {
        account_code: '112',
        debit_amount: 0,
        credit_amount: 0,
        description: '',
      },
    ],
  },
  payment_received: {
    label: 'Thu tiền',
    lines: [
      {
        account_code: '112',
        debit_amount: 0,
        credit_amount: 0,
        description: '',
      },
      {
        account_code: '131',
        debit_amount: 0,
        credit_amount: 0,
        description: '',
      },
    ],
  },
  adjustment: {
    label: 'Điều chỉnh',
    lines: [
      { account_code: '', debit_amount: 0, credit_amount: 0, description: '' },
      { account_code: '', debit_amount: 0, credit_amount: 0, description: '' },
    ],
  },
  custom: {
    label: 'Tùy chỉnh',
    lines: [
      { account_code: '', debit_amount: 0, credit_amount: 0, description: '' },
    ],
  },
};

const emptyLine = (): CreateJournalEntryLineDTO => ({
  account_code: '',
  debit_amount: 0,
  credit_amount: 0,
  description: '',
});

function formatVND(n: number) {
  if (!n) return '';
  return new Intl.NumberFormat('vi-VN').format(n);
}

function parseAmount(val: string): number {
  return Number(val.replace(/[^0-9]/g, '')) || 0;
}

export default function CreateJournalEntryModal({ onClose, onSuccess }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [entryDate, setEntryDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [lines, setLines] = useState<CreateJournalEntryLineDTO[]>([
    emptyLine(),
    emptyLine(),
  ]);
  const filter = {};

  const { accounts } = ChartOfAccountsList(filter, 0);
  const createEntry = useCreateJournalEntry();

  // Totals
  const totalDebit = lines.reduce((s, l) => s + (l.debit_amount || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit_amount || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  // Apply template
  const applyTemplate = (key: string) => {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    setLines(
      tpl.lines.map((l) => ({
        account_code: l.account_code ?? '',
        debit_amount: l.debit_amount ?? 0,
        credit_amount: l.credit_amount ?? 0,
        description: l.description ?? '',
      }))
    );
  };

  const updateLine = (
    idx: number,
    field: keyof CreateJournalEntryLineDTO,
    value: string | number
  ) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!isBalanced) return;
    createEntry.mutate(
      {
        entry_date: entryDate,
        notes: notes || undefined,
        source_ref: sourceRef || undefined,
        lines,
      },
      { onSuccess }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Nhập bút toán thủ công
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Templates */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Select the type of service
            </p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 hover:border-main transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Số chứng từ
              </label>
              <input
                type="text"
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
                placeholder="PC-2026-001"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Diễn giải chung
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mua laptop cho nhân viên..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
              />
            </div>
          </div>

          {/* Lines table */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Dòng bút toán
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 w-40">
                      Tài khoản
                    </th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 w-36">
                      Nợ (Debit)
                    </th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 w-36">
                      Có (Credit)
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">
                      Diễn giải
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      {/* Account selector */}
                      <td className="px-3 py-2">
                        <select
                          value={line.account_code}
                          onChange={(e) =>
                            updateLine(idx, 'account_code', e.target.value)
                          }
                          className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                        >
                          <option value="">-- Select account --</option>
                          {accounts.map((acc, idx) => (
                            <option key={`${acc.code}-${idx}`} value={acc.code}>
                              {acc.code} — {acc.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Debit */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            line.debit_amount
                              ? formatVND(line.debit_amount)
                              : ''
                          }
                          onChange={(e) =>
                            updateLine(
                              idx,
                              'debit_amount',
                              parseAmount(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="w-full border rounded px-2 py-1.5 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-main"
                        />
                      </td>
                      {/* Credit */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            line.credit_amount
                              ? formatVND(line.credit_amount)
                              : ''
                          }
                          onChange={(e) =>
                            updateLine(
                              idx,
                              'credit_amount',
                              parseAmount(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="w-full border rounded px-2 py-1.5 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-main"
                        />
                      </td>
                      {/* Description */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.description ?? ''}
                          onChange={(e) =>
                            updateLine(idx, 'description', e.target.value)
                          }
                          placeholder="Diễn giải dòng..."
                          className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                        />
                      </td>
                      {/* Remove */}
                      <td className="px-2 py-2">
                        <button
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 1}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals */}
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="px-3 py-2 text-xs font-semibold text-gray-600">
                      Tổng cộng
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-sm">
                      {formatVND(totalDebit)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-sm">
                      {formatVND(totalCredit)}
                    </td>
                    <td colSpan={2} className="px-3 py-2">
                      {totalDebit > 0 && !isBalanced && (
                        <span className="text-xs text-red-500">
                          Chênh lệch:{' '}
                          {new Intl.NumberFormat('vi-VN').format(
                            Math.abs(totalDebit - totalCredit)
                          )}{' '}
                          VND
                        </span>
                      )}
                      {isBalanced && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Cân bằng
                        </span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button
              onClick={addLine}
              className="mt-2 flex items-center gap-1.5 text-sm text-main hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm dòng
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-gray-400">
            The system will validate that total debits equal total credits
            before saving.{' '}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isBalanced || createEntry.isPending}
              className="bg-main text-white hover:bg-primary-800 disabled:opacity-50"
            >
              {createEntry.isPending ? 'Đang lưu...' : 'Lưu bút toán'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
