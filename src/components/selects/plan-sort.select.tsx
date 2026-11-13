// order=asc|desc (default: desc)

'use client';

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

export const PlanSortSelect = ({
  handleSortChange,
  sort_by,
}: {
  handleSortChange: (value: string) => void;
  sort_by: string;
}) => {
  return (
    <Select onValueChange={handleSortChange} defaultValue={String(sort_by)}>
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
        <SelectItem value="amount" className="rounded-md">
          Amount
        </SelectItem>
        <SelectItem value="issued_at" className="rounded-md">
          Issued at
        </SelectItem>
        <SelectItem value="due_at" className="rounded-md">
          Due at
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
