import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Edit,
  Trash2,
  Package,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface InvoiceHeaderProps {
  onBack: () => void;
  onSendEmail?: () => void;
  onViewPdf?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageItems?: () => void;
}

export function InvoiceHeader({
  onBack,
  onSendEmail,
  onViewPdf,
  onDownload,
  onPrint,
  onEdit,
  onDelete,
  onManageItems,
}: InvoiceHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-1.5">
        {onViewPdf && (
          <Button variant="outline" size="sm" onClick={onViewPdf}>
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            View PDF
          </Button>
        )}
        {onManageItems && (
          <Button variant="outline" size="sm" onClick={onManageItems}>
            <Package className="w-3.5 h-3.5 mr-1.5" />
            Manage Items
          </Button>
        )}
        {onSendEmail && (
          <Button variant="outline" size="sm" onClick={onSendEmail}>
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Send Email
          </Button>
        )}
        {onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download
          </Button>
        )}
        {onPrint && (
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print
          </Button>
        )}

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1.5 pl-1.5 ml-1 border-l border-border">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/30 hover:border-destructive/50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
