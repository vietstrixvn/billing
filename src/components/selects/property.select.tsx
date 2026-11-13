import React from 'react';

export function PropertySelect({ value, onValueChange, className }: any) {
  return (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} className={className}>
      <option value="all">All Properties</option>
    </select>
  );
}
