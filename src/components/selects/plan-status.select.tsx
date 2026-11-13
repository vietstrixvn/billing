// sort_by=amount|issued_at|due_at (default: issued_at)
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

export const PlanStatusSelect = ({
  handleStatusChange,
  status,
}: {
  handleStatusChange: (value: string) => void;
  status: string;
}) => {
  return (
    <Select onValueChange={handleStatusChange} defaultValue={String(status)}>
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
        <SelectItem value="paid" className="rounded-md">
          Paid
        </SelectItem>
        <SelectItem value="overdue" className="rounded-md">
          Overdue
        </SelectItem>
        <SelectItem value="pending" className="rounded-md">
          Pending
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
