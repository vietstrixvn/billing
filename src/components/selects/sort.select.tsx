'use client';

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';

export const SortSelect = ({
  handleSortChange,
  sort,
}: {
  handleSortChange: (value: string) => void;
  sort: string;
}) => {
  return (
    <Select onValueChange={handleSortChange} defaultValue={String(sort)}>
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
          Oldest
        </SelectItem>
        <SelectItem value="desc" className="rounded-md">
          Newest
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
