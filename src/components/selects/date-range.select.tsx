'use client';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface DateRangeSelectProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangeSelect({
  value,
  onChange,
  placeholder = 'Pick date range',
}: DateRangeSelectProps) {
  const [open, setOpen] = useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'dd/MM/yy')} – ${format(value.to, 'dd/MM/yy')}`
      : format(value.from, 'dd/MM/yy')
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-zinc-200 bg-white text-xs text-zinc-700 hover:bg-zinc-50 transition-colors',
            !value?.from && 'text-zinc-400'
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{label}</span>
          {value?.from && (
            <X
              className="h-3 w-3 ml-0.5 text-zinc-400 hover:text-zinc-700"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
