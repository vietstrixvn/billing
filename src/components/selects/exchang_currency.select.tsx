'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExchangeTypeSelectProps {
  handleExchangeTypeChange: (value: string) => void;
  exchangeType: string;
}

const CURRENCIES = [
  { value: 'all', label: 'All' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'JPY', label: 'JPY' },
  { value: 'CNY', label: 'CNY' },
  { value: 'SGD', label: 'SGD' },
  { value: 'GBP', label: 'GBP' },
];

export function ExchangeTypeSelect({
  handleExchangeTypeChange,
  exchangeType,
}: ExchangeTypeSelectProps) {
  return (
    <Select value={exchangeType} onValueChange={handleExchangeTypeChange}>
      <SelectTrigger className="w-[140px] h-8 text-xs border-gray-200 focus:ring-main">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent align="start" position="popper" sideOffset={5}>
        {CURRENCIES.map((currency) => (
          <SelectItem
            key={currency.value}
            value={currency.value}
            className="text-xs"
          >
            {currency.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
