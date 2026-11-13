"use client";

import React, { useRef, useState, useEffect } from "react";
import { CustomImage } from "../media/image.component";
import { Invoice } from "@/types/billing/responses";
import { formatSmartDate, formatDocDate, logError, bpsToPercent } from "@/utils";
import {
  ClientInfo,
  CompanyInfo,
  defaultClientInfo,
  defaultCompanyInfo,
  t,
} from "@/libs";
import { paginateItems } from "@/utils/helpers/invoice_paginate.helpter";
import { InvoiceItem } from "@/types";
// html2pdf không dùng nữa — dùng jsPDF + html2canvas trực tiếp để render từng trang

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceDetailCustomProps {
  invoice: Invoice;
  items: InvoiceItem[];
  companyInfo?: CompanyInfo;
  clientInfo?: ClientInfo;
  onSave?: (customData: any) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

// ─── Pagination constants (px, tương ứng với A4 @96dpi) ──────────────────────
//
// A4 = 794 × 1123 px (96 dpi)
// Padding top+bottom = 60+60 = 120px  →  nội dung khả dụng = 1003px
//
// Page 1 reservations:
//   header block   ≈ 130px
//   parties grid   ≈ 130px
//   section title  ≈  30px
//   table header   ≈  30px
//   footer reserve ≈  60px   (page number + footer bar)
//   ─────────────────────────
//   reserved page1 ≈ 380px   →  dành cho items ≈ 623px

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number, currency: string = "VND") => {
  const formatted = Math.round(n).toLocaleString("vi-VN");
  return currency === "VND" ? `${formatted} ₫` : `${formatted} ${currency}`;
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
      onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
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
    <div style={{ display: "flex", gap: 6 }}>
      <span
        style={{ color: "#666", fontSize: 9, minWidth: 80, fontWeight: 600 }}
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
    <div style={{ display: "flex", gap: 6 }}>
      <span
        style={{ color: "#666", fontSize: 9, minWidth: 72, fontWeight: 600 }}
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
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#000",
          borderTop: "2px solid #000",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {value}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 14px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <span style={{ color: "#333", fontSize: 10 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#000", fontSize: 11 }}>
        {value}
      </span>
    </div>
  );
}

// ─── Reusable sections ────────────────────────────────────────────────────────

function TableHead({ language }: { language: "vi" | "en" }) {
  const t = {
    vi: {
      no: "STT",
      serviceName: "Tên dịch vụ",
      source: "Nguồn",
      quantity: "SL",
      unitPrice: "Đơn giá",
      discount: "Giảm giá",
      total: "Thành tiền",
    },
    en: {
      no: "No.",
      serviceName: "Service Name",
      source: "Source",
      quantity: "Qty",
      unitPrice: "Unit Price",
      discount: "Discount",
      total: "Total",
    },
  };

  return (
    <thead>
      <tr style={s.thead}>
        <th style={{ ...s.th, width: 36, textAlign: "center" }}>
          {t[language].no}
        </th>
        <th style={s.th}>{t[language].serviceName}</th>
        <th style={{ ...s.th, width: 80, textAlign: "center" }}>
          {t[language].source}
        </th>
        <th style={{ ...s.th, width: 46, textAlign: "center" }}>
          {t[language].quantity}
        </th>
        <th style={{ ...s.th, width: 104, textAlign: "right" }}>
          {t[language].unitPrice}
        </th>
        <th style={{ ...s.th, width: 70, textAlign: "right" }}>
          {t[language].discount}
        </th>
        <th style={{ ...s.th, width: 108, textAlign: "right" }}>
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
  language: "vi" | "en";
}) {
  const sourceText = {
    vi: { plan: "Gói", custom: "Tùy chỉnh" },
    en: { plan: "Plan", custom: "Custom" },
  };

  return (
    <tbody>
      {items.map((item, idx) => (
        <tr key={item.id} style={idx % 2 === 1 ? s.trEven : s.trOdd}>
          <td
            style={{ ...s.td, textAlign: "center", color: "#666", fontSize: 9 }}
          >
            {offset + idx + 1}
          </td>
          <td style={{ ...s.td, maxWidth: 260 }}>
            <div style={{ fontWeight: 600 }}>{item.item_name}</div>
            <div style={s.itemSub}>
              {item.source}
              {item.notes && ` • ${item.notes}`}
            </div>
          </td>
          <td style={{ ...s.td, textAlign: "center", fontSize: 9 }}>
            {item.source === "plan"
              ? sourceText[language].plan
              : sourceText[language].custom}
          </td>
          <td style={{ ...s.td, textAlign: "center" }}>{item.quantity}</td>
          <td style={{ ...s.td, textAlign: "right" }}>
            {fmt(item.unit_price, item.currency)}
          </td>
          <td style={{ ...s.td, textAlign: "right", color: "#666" }}>
            {item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}
          </td>
          <td style={{ ...s.td, textAlign: "right", fontWeight: 700 }}>
            {fmt(item.total_price, item.currency)}
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoiceDetailCustom({
  invoice,
  items,
  companyInfo = defaultCompanyInfo,
  clientInfo = defaultClientInfo,
  onSave,
}: InvoiceDetailCustomProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [editableCompany, setEditableCompany] = useState(companyInfo);
  const [editableClient, setEditableClient] = useState(clientInfo);
  const [notes, setNotes] = useState(invoice.notes || "");
  const [language, setLanguage] = useState<"vi" | "en">("vi");

  // Sync khi props thay đổi từ sidebar bên ngoài
  useEffect(() => {
    setEditableCompany(companyInfo);
  }, [companyInfo]);

  useEffect(() => {
    setEditableClient(clientInfo);
  }, [clientInfo]);

  const isPaid = !!invoice.paid_at;

  const updateCompanyField = <K extends keyof CompanyInfo>(
    key: K,
    value: string,
  ) => setEditableCompany((prev) => ({ ...prev, [key]: value }));
  const updateClientField = <K extends keyof ClientInfo>(
    key: K,
    value: string,
  ) => setEditableClient((prev) => ({ ...prev, [key]: value }));

  // Phân trang items
  const itemPages = paginateItems(items);
  const totalPages = itemPages.length;

  // ── PDF export — render từng trang A4 div thành canvas riêng, ghép vào jsPDF ──
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      // Dynamic import để tránh SSR issue
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // Lấy tất cả các div trang A4 bên trong printRef
      const pageEls =
        printRef.current.querySelectorAll<HTMLElement>("[data-pdf-page]");
      if (pageEls.length === 0) {
        alert("Không tìm thấy nội dung để xuất PDF.");
        return;
      }

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const A4_W_MM = 210;
      const A4_H_MM = 297;

      for (let i = 0; i < pageEls.length; i++) {
        const el = pageEls[i];

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          // Đảm bảo chụp đúng kích thước A4 div (794×1123)
          width: el.offsetWidth,
          height: el.offsetHeight,
          windowWidth: el.offsetWidth,
          windowHeight: el.offsetHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);

        if (i > 0) pdf.addPage();

        // Fit ảnh vào trang A4 (có thể có padding nhỏ hai bên nếu tỷ lệ lệch)
        const canvasRatio = canvas.height / canvas.width;
        const imgH = A4_W_MM * canvasRatio;

        if (imgH <= A4_H_MM) {
          // Ảnh thấp hơn A4 → căn giữa theo chiều dọc
          const offsetY = (A4_H_MM - imgH) / 2;
          pdf.addImage(imgData, "JPEG", 0, offsetY, A4_W_MM, imgH);
        } else {
          // Ảnh cao hơn A4 (hiếm) → scale theo chiều cao
          const imgW = A4_H_MM / canvasRatio;
          const offsetX = (A4_W_MM - imgW) / 2;
          pdf.addImage(imgData, "JPEG", offsetX, 0, imgW, A4_H_MM);
        }
      }

      pdf.save(`invoice-${invoice.invoice_number}.pdf`);
    } catch (err) {
      logError("Error generating PDF:", err);
      alert("Có lỗi khi tạo PDF. Vui lòng thử lại!");
    }
  };

  const handleSaveCustomData = () => {
    if (onSave) {
      onSave({
        companyInfo: editableCompany,
        clientInfo: editableClient,
        notes,
        invoiceId: invoice.id,
      });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.outerWrap}>
      {/* Controls */}
      <div style={s.controlsBar} className="no-print">
        <button style={s.btn} onClick={handleDownloadPDF}>
          {t[language].downloadPdf}
        </button>
        <select
          style={s.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
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

      {/* All pages wrapper — html2pdf sẽ tự cắt tại .pdf-page-break */}
      <div ref={printRef} className="invoice-pages-container">
        {itemPages.map((pageItems, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === totalPages - 1;
          const itemOffset = itemPages
            .slice(0, pageIdx)
            .reduce((acc, p) => acc + p.length, 0);

          return (
            <React.Fragment key={pageIdx}>
              {/* Khoảng cách visual giữa các trang trên web */}
              {pageIdx > 0 && <div className="pdf-page-gap" />}

              <div style={s.a4} data-pdf-page={pageIdx}>
                {/* Page number */}
                <div style={s.pageNum}>
                  {t[language].page} {pageIdx + 1}
                  {totalPages > 1 ? ` / ${totalPages}` : ""}
                </div>

                {/* ── PAGE 1: Header + Parties ── */}
                {isFirstPage && (
                  <>
                    {/* HEADER */}
                    <div style={s.header}>
                      <div style={s.logoBrandBlock}>
                        <div style={s.logoSlot}>
                          <CustomImage
                            src={"/icons/logo.svg"}
                            alt="Logo"
                            style={s.logoImg}
                          />
                        </div>
                        <div>
                          <EditableSpan
                            value={editableCompany.name}
                            onChange={(v) => updateCompanyField("name", v)}
                            style={s.brandName}
                          />
                          <EditableSpan
                            value={editableCompany.tagline}
                            onChange={(v) => updateCompanyField("tagline", v)}
                            style={s.brandTagline}
                          />
                          <div style={s.brandMeta}>
                            <MetaRow label={t[language].taxId}>
                              <EditableSpan
                                value={editableCompany.mst}
                                onChange={(v) => updateCompanyField("mst", v)}
                                style={s.editable}
                              />
                            </MetaRow>
                            <MetaRow label={t[language].phone}>
                              <EditableSpan
                                value={editableCompany.phone}
                                onChange={(v) => updateCompanyField("phone", v)}
                                style={s.editable}
                              />
                            </MetaRow>
                            <MetaRow label={t[language].email}>
                              <EditableSpan
                                value={editableCompany.email}
                                onChange={(v) => updateCompanyField("email", v)}
                                style={s.editable}
                              />
                            </MetaRow>
                            <MetaRow label={t[language].website}>
                              <EditableSpan
                                value={editableCompany.website}
                                onChange={(v) =>
                                  updateCompanyField("website", v)
                                }
                                style={s.editable}
                              />
                            </MetaRow>
                          </div>
                        </div>
                      </div>

                      {/* Invoice meta */}
                      <div style={s.invoiceMetaBlock}>
                        <div style={s.invoiceTitleBig}>
                          {t[language].invoiceTitle}
                        </div>
                        <div style={s.invoiceSub}>
                          {t[language].invoiceSubtitle}
                        </div>
                        <div style={s.metaGrid}>
                          <span style={s.mk}>{t[language].invoiceNumber}</span>
                          <span style={s.mv}>{invoice.invoice_number}</span>
                          <span style={s.mk}>{t[language].issueDate}</span>
                          <span style={s.mv}>
                            {formatDocDate(invoice.issued_at)}
                          </span>
                          <span style={s.mk}>{t[language].dueDate}</span>
                          <span style={s.mv}>
                            {invoice.due_at
                              ? formatDocDate(invoice.due_at)
                              : "—"}
                          </span>
                          <span style={s.mk}>{t[language].paidDate}</span>
                          <span style={s.mv}>
                            {invoice.paid_at
                              ? formatDocDate(invoice.paid_at)
                              : "—"}
                          </span>
                        </div>
                        <span style={isPaid ? s.badgePaid : s.badgeUnpaid}>
                          {isPaid ? t[language].paid : t[language].unpaid}
                        </span>
                      </div>
                    </div>

                    {/* PARTIES */}
                    <div style={s.partiesGrid}>
                      {/* Client */}
                      <div style={s.partyBox}>
                        <div style={s.partyLabel}>{t[language].client}</div>
                        <EditableSpan
                          value={editableClient.companyName}
                          onChange={(v) => updateClientField("companyName", v)}
                          style={s.partyName}
                        />
                        <div style={s.partyDetail}>
                          <PartyRow label={t[language].contactPerson}>
                            <EditableSpan
                              value={editableClient.contactPerson}
                              onChange={(v) =>
                                updateClientField("contactPerson", v)
                              }
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].taxId}>
                            <EditableSpan
                              value={editableClient.mst}
                              onChange={(v) => updateClientField("mst", v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].address}>
                            <EditableSpan
                              value={editableClient.address}
                              onChange={(v) => updateClientField("address", v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].phone}>
                            <EditableSpan
                              value={editableClient.phone}
                              onChange={(v) => updateClientField("phone", v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].email}>
                            <EditableSpan
                              value={editableClient.email}
                              onChange={(v) => updateClientField("email", v)}
                              style={s.editable}
                            />
                          </PartyRow>
                        </div>
                        <div style={s.partyMeta}>
                          <div
                            style={{
                              fontSize: 9,
                              color: "#9a9ab0",
                              marginTop: 6,
                            }}
                          >
                            Property ID: {invoice.property_id} • Billing:{" "}
                            {invoice.billing_record_id}
                          </div>
                        </div>
                      </div>

                      {/* Seller */}
                      <div style={{ ...s.partyBox, ...s.partyBoxSeller }}>
                        <div style={s.partyLabel}>{t[language].provider}</div>
                        <EditableSpan
                          value={editableCompany.name}
                          onChange={(v) => updateCompanyField("name", v)}
                          style={s.partyName}
                        />
                        <div style={s.partyDetail}>
                          <PartyRow label={t[language].taxId}>
                            <EditableSpan
                              value={editableCompany.mst}
                              onChange={(v) => updateCompanyField("mst", v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].address}>
                            <EditableSpan
                              value={editableCompany.address}
                              onChange={(v) => updateCompanyField("address", v)}
                              style={s.editable}
                            />
                          </PartyRow>
                          <PartyRow label={t[language].account}>
                            <EditableSpan
                              value={editableCompany.bankAccount}
                              onChange={(v) =>
                                updateCompanyField("bankAccount", v)
                              }
                              style={s.editable}
                            />
                          </PartyRow>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Tất cả các page: Items table ── */}
                <div style={s.sectionTitle}>
                  {t[language].serviceDetails}
                  {totalPages > 1 && (
                    <span
                      style={{ fontWeight: 400, color: "#999", marginLeft: 8 }}
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

                {/* ── Last page: Notes + Totals + Bank + Signature ── */}
                {isLastPage && (
                  <>
                    {/* NOTES + TOTALS */}
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
                            value={fmt(invoice.sub_total, invoice.currency)}
                          />
                          <TotalsRow
                            label={`${t[language].tax} (${bpsToPercent(invoice.tax_rate_bps)}%)`}
                            value={fmt(invoice.tax_amount, invoice.currency)}
                          />
                          <TotalsRow
                            label={t[language].grandTotal}
                            value={fmt(
                              invoice.invoice_amount,
                              invoice.currency,
                            )}
                            grand
                          />
                        </div>
                      </div>
                    </div>

                    {/* BANK */}
                    <div style={{ marginTop: 20 }}>
                      <div style={s.sectionTitle}>{t[language].bankInfo}</div>
                      <div style={s.bankInfo}>
                        <span style={s.bk}>{t[language].accountHolder}</span>{" "}
                        <EditableSpan
                          value={editableCompany.bankName}
                          onChange={(v) => updateCompanyField("bankName", v)}
                          style={{ ...s.bv, ...s.editable }}
                        />
                        &emsp;
                        <span style={s.bk}>
                          {t[language].accountNumber}
                        </span>{" "}
                        <EditableSpan
                          value={editableCompany.bankAccount}
                          onChange={(v) => updateCompanyField("bankAccount", v)}
                          style={{ ...s.bv, ...s.editable }}
                        />
                        &emsp;
                        <span style={s.bk}>{t[language].bank}</span>{" "}
                        <EditableSpan
                          value={editableCompany.bankBranch}
                          onChange={(v) => updateCompanyField("bankBranch", v)}
                          style={{ ...s.bv, ...s.editable }}
                        />
                      </div>
                    </div>

                    {/* SIGNATURE */}
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
                            onChange={(v) => updateCompanyField("name", v)}
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

                {/* ── Trang giữa (không phải last): ghi chú tiếp theo ── */}
                {!isLastPage && (
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 12,
                      borderTop: "1px dashed #ddd",
                      fontSize: 9,
                      color: "#bbb",
                      textAlign: "right",
                    }}
                  >
                    {t[language].nextPage} {pageIdx + 2}
                  </div>
                )}

                {/* FOOTER */}
                <div style={s.footer}>
                  <span>
                    {t[language].invoiceFooter}
                    {invoice.invoice_number}
                  </span>
                  <EditableSpan
                    value={editableCompany.website}
                    onChange={(v) => updateCompanyField("website", v)}
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

// ─── Styles (giữ nguyên 100%) ─────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  outerWrap: {
    background: "#f5f5f5",
    padding: "2rem 1rem",
    minHeight: "100vh",
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
  controlsBar: {
    maxWidth: 794,
    margin: "0 auto 1.5rem",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  btn: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 13,
    padding: "8px 18px",
    borderRadius: 4,
    cursor: "pointer",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    fontWeight: 500,
  },
  select: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 13,
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    fontWeight: 500,
    outline: "none",
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  a4: {
    width: 794,
    minHeight: 1123,
    background: "#ffffff",
    border: "1px solid #ddd",
    padding: "60px 70px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    color: "#000",
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 11,
    lineHeight: 1.6,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  pageNum: {
    position: "absolute",
    top: 20,
    right: 30,
    fontSize: 9,
    color: "#999",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "2px solid #000",
  },
  logoBrandBlock: {
    display: "flex",
    alignItems: "flex-start",
    gap: 15,
    flex: 1,
  },
  logoSlot: {
    width: 60,
    height: 60,
    border: "1px solid #ddd",
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    overflow: "hidden",
    background: "#fafafa",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: 4,
  },
  brandName: {
    display: "block",
    fontSize: 18,
    fontWeight: 700,
    color: "#000",
    lineHeight: 1.3,
    marginBottom: 4,
  },
  brandTagline: {
    display: "block",
    fontSize: 10,
    color: "#666",
    letterSpacing: "0.05em",
    marginBottom: 10,
  },
  brandMeta: {
    fontSize: 10,
    color: "#333",
    lineHeight: 1.8,
  },
  invoiceMetaBlock: {
    textAlign: "right",
  },
  invoiceTitleBig: {
    fontSize: 20,
    fontWeight: 700,
    color: "#000",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  invoiceSub: {
    fontSize: 10,
    color: "#666",
    marginBottom: 12,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "auto auto",
    gap: "4px 12px",
    fontSize: 10,
    textAlign: "left",
  },
  mk: { color: "#666", fontSize: 10, textAlign: "right" },
  mv: { color: "#000", fontWeight: 600, fontSize: 10 },
  badgeUnpaid: {
    display: "inline-block",
    marginTop: 10,
    padding: "4px 10px",
    borderRadius: 2,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    border: "1px solid #000",
    background: "#fff",
    color: "#000",
  },
  badgePaid: {
    display: "inline-block",
    marginTop: 10,
    padding: "4px 10px",
    borderRadius: 2,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: "#000",
    color: "#fff",
  },
  partiesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 25,
  },
  partyBox: {
    padding: "12px 14px",
    border: "1px solid #ddd",
    background: "#fafafa",
  },
  partyBoxSeller: {
    background: "#f5f5f5",
    border: "1px solid #ccc",
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#000",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: "1px solid #ddd",
  },
  partyName: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#000",
    marginBottom: 6,
  },
  partyDetail: {
    fontSize: 10,
    color: "#333",
    lineHeight: 1.8,
  },
  partyMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px dashed #ddd",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#000",
    marginBottom: 10,
    marginTop: 5,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #000",
  },
  thead: {
    background: "#000",
    color: "#fff",
  },
  th: {
    padding: "8px 10px",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    textAlign: "left",
    borderRight: "1px solid #333",
  },
  trOdd: { borderBottom: "1px solid #ddd" },
  trEven: { borderBottom: "1px solid #ddd", background: "#fafafa" },
  td: {
    padding: "8px 10px",
    fontSize: 10,
    verticalAlign: "top",
    borderRight: "1px solid #ddd",
  },
  itemSub: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  notesTotalsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginTop: 10,
  },
  textarea: {
    width: "100%",
    minHeight: 70,
    border: "1px solid #ddd",
    borderRadius: 2,
    padding: 10,
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 10,
    color: "#333",
    background: "#fafafa",
    resize: "none",
    lineHeight: 1.6,
    outline: "none",
  },
  totalsBox: {
    border: "1px solid #000",
  },
  bankInfo: {
    border: "1px solid #ccc",
    background: "#fafafa",
    padding: "10px 14px",
    fontSize: 10,
    color: "#333",
    lineHeight: 1.8,
  },
  bk: { color: "#666", fontSize: 9, fontWeight: 600 },
  bv: { color: "#000", fontWeight: 700 },
  sigSection: {
    marginTop: 40,
    display: "flex",
    justifyContent: "flex-end",
  },
  sigBox: {
    width: 200,
    textAlign: "center",
  },
  sigLabel: {
    fontSize: 10,
    color: "#333",
    marginBottom: 60,
    fontWeight: 600,
  },
  sigLine: {
    borderTop: "1px solid #000",
    paddingTop: 8,
    fontSize: 11,
    fontWeight: 700,
    color: "#000",
  },
  sigSub: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#999",
  },
  editable: {
    cursor: "text",
    borderRadius: 2,
    minWidth: 20,
    display: "inline-block",
  },
};
