'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileImage, FileVideo, FileText, File } from 'lucide-react';

interface CoaTypeSelectProps {
  handleCoaTypeChange: (value: string) => void;
  coaType: string;
}

const coaTypes = [
  { value: 'all', label: 'All Files', icon: File },
  { value: 'asset', label: 'Asset', icon: FileImage },
  { value: 'liability', label: 'Liability', icon: FileVideo },
  { value: 'equity', label: 'Equity', icon: FileImage },
  { value: 'revenue', label: 'Revenue', icon: FileImage },
  { value: 'expense', label: 'Expense', icon: FileText },
];

export function CoaTypeSelect({
  handleCoaTypeChange,
  coaType,
}: CoaTypeSelectProps) {
  const selectedType = coaTypes.find((type) => type.value === coaType);
  const Icon = selectedType?.icon || File;

  return (
    <Select value={coaType} onValueChange={handleCoaTypeChange}>
      <SelectTrigger className="w-[140px] h-8 text-xs border-gray-200 focus:ring-main">
        <div className="flex items-center gap-2">
          <SelectValue placeholder="File type" />
        </div>
      </SelectTrigger>
      <SelectContent align="start" position="popper" sideOffset={5}>
        {coaTypes.map((type) => {
          const TypeIcon = type.icon;
          return (
            <SelectItem key={type.value} value={type.value} className="text-xs">
              <div className="flex items-center gap-2">
                <TypeIcon size={14} className="text-gray-500" />
                <span>{type.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
