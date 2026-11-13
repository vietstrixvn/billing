'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserCheck, Building2, User, Mail, Phone, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui';
import type { Client, CreateClientDTO, UpdateClientDTO, CreateContactDTO } from '@/types';

interface ClientFormProps {
  clientToEdit?: Client | null;
  onSubmitCreate: (dto: CreateClientDTO) => void;
  onSubmitUpdate: (id: string, dto: UpdateClientDTO) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  clientToEdit,
  onSubmitCreate,
  onSubmitUpdate,
  onCancel,
  isPending,
}) => {
  const isEditing = !!clientToEdit;

  const [businessName, setBusinessName] = useState('');
  const [businessAlias, setBusinessAlias] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [ownerId, setOwnerId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Dynamic Contacts state (for create mode)
  const [contacts, setContacts] = useState<CreateContactDTO[]>([]);

  useEffect(() => {
    if (clientToEdit) {
      setBusinessName(clientToEdit.business_name || '');
      setBusinessAlias(clientToEdit.business_alias || '');
      setTaxCode(clientToEdit.tax_code || '');
      setLegalRepresentative(clientToEdit.legal_representative || '');
      setPhoneNumber(clientToEdit.phone_number || '');
      setEmail(clientToEdit.email || '');
      setAddress(clientToEdit.address || '');
      setCity(clientToEdit.city || '');
      setBillingAddress(clientToEdit.billing_address || '');
      setCurrency(clientToEdit.currency || 'VND');
      setOwnerId(clientToEdit.owner_id || '');
      setStatus((clientToEdit.status as 'active' | 'inactive') || (clientToEdit.is_active === false ? 'inactive' : 'active'));
    } else {
      setBusinessName('');
      setBusinessAlias('');
      setTaxCode('');
      setLegalRepresentative('');
      setPhoneNumber('');
      setEmail('');
      setAddress('');
      setCity('');
      setBillingAddress('');
      setCurrency('VND');
      setOwnerId('');
      setStatus('active');
      setContacts([]);
    }
  }, [clientToEdit]);

  const handleAddContactItem = () => {
    setContacts((prev) => [
      ...prev,
      {
        name: '',
        role: '',
        email: '',
        phone: '',
        is_primary: prev.length === 0, // First contact is primary by default
      },
    ]);
  };

  const handleRemoveContactItem = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContactChange = (index: number, field: keyof CreateContactDTO, value: any) => {
    setContacts((prev) =>
      prev.map((c, i) => {
        if (i === index) {
          return { ...c, [field]: value };
        }
        // If toggled is_primary, uncheck primary on other contacts
        if (field === 'is_primary' && value === true) {
          return { ...c, is_primary: false };
        }
        return c;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    if (isEditing && clientToEdit) {
      const updateDto: UpdateClientDTO = {
        business_name: businessName.trim(),
        business_alias: businessAlias.trim() || undefined,
        tax_code: taxCode.trim() || undefined,
        legal_representative: legalRepresentative.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        billing_address: billingAddress.trim() || undefined,
        currency: currency.trim() || 'VND',
        owner_id: ownerId.trim() || undefined,
        status,
      };
      onSubmitUpdate(clientToEdit.id, updateDto);
    } else {
      const validContacts = contacts
        .filter((c) => c.name.trim().length > 0)
        .map((c) => ({
          name: c.name.trim(),
          role: c.role?.trim() || undefined,
          email: c.email?.trim() || undefined,
          phone: c.phone?.trim() || undefined,
          is_primary: !!c.is_primary,
        }));

      const createDto: CreateClientDTO = {
        business_name: businessName.trim(),
        business_alias: businessAlias.trim() || undefined,
        tax_code: taxCode.trim() || undefined,
        legal_representative: legalRepresentative.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        billing_address: billingAddress.trim() || undefined,
        currency: currency.trim() || 'VND',
        owner_id: ownerId.trim() || undefined,
        contacts: validContacts.length > 0 ? validContacts : undefined,
      };
      onSubmitCreate(createDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Company Info Section */}
      <div className="bg-slate-50/70 p-4 border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <Building2 className="h-4 w-4 text-indigo-600" />
          Company & Business Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Vietstrix Co., Ltd"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="text-xs h-9 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Business Alias / Trade Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Vietstrix"
              value={businessAlias}
              onChange={(e) => setBusinessAlias(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tax Code
            </label>
            <Input
              type="text"
              placeholder="e.g. 0101234567"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              className="text-xs h-9 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Legal Representative
            </label>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={legalRepresentative}
              onChange={(e) => setLegalRepresentative(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-xs h-9 px-3 border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="VND">VND - Vietnamese Dong</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="SGD">SGD - Singapore Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Company Email
            </label>
            <Input
              type="email"
              placeholder="contact@vietstrix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Company Phone
            </label>
            <Input
              type="text"
              placeholder="0901234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-xs h-9 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Account Owner ID
            </label>
            <Input
              type="text"
              placeholder="user_uuid_123"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="text-xs h-9 bg-white font-mono"
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full text-xs h-9 px-3 border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-slate-50/70 p-4 border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
          <MapPin className="h-4 w-4 text-indigo-600" />
          Address Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              City / Province
            </label>
            <Input
              type="text"
              placeholder="e.g. Ho Chi Minh"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Primary Address
            </label>
            <Input
              type="text"
              placeholder="123 ABC Street, Dist 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Billing Address (Invoice Address)
            </label>
            <Input
              type="text"
              placeholder="Same as primary address or distinct invoice address"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="text-xs h-9 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Contacts List Builder (Show during creation) */}
      {!isEditing && (
        <div className="bg-slate-50/70 p-4 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              Contacts ({contacts.length})
            </h4>
            <button
              type="button"
              onClick={handleAddContactItem}
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-indigo-600 border border-indigo-200 px-2.5 py-1 text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-3 bg-white border border-slate-200">
              No initial contacts added. You can add contact persons now or manage them later.
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div key={index} className="bg-white p-3 border border-slate-200 space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Contact #{index + 1}
                      {contact.is_primary && (
                        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 text-[10px] font-semibold border border-indigo-200">
                          Primary
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContactItem(index)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        required
                        className="text-xs h-8"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Role / Title
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Chief Accountant"
                        value={contact.role || ''}
                        onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="jane@vietstrix.com"
                        value={contact.email || ''}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Phone
                      </label>
                      <Input
                        type="text"
                        placeholder="0987654321"
                        value={contact.phone || ''}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!contact.is_primary}
                        onChange={(e) => handleContactChange(index, 'is_primary', e.target.checked)}
                        className="h-3.5 w-3.5 text-indigo-600 border-slate-300 rounded-none focus:ring-indigo-500"
                      />
                      Set as Primary Contact for this Client
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !businessName.trim()}
          className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            'Saving...'
          ) : isEditing ? (
            'Update Client'
          ) : (
            'Create Client'
          )}
        </button>
      </div>
    </form>
  );
};
