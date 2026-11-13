'use client';

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

export const RecordTypeSelect = ({
  handleTypeChange,
  type,
}: {
  handleTypeChange: (value: string) => void;
  type: string;
}) => {
  return (
    <Select onValueChange={handleTypeChange} defaultValue={String(type)}>
      <SelectTrigger
        className="w-[120px] rounded-md bg-white px-4 "
        size="default"
      >
        <SelectValue placeholder={status} />
      </SelectTrigger>
      <SelectContent
        className="rounded-md bg-white min-w-[80px]"
        align="start"
        position="popper"
        sideOffset={5}
      >
        <SelectItem value="all" className="rounded-md">
          All
        </SelectItem>
        <SelectItem value="invoice" className="rounded-md">
          Invoice
        </SelectItem>
        <SelectItem value="credit" className="rounded-md">
          Credit
        </SelectItem>
        <SelectItem value="adjustment" className="rounded-md">
          Adjustment
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
