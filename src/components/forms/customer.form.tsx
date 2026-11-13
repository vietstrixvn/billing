'use client';

import React from 'react';
import { Input } from '@/components/ui';
import type { CreateCustomerDTO } from '@/types';

interface CustomerFormProps {
  formData: CreateCustomerDTO;
  setFormData: React.Dispatch<React.SetStateAction<CreateCustomerDTO>>;
  handleSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isEditing: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  formData,
  setFormData,
  handleSubmit,
  isPending,
  isEditing,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="John Doe"
          value={formData.full_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
          }
          required
          className="text-xs h-9"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="customer@example.com"
          value={formData.email || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="text-xs h-9"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <Input
          type="text"
          placeholder="+84 987 654 321"
          value={formData.phone_number || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              phone_number: e.target.value,
            }))
          }
          className="text-xs h-9"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tax Code
        </label>
        <Input
          type="text"
          placeholder="0123456789"
          value={formData.tax_code || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tax_code: e.target.value }))
          }
          className="text-xs h-9"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <Input
          type="text"
          placeholder="ABC Company Ltd."
          value={formData.company_name || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              company_name: e.target.value,
            }))
          }
          className="text-xs h-9"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Address
        </label>
        <Input
          type="text"
          placeholder="123 Main Street"
          value={formData.address || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          className="text-xs h-9"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-main hover:bg-blue-700 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 mt-2"
      >
        {isEditing ? 'Update Customer' : 'Create Customer'}
      </button>
    </form>
  );
};
