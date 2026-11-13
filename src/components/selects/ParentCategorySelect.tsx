'use client';

import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui';
import { ServiceCategoryList } from '@/libs/responses';
import type { ServiceCategory } from '@/types';

interface ParentCategorySelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  currentCategoryId?: string;
  disabled?: boolean;
  required?: boolean;
  refreshKey?: number;
}

export const ParentCategorySelect: React.FC<ParentCategorySelectProps> = ({
  value,
  onChange,
  currentCategoryId,
  disabled = false,
  required = false,
  refreshKey = 0,
}) => {
  const { categories, isLoading } = ServiceCategoryList(
    1,
    { page_size: 100 },
    refreshKey
  );

  const availableCategories = useMemo(() => {
    if (!currentCategoryId) return categories;

    const isDescendant = (
      category: ServiceCategory,
      ancestorId: string
    ): boolean => {
      if (category.id === ancestorId) return true;
      if (category.parent_id === ancestorId) return true;
      if (!category.parent_id) return false;

      const parent = categories.find(
        (c: ServiceCategory) => c.id === category.parent_id
      );
      return parent ? isDescendant(parent, ancestorId) : false;
    };

    return categories.filter(
      (cat: ServiceCategory) =>
        cat.id !== currentCategoryId && !isDescendant(cat, currentCategoryId)
    );
  }, [categories, currentCategoryId]);

  const topLevelCategories = useMemo(() => {
    return availableCategories.filter((cat: ServiceCategory) => !cat.parent_id);
  }, [availableCategories]);

  const handleValueChange = (newValue: string) => {
    if (newValue === 'none') {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="parent_category">
        Parent Category {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value || 'none'}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="parent_category" className="w-full">
          <SelectValue placeholder="Select parent category (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-gray-500">None (Top-level category)</span>
          </SelectItem>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading categories...
            </SelectItem>
          ) : topLevelCategories.length === 0 ? (
            <SelectItem value="empty" disabled>
              No categories available
            </SelectItem>
          ) : (
            topLevelCategories.map((category: ServiceCategory) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
                {category.code && (
                  <span className="text-gray-500 text-xs ml-2">
                    ({category.code})
                  </span>
                )}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="text-gray-500 text-sm">
        Select a parent category to create a sub-category. Leave as &quot;None&quot; to
        create a top-level category.
      </p>
    </div>
  );
};
