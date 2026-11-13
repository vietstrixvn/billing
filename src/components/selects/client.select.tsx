'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useClients } from '@/hooks/billing/useClient';
import type { Client } from '@/types';
import { Building2, Search } from 'lucide-react';

interface ClientSelectProps {
  value?: string;
  onValueChange?: (clientId: string) => void;
  onSelectClient?: (client: Client | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ClientSelect: React.FC<ClientSelectProps> = ({
  value,
  onValueChange,
  onSelectClient,
  placeholder = 'Select a client…',
  className = '',
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const { clients, isLoading } = useClients(1, { search, status: 'active' }, 0, 50);

  const handleSelect = (selectedId: string) => {
    if (selectedId === 'none') {
      onValueChange?.('');
      onSelectClient?.(null);
      return;
    }

    const client = clients.find((c) => c.id === selectedId) || null;
    onValueChange?.(selectedId);
    onSelectClient?.(client);
  };

  return (
    <Select value={value || 'none'} onValueChange={handleSelect} disabled={disabled}>
      <SelectTrigger className={`rounded-none border-gray-300 h-9 text-sm focus:ring-0 focus:border-gray-900 bg-white ${className}`}>
        <SelectValue placeholder={placeholder}>
          {value && value !== 'none' ? (
            (() => {
              const selected = clients.find((c) => c.id === value);
              return selected ? (
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{selected.business_name}</span>
                  {selected.tax_code && (
                    <span className="text-xs text-slate-400 font-mono">({selected.tax_code})</span>
                  )}
                </span>
              ) : (
                <span className="text-slate-600 font-mono text-xs">{value}</span>
              );
            })()
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-none max-h-60 bg-white border-gray-300">
        <SelectItem value="none" className="text-slate-400 text-xs font-normal">
          -- Manual Entry / No Saved Client --
        </SelectItem>
        {isLoading ? (
          <div className="p-3 text-center text-xs text-slate-400 animate-pulse">
            Loading clients…
          </div>
        ) : clients.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-400">
            No active clients found
          </div>
        ) : (
          clients.map((client) => (
            <SelectItem key={client.id} value={client.id} className="text-xs py-2">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{client.business_name}</span>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                  {client.tax_code && <span>MST: {client.tax_code}</span>}
                  {client.email && <span>• {client.email}</span>}
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
