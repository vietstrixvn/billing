'use client';

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

export const PlanOrderSelect = ({
  handleOrderChange,
  order,
}: {
  handleOrderChange: (value: string) => void;
  order: string;
}) => {
  return (
    <Select onValueChange={handleOrderChange} defaultValue={String(order)}>
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
        <SelectItem value="asc" className="rounded-md">
          Asc
        </SelectItem>
        <SelectItem value="desc" className="rounded-md">
          Desc
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
