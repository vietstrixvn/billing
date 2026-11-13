'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

interface QuoteStatusSelectProps {
  status: string;
  handleStatusChange: (value: string) => void;
}

export const QuoteStatusSelect: React.FC<QuoteStatusSelectProps> = ({
  status,
  handleStatusChange,
}) => {
  return (
    <Select value={status} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px] rounded-md border-gray-300">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-300">
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="sent">Sent</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
        <SelectItem value="expired">Expired</SelectItem>
      </SelectContent>
    </Select>
  );
};
