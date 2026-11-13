'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { ServiceCategoryList } from '@/libs/responses';
import { Loader } from '../loading/loader';

interface PostCategorySelectProps {
  selectedCategory: string;
  handleCategoryChange: (value: string) => void;
  defaultCategory?: string;
}

export const ServiceCategorySelect: React.FC<PostCategorySelectProps> = ({
  selectedCategory,
  handleCategoryChange,
  defaultCategory,
}) => {
  const { categories, isLoading } = ServiceCategoryList(1, {}, 0);

  // Sử dụng defaultCategory nếu selectedCategory trống
  const currentValue = selectedCategory || defaultCategory || '';

  return (
    <Select value={currentValue} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-[180px] rounded-md px-4 h-16 bg-white">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent
        className="rounded-md bg-white min-w-[180px] "
        align="start"
        position="popper"
        sideOffset={5}
      >
        <SelectItem value="all" className="rounded-md">
          All
        </SelectItem>
        {isLoading ? (
          <SelectItem value="loading" disabled className="rounded-md">
            <Loader />
          </SelectItem>
        ) : (
          categories?.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="rounded-md"
            >
              {category.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
