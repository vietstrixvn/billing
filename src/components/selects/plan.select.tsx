"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PlanList } from "@/libs/responses";
import { useDebounce } from "@/hooks/useDebounce";

interface PlanSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /**
   * If true, uses plan.code as value
   * If false, uses plan.id as value
   */
  useCode?: boolean;
}

export function PlanSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select a plan",
  useCode = false,
}: PlanSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const { plans, isLoading } = PlanList(1, { page_size: 100 }, 0);

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    if (!debouncedSearch) return plans;
    const query = debouncedSearch.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(query) ||
        plan.code.toLowerCase().includes(query) ||
        (plan.description && plan.description.toLowerCase().includes(query)),
    );
  }, [plans, debouncedSearch]);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="overflow-hidden">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        align="start"
        position="popper"
        sideOffset={5}
        style={{ width: "var(--radix-select-trigger-width)" }}
        className="min-w-[200px]"
      >
        {/* Search Input */}
        <div className="flex items-center px-2 pb-2 border-b">
          <Search className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <SelectItem value="loading" disabled>
            Loading plans...
          </SelectItem>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlans.length === 0 && (
          <SelectItem value="none" disabled>
            {searchQuery ? "No plans found" : "No plans available"}
          </SelectItem>
        )}

        {/* Plan List */}
        {!isLoading &&
          filteredPlans.map((plan) => (
            <SelectItem
              key={plan.id}
              value={useCode ? plan.code : plan.id}
              textValue={plan.name}
              className="flex-col items-start"
            >
              <span className="font-medium block truncate">{plan.name}</span>
              <span className="text-xs text-gray-500 block truncate">
                Code: {plan.code}
              </span>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
