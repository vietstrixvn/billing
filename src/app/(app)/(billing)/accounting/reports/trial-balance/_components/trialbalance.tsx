'use client';

import { logError } from '@/utils';
import React, { useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrialBalanceAccount {
  code: string;
  name: string;
  isGroup?: boolean;
  isTotal?: boolean;
  level?: number;
  debit?: number | null;
  credit?: number | null;
  balDebit?: number | null;
  balCredit?: number | null;
}

export interface TrialBalanceSubtotal {
  debit: number;
  credit: number;
  balDebit: number;
  balCredit: number;
}

export interface TrialBalanceData {
  companyName: string;
  reportTitle: string;
  entity: string;
  period: string;
  filter?: string;
  accounts: TrialBalanceAccount[];
  subtotal: TrialBalanceSubtotal;
}

interface TrialBalanceProps {
  data: TrialBalanceData;
  onSave?: (data: TrialBalanceData) => void;
  compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined): string => {
  if (n === null || n === undefined || n === 0) return '';
  return Math.round(n).toLocaleString('en-US');
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function EditableSpan({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      style={style}
      onBlur={(e) => onChange(e.currentTarget.textContent ?? '')}
    >
      {value}
    </span>
  );
}

function TableHead({ language }: { language: 'vi' | 'en' }) {
  const labels = {
    vi: {
      no: 'STT',
      name: 'Tên tài khoản',
      netDebit: 'Phát sinh Nợ',
      netCredit: 'Phát sinh Có',
      balDebit: 'Số dư Nợ',
      balCredit: 'Số dư Có',
    },
    en: {
      no: 'No.',
      name: 'Name',
      netDebit: 'Net Change\nDebit',
      netCredit: 'Net Change\nCredit',
      balDebit: 'Balance\nDebit',
      balCredit: 'Balance\nCredit',
    },
  };
  const l = labels[language];
  return (
    <thead>
      <tr style={s.thead}>
        <th style={{ ...s.th, width: 40, textAlign: 'center' }}>{l.no}</th>
        <th style={{ ...s.th, textAlign: 'left' }}>{l.name}</th>
        <th style={{ ...s.th, width: 130, textAlign: 'right' }}>
          {l.netDebit}
        </th>
        <th style={{ ...s.th, width: 130, textAlign: 'right' }}>
          {l.netCredit}
        </th>
        <th style={{ ...s.th, width: 130, textAlign: 'right' }}>
          {l.balDebit}
        </th>
        <th style={{ ...s.th, width: 130, textAlign: 'right' }}>
          {l.balCredit}
        </th>
      </tr>
    </thead>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrialBalance({
  data: initialData,
  onSave,
  compact = false,
}: TrialBalanceProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<TrialBalanceData>(initialData);
  const [language, setLanguage] = useState<'vi' | 'en'>('en');
  const [showZeroRows, setShowZeroRows] = useState(true);

  const t = {
    vi: {
      download: 'Xuất PDF',
      print: 'In',
      hideZero: 'Ẩn dòng trống',
      showZero: 'Hiện dòng trống',
      subtotal: 'Cộng',
      editHint: 'Click vào văn bản để chỉnh sửa',
      page: 'Trang',
      footer: 'Bảng cân đối số dư —',
      continued: 'tiếp theo trang',
    },
    en: {
      download: 'Export PDF',
      print: 'Print',
      hideZero: 'Hide zero rows',
      showZero: 'Show zero rows',
      subtotal: 'Sub total',
      editHint: 'Click text to edit',
      page: 'Page',
      footer: 'Trial Balance —',
      continued: 'continued on page',
    },
  }[language];

  // ── PDF export (cùng pattern với InvoiceDetailCustom) ────────────────────
  const handleDownloadPDF = async () => {
    const targetRef = compact ? pdfRef : printRef;
    if (!targetRef.current) return;
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const pageEls =
        targetRef.current.querySelectorAll<HTMLElement>('[data-pdf-page]');
      if (pageEls.length === 0) {
        alert('Không tìm thấy nội dung để xuất PDF.');
        return;
      }

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',
      });
      const A4_W_MM = 297;
      const A4_H_MM = 210;

      for (let i = 0; i < pageEls.length; i++) {
        const el = pageEls[i];
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: el.offsetWidth,
          height: el.offsetHeight,
          windowWidth: el.offsetWidth,
          windowHeight: el.offsetHeight,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) pdf.addPage();

        const canvasRatio = canvas.height / canvas.width;
        const imgH = A4_W_MM * canvasRatio;

        if (imgH <= A4_H_MM) {
          const offsetY = (A4_H_MM - imgH) / 2;
          pdf.addImage(imgData, 'JPEG', 0, offsetY, A4_W_MM, imgH);
        } else {
          const imgW = A4_H_MM / canvasRatio;
          const offsetX = (A4_W_MM - imgW) / 2;
          pdf.addImage(imgData, 'JPEG', offsetX, 0, imgW, A4_H_MM);
        }
      }

      pdf.save(`trial-balance-${data.entity.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      logError('Error generating PDF:', err);
      alert('Có lỗi khi tạo PDF. Vui lòng thử lại!');
    }
  };

  const handleSave = () => onSave?.(data);

  // ── Pagination — chia trang A4 landscape (~960px nội dung) ───────────────
  // Mỗi trang landscape có thể chứa ~30 dòng (dòng cao ~22px, nội dung ~660px)
  const ROWS_PER_PAGE_FIRST = 28;
  const ROWS_PER_PAGE = 35;

  const visibleAccounts = showZeroRows
    ? data.accounts
    : data.accounts.filter(
        (a) =>
          a.isGroup ||
          a.isTotal ||
          a.debit ||
          a.credit ||
          a.balDebit ||
          a.balCredit
      );

  // Chia pages
  const pages: TrialBalanceAccount[][] = [];
  let current: TrialBalanceAccount[] = [];
  let rowCount = 0;
  const limit = () =>
    pages.length === 0 ? ROWS_PER_PAGE_FIRST : ROWS_PER_PAGE;

  for (const acc of visibleAccounts) {
    current.push(acc);
    rowCount++;
    if (rowCount >= limit()) {
      pages.push(current);
      current = [];
      rowCount = 0;
    }
  }
  if (current.length > 0) pages.push(current);

  const totalPages = pages.length;

  // ── Render ───────────────────────────────────────────────────────────────
  let globalRowNum = 0;

  return (
    <div style={compact ? { ...s.outerWrap, padding: '1rem 0' } : s.outerWrap}>
      {/* Controls */}
      <div
        style={compact ? { ...s.controlsBar, maxWidth: '100%' } : s.controlsBar}
        className="no-print"
      >
        <button style={s.btn} onClick={handleDownloadPDF}>
          {t.download}
        </button>
        <button style={{ ...s.btn }} onClick={() => window.print()}>
          {t.print}
        </button>
        <select
          style={s.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
        >
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
        </select>
        <button
          style={s.btnGhost}
          onClick={() => setShowZeroRows(!showZeroRows)}
        >
          {showZeroRows ? t.hideZero : t.showZero}
        </button>
        {onSave && (
          <button style={s.btn} onClick={handleSave}>
            Save
          </button>
        )}
        <span style={s.hint}>{t.editHint}</span>
      </div>

      {/* Pages wrapper — visible (compact or full) */}
      <div ref={printRef} className="trial-balance-pages-container">
        {pages.map((pageAccounts, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === totalPages - 1;

          return (
            <React.Fragment key={pageIdx}>
              {pageIdx > 0 && <div style={{ height: 24 }} />}

              <div
                style={
                  compact
                    ? {
                        ...s.a4,
                        width: '100%',
                        minHeight: 'unset',
                        padding: '24px 28px',
                      }
                    : s.a4
                }
                data-pdf-page={pageIdx}
              >
                {/* Page number */}
                <div style={s.pageNum}>
                  {t.page} {pageIdx + 1}
                  {totalPages > 1 ? ` / ${totalPages}` : ''}
                </div>

                {/* ── Header (chỉ trang đầu) ── */}
                {isFirstPage && (
                  <div style={s.docHeader}>
                    <div>
                      <EditableSpan
                        value={data.reportTitle}
                        onChange={(v) =>
                          setData((d) => ({ ...d, reportTitle: v }))
                        }
                        style={s.reportTitle}
                      />
                      <EditableSpan
                        value={data.companyName}
                        onChange={(v) =>
                          setData((d) => ({ ...d, companyName: v }))
                        }
                        style={s.companyName}
                      />
                      <EditableSpan
                        value={data.entity}
                        onChange={(v) => setData((d) => ({ ...d, entity: v }))}
                        style={s.metaLine}
                      />
                      <EditableSpan
                        value={data.period}
                        onChange={(v) => setData((d) => ({ ...d, period: v }))}
                        style={s.metaLine}
                      />
                      {data.filter && (
                        <EditableSpan
                          value={data.filter}
                          onChange={(v) =>
                            setData((d) => ({ ...d, filter: v }))
                          }
                          style={{ ...s.metaLine, color: '#888', fontSize: 9 }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* ── Continued label (trang 2+) ── */}
                {!isFirstPage && (
                  <div style={{ fontSize: 9, color: '#999', marginBottom: 8 }}>
                    <strong>{data.reportTitle}</strong> — {data.companyName} —{' '}
                    {t.continued} {pageIdx + 1}
                  </div>
                )}

                {/* ── Table ── */}
                <table style={s.table}>
                  <TableHead language={language} />
                  <tbody>
                    {pageAccounts.map((acc, idx) => {
                      const isGroup = !!acc.isGroup;
                      const isTotal = !!acc.isTotal;
                      if (!isGroup && !isTotal) globalRowNum++;
                      const currentRowNum = globalRowNum;

                      const rowStyle: React.CSSProperties = isTotal
                        ? s.trTotal
                        : isGroup
                          ? acc.level === 0
                            ? s.trGroup0
                            : s.trGroup1
                          : idx % 2 === 0
                            ? s.trOdd
                            : s.trEven;

                      const nameColor =
                        isGroup && acc.level === 0
                          ? '#fff'
                          : isTotal
                            ? '#000'
                            : '#222';

                      return (
                        <tr key={`${acc.code}-${idx}`} style={rowStyle}>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'center',
                              color:
                                isGroup && acc.level === 0 ? '#aaa' : '#888',
                              fontSize: 9,
                            }}
                          >
                            {!isGroup && !isTotal ? currentRowNum : ''}
                          </td>
                          <td style={{ ...s.td, ...s.nameCell }}>
                            <span
                              style={{
                                fontWeight: isGroup || isTotal ? 700 : 400,
                                paddingLeft: isGroup
                                  ? acc.level === 0
                                    ? 0
                                    : 8
                                  : 16,
                                color: nameColor,
                                fontSize: 10,
                              }}
                            >
                              {acc.code && (
                                <span
                                  style={{
                                    color:
                                      isGroup && acc.level === 0
                                        ? '#aaa'
                                        : '#999',
                                    marginRight: 8,
                                    fontSize: 9,
                                    fontWeight: 400,
                                  }}
                                >
                                  {acc.code}
                                </span>
                              )}
                              {acc.name}
                            </span>
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: isTotal ? 700 : 400,
                              color:
                                isGroup && acc.level === 0 ? '#fff' : '#111',
                            }}
                          >
                            {fmt(acc.debit)}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: isTotal ? 700 : 400,
                              color:
                                isGroup && acc.level === 0 ? '#fff' : '#111',
                            }}
                          >
                            {fmt(acc.credit)}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: isTotal ? 700 : 400,
                              color:
                                isGroup && acc.level === 0 ? '#fff' : '#111',
                            }}
                          >
                            {fmt(acc.balDebit)}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: isTotal ? 700 : 400,
                              color:
                                isGroup && acc.level === 0 ? '#fff' : '#111',
                            }}
                          >
                            {fmt(acc.balCredit)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Sub total — chỉ trang cuối */}
                    {isLastPage && (
                      <tr style={s.trSubtotal}>
                        <td style={s.td} />
                        <td style={{ ...s.td, fontWeight: 700, color: '#fff' }}>
                          {language === 'vi' ? 'Cộng' : 'Sub total'}
                        </td>
                        <td
                          style={{
                            ...s.td,
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {fmt(data.subtotal.debit)}
                        </td>
                        <td
                          style={{
                            ...s.td,
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {fmt(data.subtotal.credit)}
                        </td>
                        <td
                          style={{
                            ...s.td,
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {fmt(data.subtotal.balDebit)}
                        </td>
                        <td
                          style={{
                            ...s.td,
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {fmt(data.subtotal.balCredit)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Continued note */}
                {!isLastPage && (
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 10,
                      borderTop: '1px dashed #ddd',
                      fontSize: 9,
                      color: '#bbb',
                      textAlign: 'right',
                    }}
                  >
                    {t.continued} {pageIdx + 2}
                  </div>
                )}

                {/* Footer */}
                <div style={s.footer}>
                  <span>
                    {t.footer} {data.companyName}
                  </span>
                  <EditableSpan
                    value={data.period}
                    onChange={(v) => setData((d) => ({ ...d, period: v }))}
                    style={s.editable}
                  />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Hidden A4 container — used only for PDF export when compact=true */}
      {compact && (
        <div
          ref={pdfRef}
          style={{
            position: 'fixed',
            left: -9999,
            top: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          {pages.map((pageAccounts, pageIdx) => {
            const isFirstPage = pageIdx === 0;
            const isLastPage = pageIdx === totalPages - 1;
            let pdfRowNum = 0;
            return (
              <React.Fragment key={`pdf-${pageIdx}`}>
                <div style={s.a4} data-pdf-page={pageIdx}>
                  <div style={s.pageNum}>
                    {t.page} {pageIdx + 1}
                    {totalPages > 1 ? ` / ${totalPages}` : ''}
                  </div>
                  {isFirstPage && (
                    <div style={s.docHeader}>
                      <span style={s.reportTitle}>{data.reportTitle}</span>
                      <span style={s.companyName}>{data.companyName}</span>
                      <span style={s.metaLine}>{data.entity}</span>
                      <span style={s.metaLine}>{data.period}</span>
                    </div>
                  )}
                  {!isFirstPage && (
                    <div
                      style={{ fontSize: 9, color: '#999', marginBottom: 8 }}
                    >
                      <strong>{data.reportTitle}</strong> — {data.companyName} —{' '}
                      {t.continued} {pageIdx + 1}
                    </div>
                  )}
                  <table style={s.table}>
                    <TableHead language={language} />
                    <tbody>
                      {pageAccounts.map((acc, idx) => {
                        const isGroup = !!acc.isGroup;
                        const isTotal = !!acc.isTotal;
                        if (!isGroup && !isTotal) pdfRowNum++;
                        const rowNum = pdfRowNum;
                        const rowStyle: React.CSSProperties = isTotal
                          ? s.trTotal
                          : isGroup
                            ? acc.level === 0
                              ? s.trGroup0
                              : s.trGroup1
                            : idx % 2 === 0
                              ? s.trOdd
                              : s.trEven;
                        const nameColor =
                          isGroup && acc.level === 0
                            ? '#fff'
                            : isTotal
                              ? '#000'
                              : '#222';
                        return (
                          <tr key={`pdf-${acc.code}-${idx}`} style={rowStyle}>
                            <td
                              style={{
                                ...s.td,
                                textAlign: 'center',
                                color:
                                  isGroup && acc.level === 0 ? '#aaa' : '#888',
                                fontSize: 9,
                              }}
                            >
                              {!isGroup && !isTotal ? rowNum : ''}
                            </td>
                            <td style={{ ...s.td, ...s.nameCell }}>
                              <span
                                style={{
                                  fontWeight: isGroup || isTotal ? 700 : 400,
                                  paddingLeft: isGroup
                                    ? acc.level === 0
                                      ? 0
                                      : 8
                                    : 16,
                                  color: nameColor,
                                  fontSize: 10,
                                }}
                              >
                                {acc.code && (
                                  <span
                                    style={{
                                      color:
                                        isGroup && acc.level === 0
                                          ? '#aaa'
                                          : '#999',
                                      marginRight: 8,
                                      fontSize: 9,
                                      fontWeight: 400,
                                    }}
                                  >
                                    {acc.code}
                                  </span>
                                )}
                                {acc.name}
                              </span>
                            </td>
                            <td
                              style={{
                                ...s.td,
                                textAlign: 'right',
                                fontWeight: isTotal ? 700 : 400,
                                color:
                                  isGroup && acc.level === 0 ? '#fff' : '#111',
                              }}
                            >
                              {fmt(acc.debit)}
                            </td>
                            <td
                              style={{
                                ...s.td,
                                textAlign: 'right',
                                fontWeight: isTotal ? 700 : 400,
                                color:
                                  isGroup && acc.level === 0 ? '#fff' : '#111',
                              }}
                            >
                              {fmt(acc.credit)}
                            </td>
                            <td
                              style={{
                                ...s.td,
                                textAlign: 'right',
                                fontWeight: isTotal ? 700 : 400,
                                color:
                                  isGroup && acc.level === 0 ? '#fff' : '#111',
                              }}
                            >
                              {fmt(acc.balDebit)}
                            </td>
                            <td
                              style={{
                                ...s.td,
                                textAlign: 'right',
                                fontWeight: isTotal ? 700 : 400,
                                color:
                                  isGroup && acc.level === 0 ? '#fff' : '#111',
                              }}
                            >
                              {fmt(acc.balCredit)}
                            </td>
                          </tr>
                        );
                      })}
                      {isLastPage && (
                        <tr style={s.trSubtotal}>
                          <td style={s.td} />
                          <td
                            style={{ ...s.td, fontWeight: 700, color: '#fff' }}
                          >
                            {language === 'vi' ? 'Cộng' : 'Sub total'}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {fmt(data.subtotal.debit)}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {fmt(data.subtotal.credit)}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {fmt(data.subtotal.balDebit)}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {fmt(data.subtotal.balCredit)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {!isLastPage && (
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 10,
                        borderTop: '1px dashed #ddd',
                        fontSize: 9,
                        color: '#bbb',
                        textAlign: 'right',
                      }}
                    >
                      {t.continued} {pageIdx + 2}
                    </div>
                  )}
                  <div style={s.footer}>
                    <span>
                      {t.footer} {data.companyName}
                    </span>
                    <span style={s.editable}>{data.period}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
        [contenteditable]:hover { background: rgba(26,58,92,0.05); border-radius: 3px; }
        [contenteditable]:focus { background: rgba(26,58,92,0.09); border-radius: 3px; outline: none; }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  outerWrap: {
    background: '#f5f5f5',
    padding: '2rem 1rem',
    minHeight: '100vh',
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
  controlsBar: {
    maxWidth: 1122,
    margin: '0 auto 1.5rem',
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  btn: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 13,
    padding: '8px 18px',
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid #ddd',
    background: '#fff',
    color: '#333',
    fontWeight: 500,
  },
  btnGhost: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 12,
    padding: '7px 14px',
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid #ddd',
    background: 'transparent',
    color: '#666',
  },
  select: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 13,
    padding: '8px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid #ddd',
    background: '#fff',
    color: '#333',
    fontWeight: 500,
    outline: 'none',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  // A4 landscape: 1122 × 794px @96dpi
  a4: {
    width: 1122,
    minHeight: 794,
    background: '#ffffff',
    border: '1px solid #ddd',
    padding: '40px 60px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    color: '#000',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 11,
    lineHeight: 1.6,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  pageNum: {
    position: 'absolute',
    top: 16,
    right: 24,
    fontSize: 9,
    color: '#999',
  },
  docHeader: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: '2px solid #000',
  },
  reportTitle: {
    display: 'block',
    fontSize: 16,
    fontWeight: 700,
    color: '#000',
    cursor: 'text',
    marginBottom: 2,
  },
  companyName: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#222',
    cursor: 'text',
    marginBottom: 4,
  },
  metaLine: {
    display: 'block',
    fontSize: 10,
    color: '#444',
    cursor: 'text',
    lineHeight: 1.7,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #000',
  },
  thead: {
    background: '#000',
    color: '#fff',
  },
  th: {
    padding: '7px 10px',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    textAlign: 'right',
    borderRight: '1px solid #333',
    whiteSpace: 'pre-line',
  },
  trOdd: { borderBottom: '1px solid #eee' },
  trEven: { borderBottom: '1px solid #eee', background: '#fafafa' },
  trGroup0: {
    background: '#1a2b4a',
    borderBottom: '1px solid #0f1e38',
  },
  trGroup1: {
    background: '#e8ecf2',
    borderBottom: '1px solid #d0d8e8',
  },
  trTotal: {
    background: '#f0f0f0',
    borderTop: '1px solid #999',
    borderBottom: '2px solid #999',
  },
  trSubtotal: {
    background: '#000',
    borderTop: '2px solid #000',
  },
  td: {
    padding: '5px 10px',
    fontSize: 10,
    verticalAlign: 'middle',
    borderRight: '1px solid #e0e0e0',
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
  nameCell: {
    borderRight: '1px solid #e0e0e0',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#999',
  },
  editable: {
    cursor: 'text',
    borderRadius: 2,
    minWidth: 20,
    display: 'inline-block',
  },
};
