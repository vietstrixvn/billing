'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CustomImage } from '../media/image.component';
import { Quote } from '@/types/billing/responses';
import { formatSmartDate, logError } from '@/utils';
import {
  ClientInfo,
  CompanyInfo,
  defaultClientInfo,
  defaultCompanyInfo,
  t,
} from '@/libs';
import { paginateItems } from '@/utils/helpers/invoice_paginate.helpter';
import { InvoiceItem } from '@/types';

interface QuoteDetailCustomProps {
  quote: Quote;
  items: InvoiceItem[];
  companyInfo?: CompanyInfo;
  clientInfo?: ClientInfo;
  onSave?: (customData: any) => void;
}

const fmt = (n: number, currency: string = 'VND') => {
  const formatted = Math.round(n).toLocaleString('vi-VN');
  return currency === 'VND' ? `${formatted} ₫` : `${formatted} ${currency}`;
};

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

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <span
        style={{ color: '#666', fontSize: 9, minWidth: 80, fontWeight: 600 }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function PartyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <span
        style={{ color: '#666', fontSize: 9, minWidth: 72, fontWeight: 600 }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function TotalsRow({
  label,
  value,
  grand,
}: {
  label: string;
  value: string;
  grand?: boolean;
}) {
  if (grand) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#000',
          borderTop: '2px solid #000',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
          {value}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: '1px solid #ddd',
      }}
    >
      <span style={{ color: '#333', fontSize: 10 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#000', fontSize: 11 }}>
        {value}
      </span>
    </div>
  );
}

function TableHead({ language }: { language: 'vi' | 'en' }) {
  const t = {
    vi: {
      no: 'STT',
      serviceName: 'Tên dịch vụ',
      quantity: 'SL',
      unitPrice: 'Đơn giá',
      discount: 'Giảm giá',
      total: 'Thành tiền',
    },
    en: {
      no: 'No.',
      serviceName: 'Service Name',
      quantity: 'Qty',
      unitPrice: 'Unit Price',
      discount: 'Discount',
      total: 'Total',
    },
  };

  return (
    <thead>
      <tr style={s.thead}>
        <th style={{ ...s.th, width: 36, textAlign: 'center' }}>
          {t[language].no}
        </th>
        <th style={s.th}>{t[language].serviceName}</th>
        <th style={{ ...s.th, width: 46, textAlign: 'center' }}>
          {t[language].quantity}
        </th>
        <th style={{ ...s.th, width: 104, textAlign: 'right' }}>
          {t[language].unitPrice}
        </th>
        <th style={{ ...s.th, width: 70, textAlign: 'right' }}>
          {t[language].discount}
        </th>
        <th style={{ ...s.th, width: 108, textAlign: 'right' }}>
          {t[language].total}
        </th>
      </tr>
    </thead>
  );
}

function ItemRows({
  items,
  offset,
  language,
}: {
  items: InvoiceItem[];
  offset: number;
  language: 'vi' | 'en';
}) {
  return (
    <tbody>
      {items.map((item, idx) => (
        <tr key={item.id} style={idx % 2 === 1 ? s.trEven : s.trOdd}>
          <td
            style={{ ...s.td, textAlign: 'center', color: '#666', fontSize: 9 }}
          >
            {offset + idx + 1}
          </td>
          <td style={{ ...s.td, maxWidth: 260 }}>
            <div style={{ fontWeight: 600 }}>{item.item_name}</div>
            {item.notes && <div style={s.itemSub}>{item.notes}</div>}
          </td>
          <td style={{ ...s.td, textAlign: 'center' }}>{item.quantity}</td>
          <td style={{ ...s.td, textAlign: 'right' }}>
            {fmt(item.unit_price, item.currency)}
          </td>
          <td style={{ ...s.td, textAlign: 'right', color: '#666' }}>
            {item.discount_amount > 0
              ? fmt(item.discount_amount, item.currency)
              : '—'}
          </td>
          <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>
            {fmt(item.total_price, item.currency)}
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function QuoteDetailCustom({
  quote,
  items,
  companyInfo = defaultCompanyInfo,
  clientInfo = defaultClientInfo,
  onSave,
}: QuoteDetailCustomProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [editableCompany, setEditableCompany] = useState(companyInfo);
  const [editableClient, setEditableClient] = useState(clientInfo);
  const [notes, setNotes] = useState(quote.notes || '');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    setEditableCompany(companyInfo);
  }, [companyInfo]);

  useEffect(() => {
    setEditableClient(clientInfo);
  }, [clientInfo]);

  const isApproved = quote.status === 'approved';

  const updateCompanyField = <K extends keyof CompanyInfo>(
    key: K,
    value: string
  ) => setEditableCompany((prev) => ({ ...prev, [key]: value }));
  const updateClientField = <K extends keyof ClientInfo>(
    key: K,
    value: string
  ) => setEditableClient((prev) => ({ ...prev, [key]: value }));

  const itemPages = paginateItems<InvoiceItem>(items);
  const totalPages = itemPages.length;

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const pageEls =
        printRef.current.querySelectorAll<HTMLElement>('[data-pdf-page]');
      if (pageEls.length === 0) {
        alert('Không tìm thấy nội dung để xuất PDF.');
        return;
      }

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      });
      const A4_W_MM = 210;
      const A4_H_MM = 297;

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

      pdf.save(`quote-${quote.quote_number}.pdf`);
    } catch (err) {
      logError('Error generating PDF:', err);
      alert('Có lỗi khi tạo PDF. Vui lòng thử lại!');
    }
  };

  const handleSaveCustomData = () => {
    if (onSave) {
      onSave({
        companyInfo: editableCompany,
        clientInfo: editableClient,
        notes,
        quoteId: quote.id,
      });
    }
  };

  return (
    <div style={s.outerWrap}>
      <div style={s.controlsBar} className="no-print">
        <button style={s.btn} onClick={handleDownloadPDF}>
          {t[language].downloadPdf}
        </button>
        <select
          style={s.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
        {onSave && (
          <button style={s.btn} onClick={handleSaveCustomData}>
            {t[language].saveCustom}
          </button>
        )}
        <span style={s.hint}>{t[language].editHint}</span>
      </div>

      <div ref={printRef} className="quote-pages-container">
        {itemPages.map((pageItems, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === totalPages - 1;
          const itemOffset = itemPages
            .slice(0, pageIdx)
            .reduce((acc, p) => acc + p.length, 0);

          return (
            <React.Fragment key={pageIdx}>
              {pageIdx > 0 && <div className="pdf-page-gap" />}

              <div style={s.a4} data-pdf-page={pageIdx}>
                <div style={s.pageNum}>
                  {t[language].page} {pageIdx + 1}
                  {totalPages > 1 ? ` / ${totalPages}` : ''}
                </div>

                {isFirstPage && (
                  <>
                    <div style={s.header}>
                      <div style={s.logoBrandBlock}>
                        <div style={s.logoSlot}>
                          <CustomImage
                            src={'/icons/logo.svg'}
                            alt="Logo"
                            style={s.logoImg}
                          />
                        </div>
                        <div>
                          <EditableSpan
                            value={editableCompany.name}
                            onChange={(v) => updateCompanyField('name', v)}
                            style={s.brandName}
                          />
                          <EditableSpan
                            value={editableCompany.tagline}
                            onChange={(v) => updateCompanyField('tagline', v)}
                            style={s.brandTagline}
                          />
                          <div style={s.brandMeta}>
                            <MetaRow label={t[language].taxId}>
                              <EditableSpan
                                value={editableCompany.mst}
                                onChange={(v) => updateCompanyField('mst', v)}
                                style={s.editable}
                              />
                            </MetaRow>
                            <MetaRow label={t[language].phone}>
                              <EditableSpan
                                value={editableCompany.phone}
                                onChange={(v) => updateCompanyField('phone', v)}
                                style={s.editable}
                              />
                            </MetaRow>
                            <MetaRow label={t[language].email}>
                              <EditableSpan
                                value={editableCompany.email}
                                onChange={(v) => updateCompanyField('email', v)}
                                style={s.editable}
                              />
                            </MetaRow>
                            <MetaRow label={t[language].website}>
                              <EditableSpan
                                value={editableCompany.website}
                                onChange={(v) =>
                                  updateCompanyField('website', v)
                                }
                                style={s.editable}
                              />
                            </MetaRow>
                          </div>
                        </div>
                      </div>

                      <div style={s.invoiceMetaBlock}>
                        <div style={s.invoiceTitleBig}>
                          {language === 'vi' ? 'BÁO GIÁ' : 'QUOTATION'}
                        </div>
                        <div style={s.invoiceSub}>
                          {language === 'vi'
                            ? 'Báo giá dịch vụ'
                            : 'Service Quotation'}
                        </div>
                        <div style={s.metaGrid}>
                          <span style={s.mk}>
                            {language === 'vi' ? 'Số báo giá' : 'Quote Number'}
                          </span>
                          <span style={s.mv}>{quote.quote_number}</span>
                          <span style={s.mk}>
                            {language === 'vi' ? 'Ngày tạo' : 'Created Date'}
                          </span>
                          <span style={s.mv}>
                            {formatSmartDate(quote.created_at)}
                          </span>
                          <span style={s.mk}>
                            {language === 'vi' ? 'Hiệu lực đến' : 'Valid Until'}
                          </span>
                          <span style={s.mv}>
                            {quote.valid_until
                              ? formatSmartDate(quote.valid_until)
                              : '—'}
                          </span>
                          <span style={s.mk}>
                            {language === 'vi' ? 'Trạng thái' : 'Status'}
                          </span>
                          <span style={s.mv}>{quote.status.toUpperCase()}</span>
                        </div>
                        <span style={isApproved ? s.badgePaid : s.badgeUnpaid}>
                          {isApproved
                            ? language === 'vi'
                              ? 'Đã duyệt'
                              : 'Approved'
                            : language === 'vi'
                              ? 'Chờ duyệt'
                              : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div style={s.partiesGrid}>
                      <div style={s.partyBox}>
                        <div style={s.partyLabel}>{t[language].client}</div>
                        <EditableSpan
                          value={editableClient.companyName}
                          onChange={(v) => updateClientField('companyName', v)}
                          style={s.partyName}
                        />
                        <div style={s.partyDetail}>
                          <PartyRow label={t[language].contactPerson}>
                            <EditableSpan
                              value={editableClient.contactPerson}
                              onChange={(v) =>
                                updateClientField('contactPerson', v)
                              }
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].taxId}>
                            <EditableSpan
                              value={editableClient.mst}
                              onChange={(v) => updateClientField('mst', v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].address}>
                            <EditableSpan
                              value={editableClient.address}
                              onChange={(v) => updateClientField('address', v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].phone}>
                            <EditableSpan
                              value={editableClient.phone}
                              onChange={(v) => updateClientField('phone', v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].email}>
                            <EditableSpan
                              value={editableClient.email}
                              onChange={(v) => updateClientField('email', v)}
                              style={s.editable}
                            />
                          </PartyRow>
                        </div>
                        <div style={s.partyMeta}>
                          <div
                            style={{
                              fontSize: 9,
                              color: '#9a9ab0',
                              marginTop: 6,
                            }}
                          >
                            Property ID: {quote.property_id}
                          </div>
                        </div>
                      </div>

                      <div style={{ ...s.partyBox, ...s.partyBoxSeller }}>
                        <div style={s.partyLabel}>{t[language].provider}</div>
                        <EditableSpan
                          value={editableCompany.name}
                          onChange={(v) => updateCompanyField('name', v)}
                          style={s.partyName}
                        />
                        <div style={s.partyDetail}>
                          <PartyRow label={t[language].taxId}>
                            <EditableSpan
                              value={editableCompany.mst}
                              onChange={(v) => updateCompanyField('mst', v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].address}>
                            <EditableSpan
                              value={editableCompany.address}
                              onChange={(v) => updateCompanyField('address', v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].account}>
                            <EditableSpan
                              value={editableCompany.bankAccount}
                              onChange={(v) =>
                                updateCompanyField('bankAccount', v)
                              }
                              style={s.editable}
                            />
                          </PartyRow>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div style={s.sectionTitle}>
                  {t[language].serviceDetails}
                  {totalPages > 1 && (
                    <span
                      style={{ fontWeight: 400, color: '#999', marginLeft: 8 }}
                    >
                      ({t[language].continued} {pageIdx + 1})
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <table style={s.table}>
                    <TableHead language={language} />
                    <ItemRows
                      items={pageItems}
                      offset={itemOffset}
                      language={language}
                    />
                  </table>
                </div>

                {isLastPage && (
                  <>
                    <div style={s.notesTotalsRow}>
                      <div style={{ flex: 1 }}>
                        <div style={s.sectionTitle}>{t[language].notes}</div>
                        <textarea
                          style={s.textarea}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t[language].notesPlaceholder}
                        />
                      </div>
                      <div style={{ width: 300 }}>
                        <div style={s.totalsBox}>
                          <TotalsRow
                            label={t[language].subtotal}
                            value={fmt(quote.sub_total, quote.currency)}
                          />
                          <TotalsRow
                            label={t[language].tax}
                            value={fmt(quote.tax_amount, quote.currency)}
                          />
                          {quote.discount_amount > 0 && (
                            <TotalsRow
                              label={t[language].discount || 'Discount'}
                              value={`-${fmt(quote.discount_amount, quote.currency)}`}
                            />
                          )}
                          <TotalsRow
                            label={t[language].grandTotal}
                            value={fmt(quote.total_amount, quote.currency)}
                            grand
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div style={s.sectionTitle}>{t[language].bankInfo}</div>
                      <div style={s.bankInfo}>
                        <span style={s.bk}>{t[language].accountHolder}</span>{' '}
                        <EditableSpan
                          value={editableCompany.bankName}
                          onChange={(v) => updateCompanyField('bankName', v)}
                          style={{ ...s.bv, ...s.editable }}
                        />
                        &emsp;
                        <span style={s.bk}>
                          {t[language].accountNumber}
                        </span>{' '}
                        <EditableSpan
                          value={editableCompany.bankAccount}
                          onChange={(v) => updateCompanyField('bankAccount', v)}
                          style={{ ...s.bv, ...s.editable }}
                        />
                        &emsp;
                        <span style={s.bk}>{t[language].bank}</span>{' '}
                        <EditableSpan
                          value={editableCompany.bankBranch}
                          onChange={(v) => updateCompanyField('bankBranch', v)}
                          style={{ ...s.bv, ...s.editable }}
                        />
                      </div>
                    </div>

                    <div style={s.sigSection}>
                      <div style={s.sigBox}>
                        <div style={s.sigLabel}>
                          {t[language].representative}
                          <br />
                          <em style={{ fontSize: 10 }}>
                            {t[language].signNote}
                          </em>
                        </div>
                        <div style={s.sigLine}>
                          <EditableSpan
                            value={editableCompany.name}
                            onChange={(v) => updateCompanyField('name', v)}
                            style={s.editable}
                          />
                        </div>
                        <div style={s.sigSub}>
                          <EditableSpan
                            value={`${t[language].taxId}: ${editableCompany.mst}`}
                            onChange={() => {}}
                            style={s.editable}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!isLastPage && (
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px dashed #ddd',
                      fontSize: 9,
                      color: '#bbb',
                      textAlign: 'right',
                    }}
                  >
                    {t[language].nextPage} {pageIdx + 2}
                  </div>
                )}

                <div style={s.footer}>
                  <span>
                    {language === 'vi' ? 'Báo giá' : 'Quote'}{' '}
                    {quote.quote_number}
                  </span>
                  <EditableSpan
                    value={editableCompany.website}
                    onChange={(v) => updateCompanyField('website', v)}
                    style={s.editable}
                  />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');

        [contenteditable]:hover { background: rgba(26,58,92,0.05); border-radius: 3px; }
        [contenteditable]:focus { background: rgba(26,58,92,0.09); border-radius: 3px; outline: none; }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  outerWrap: {
    background: '#f5f5f5',
    padding: '2rem 1rem',
    minHeight: '100vh',
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
  controlsBar: {
    maxWidth: 794,
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
  a4: {
    width: 794,
    minHeight: 1123,
    background: '#ffffff',
    border: '1px solid #ddd',
    padding: '60px 70px',
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
    top: 20,
    right: 30,
    fontSize: 9,
    color: '#999',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2px solid #000',
  },
  logoBrandBlock: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 15,
    flex: 1,
  },
  logoSlot: {
    width: 60,
    height: 60,
    border: '1px solid #ddd',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    overflow: 'hidden',
    background: '#fafafa',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: 4,
  },
  brandName: {
    display: 'block',
    fontSize: 18,
    fontWeight: 700,
    color: '#000',
    lineHeight: 1.3,
    marginBottom: 4,
  },
  brandTagline: {
    display: 'block',
    fontSize: 10,
    color: '#666',
    letterSpacing: '0.05em',
    marginBottom: 10,
  },
  brandMeta: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.8,
  },
  invoiceMetaBlock: {
    textAlign: 'right',
  },
  invoiceTitleBig: {
    fontSize: 20,
    fontWeight: 700,
    color: '#000',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  invoiceSub: {
    fontSize: 10,
    color: '#666',
    marginBottom: 12,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gap: '4px 12px',
    fontSize: 10,
    textAlign: 'left',
  },
  mk: { color: '#666', fontSize: 10, textAlign: 'right' },
  mv: { color: '#000', fontWeight: 600, fontSize: 10 },
  badgeUnpaid: {
    display: 'inline-block',
    marginTop: 10,
    padding: '4px 10px',
    borderRadius: 2,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: '1px solid #000',
    background: '#fff',
    color: '#000',
  },
  badgePaid: {
    display: 'inline-block',
    marginTop: 10,
    padding: '4px 10px',
    borderRadius: 2,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: '#000',
    color: '#fff',
  },
  partiesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 25,
  },
  partyBox: {
    padding: '12px 14px',
    border: '1px solid #ddd',
    background: '#fafafa',
  },
  partyBoxSeller: {
    background: '#f5f5f5',
    border: '1px solid #ccc',
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#000',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '1px solid #ddd',
  },
  partyName: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#000',
    marginBottom: 6,
  },
  partyDetail: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.8,
  },
  partyMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px dashed #ddd',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#000',
    marginBottom: 10,
    marginTop: 5,
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
    padding: '8px 10px',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    textAlign: 'left',
    borderRight: '1px solid #333',
  },
  trOdd: { borderBottom: '1px solid #ddd' },
  trEven: { borderBottom: '1px solid #ddd', background: '#fafafa' },
  td: {
    padding: '8px 10px',
    fontSize: 10,
    verticalAlign: 'top',
    borderRight: '1px solid #ddd',
  },
  itemSub: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  notesTotalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 24,
    marginTop: 10,
  },
  textarea: {
    width: '100%',
    minHeight: 70,
    border: '1px solid #ddd',
    borderRadius: 2,
    padding: 10,
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 10,
    color: '#333',
    background: '#fafafa',
    resize: 'none',
    lineHeight: 1.6,
    outline: 'none',
  },
  totalsBox: {
    border: '1px solid #000',
  },
  bankInfo: {
    border: '1px solid #ccc',
    background: '#fafafa',
    padding: '10px 14px',
    fontSize: 10,
    color: '#333',
    lineHeight: 1.8,
  },
  bk: { color: '#666', fontSize: 9, fontWeight: 600 },
  bv: { color: '#000', fontWeight: 700 },
  sigSection: {
    marginTop: 40,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sigBox: {
    width: 200,
    textAlign: 'center',
  },
  sigLabel: {
    fontSize: 10,
    color: '#333',
    marginBottom: 60,
    fontWeight: 600,
  },
  sigLine: {
    borderTop: '1px solid #000',
    paddingTop: 8,
    fontSize: 11,
    fontWeight: 700,
    color: '#000',
  },
  sigSub: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
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
