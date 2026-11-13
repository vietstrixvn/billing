'use client';

import { CompanyInfo, ClientInfo } from '@/libs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface InvoiceEditorSidebarProps {
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  onCompanyChange: <K extends keyof CompanyInfo>(key: K, value: string) => void;
  onClientChange: <K extends keyof ClientInfo>(key: K, value: string) => void;
}

function FieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}

export function InvoiceEditorSidebar({
  companyInfo,
  clientInfo,
  onCompanyChange,
  onClientChange,
}: InvoiceEditorSidebarProps) {
  return (
    <div className="space-y-6 p-4 border bg-white text-card-foreground h-fit sticky top-4">
      {/* Company Info */}
      <div className="space-y-3">
        <p className="text-sm text-main font-semibold">Company Information</p>
        <FieldRow
          label="Company Name"
          value={companyInfo.name}
          onChange={(v) => onCompanyChange('name', v)}
        />
        <FieldRow
          label="Tagline"
          value={companyInfo.tagline}
          onChange={(v) => onCompanyChange('tagline', v)}
        />
        <FieldRow
          label="Tax ID"
          value={companyInfo.mst}
          onChange={(v) => onCompanyChange('mst', v)}
        />
        <FieldRow
          label="Phone"
          value={companyInfo.phone}
          onChange={(v) => onCompanyChange('phone', v)}
        />
        <FieldRow
          label="Email"
          value={companyInfo.email}
          onChange={(v) => onCompanyChange('email', v)}
        />
        <FieldRow
          label="Website"
          value={companyInfo.website}
          onChange={(v) => onCompanyChange('website', v)}
        />
        <FieldRow
          label="Address"
          value={companyInfo.address}
          onChange={(v) => onCompanyChange('address', v)}
        />
      </div>

      <Separator />

      {/* Bank Info */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Bank Information</p>
        <FieldRow
          label="Account Name"
          value={companyInfo.bankName}
          onChange={(v) => onCompanyChange('bankName', v)}
        />
        <FieldRow
          label="Account Number"
          value={companyInfo.bankAccount}
          onChange={(v) => onCompanyChange('bankAccount', v)}
        />
        <FieldRow
          label="Branch"
          value={companyInfo.bankBranch}
          onChange={(v) => onCompanyChange('bankBranch', v)}
        />
      </div>

      <Separator />

      {/* Client Info */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Client Information</p>
        <FieldRow
          label="Company Name"
          value={clientInfo.companyName}
          onChange={(v) => onClientChange('companyName', v)}
        />
        <FieldRow
          label="Contact Person"
          value={clientInfo.contactPerson}
          onChange={(v) => onClientChange('contactPerson', v)}
        />
        <FieldRow
          label="Tax ID"
          value={clientInfo.mst}
          onChange={(v) => onClientChange('mst', v)}
        />
        <FieldRow
          label="Address"
          value={clientInfo.address}
          onChange={(v) => onClientChange('address', v)}
        />
        <FieldRow
          label="Phone"
          value={clientInfo.phone}
          onChange={(v) => onClientChange('phone', v)}
        />
        <FieldRow
          label="Email"
          value={clientInfo.email}
          onChange={(v) => onClientChange('email', v)}
        />
      </div>
    </div>
  );
}
