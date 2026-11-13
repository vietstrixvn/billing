'use client';

import { ContainerProps } from '@/types';

export function FilterContainer({ children, className }: ContainerProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg mb-2 mt-4 p-3 border-b-2 border-main shadow-xs [&>.flex]:flex-wrap [&>.flex]:gap-3 ${className}`}
    >
      {children}
    </div>
  );
}
