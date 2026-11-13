'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Star,
  Check,
} from 'lucide-react';
import type { Client, Contact, Invoice } from '@/types';
import {
  useAddContact,
  useUpdateContact,
  useDeleteContact,
  useClientInvoices,
  useClientDetail,
} from '@/hooks/billing';
import { Input } from '@/components/ui';

interface ClientDetailDialogProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientDetailDialog: React.FC<ClientDetailDialogProps> = ({
  clientId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'invoices'>('overview');

  // Contact Form State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  // Invoices pagination & filter
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceStatus, setInvoiceStatus] = useState<string>('');

  const { data: client, isLoading, refetch } = useClientDetail(clientId || undefined);

  const addContactMutation = useAddContact(clientId || undefined);
  const updateContactMutation = useUpdateContact(clientId || undefined);
  const deleteContactMutation = useDeleteContact(clientId || undefined);

  const { invoices, isLoading: isLoadingInvoices, pagination: invoicePagination } = useClientInvoices(
    clientId || undefined,
    invoicePage,
    { status: invoiceStatus || undefined }
  );

  if (!isOpen || !clientId) return null;

  const resetContactForm = () => {
    setIsAddingContact(false);
    setEditingContact(null);
    setContactName('');
    setContactRole('');
    setContactEmail('');
    setContactPhone('');
    setContactIsPrimary(false);
  };

  const handleStartAddContact = () => {
    resetContactForm();
    setIsAddingContact(true);
  };

  const handleStartEditContact = (contact: Contact) => {
    setIsAddingContact(false);
    setEditingContact(contact);
    setContactName(contact.name || '');
    setContactRole(contact.role || '');
    setContactEmail(contact.email || '');
    setContactPhone(contact.phone || '');
    setContactIsPrimary(!!contact.is_primary);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !clientId) return;

    if (editingContact && editingContact.id) {
      updateContactMutation.mutate(
        {
          clientId,
          contactId: editingContact.id,
          dto: {
            name: contactName.trim(),
            role: contactRole.trim() || undefined,
            email: contactEmail.trim() || undefined,
            phone: contactPhone.trim() || undefined,
            is_primary: contactIsPrimary,
          },
        },
        {
          onSuccess: () => {
            resetContactForm();
            refetch();
          },
        }
      );
    } else {
      addContactMutation.mutate(
        {
          clientId,
          dto: {
            name: contactName.trim(),
            role: contactRole.trim() || undefined,
            email: contactEmail.trim() || undefined,
            phone: contactPhone.trim() || undefined,
            is_primary: contactIsPrimary,
          },
        },
        {
          onSuccess: () => {
            resetContactForm();
            refetch();
          },
        }
      );
    }
  };

  const handleDeleteContact = (contactId: string) => {
    if (!clientId) return;
    if (window.confirm('Are you sure you want to remove this contact?')) {
      deleteContactMutation.mutate(
        { clientId, contactId },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {client?.business_name || 'Client Details'}
                {client?.business_alias && (
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 font-normal border border-slate-700">
                    {client.business_alias}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tax Code: {client?.tax_code || 'N/A'} • ID: {client?.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 flex items-center px-5 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Company Overview
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'contacts'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Contacts ({client?.contacts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            Invoices History
          </button>
        </div>

        {/* Dialog Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading client information...</div>
          ) : !client ? (
            <div className="py-12 text-center text-xs text-red-500">Client details unavailable.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">Status</span>
                      <div className="mt-1">
                        {client.status === 'inactive' || client.is_active === false ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">Currency</span>
                      <p className="text-sm font-bold text-slate-900 mt-1 font-mono">{client.currency || 'VND'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">Account Owner</span>
                      <p className="text-xs font-mono text-slate-700 mt-1 truncate">{client.owner_id || 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Legal & Corporate Info */}
                    <div className="border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                        Legal & Business Profile
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Business Name:</span>
                          <span className="font-semibold text-slate-900 text-right">{client.business_name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Trade Alias:</span>
                          <span className="font-mono text-slate-800">{client.business_alias || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Tax Identification:</span>
                          <span className="font-mono font-bold text-slate-900">{client.tax_code || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Legal Representative:</span>
                          <span className="font-medium text-slate-900">{client.legal_representative || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Company Email:</span>
                          <span className="text-indigo-600">{client.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Company Phone:</span>
                          <span className="font-mono text-slate-800">{client.phone_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Address Info */}
                    <div className="border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                        Address & Location
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-slate-500 block mb-0.5">City / Province:</span>
                          <span className="font-semibold text-slate-800">{client.city || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Primary Office Address:</span>
                          <span className="text-slate-800 bg-slate-50 p-2 block border border-slate-200">
                            {client.address || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Billing / Invoice Address:</span>
                          <span className="text-slate-800 bg-slate-50 p-2 block border border-slate-200">
                            {client.billing_address || client.address || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  {/* Top Bar for Contacts */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Client Contact Persons ({client.contacts?.length || 0})
                    </h3>
                    {!isAddingContact && !editingContact && (
                      <button
                        type="button"
                        onClick={handleStartAddContact}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add New Contact
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Contact Form Inline */}
                  {(isAddingContact || editingContact) && (
                    <form onSubmit={handleSubmitContact} className="bg-slate-50 p-4 border border-indigo-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-indigo-700 uppercase">
                          {editingContact ? 'Edit Contact Person' : 'Add New Contact Person'}
                        </h4>
                        <button
                          type="button"
                          onClick={resetContactForm}
                          className="text-xs text-slate-500 hover:text-red-500"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Contact Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. John Smith"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            required
                            className="text-xs h-8 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Role / Position
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Chief Financial Officer"
                            value={contactRole}
                            onChange={(e) => setContactRole(e.target.value)}
                            className="text-xs h-8 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            placeholder="john@vietstrix.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="text-xs h-8 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Phone Number
                          </label>
                          <Input
                            type="text"
                            placeholder="0987654321"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="text-xs h-8 bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contactIsPrimary}
                            onChange={(e) => setContactIsPrimary(e.target.checked)}
                            className="h-3.5 w-3.5 text-indigo-600 border-slate-300 rounded-none focus:ring-indigo-500"
                          />
                          Set as Primary Contact
                        </label>

                        <button
                          type="submit"
                          disabled={
                            addContactMutation.isPending ||
                            updateContactMutation.isPending ||
                            !contactName.trim()
                          }
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {addContactMutation.isPending || updateContactMutation.isPending
                            ? 'Saving...'
                            : editingContact
                              ? 'Update Contact'
                              : 'Save Contact'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Contacts Cards List */}
                  {!client.contacts || client.contacts.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 p-8 text-center text-xs text-slate-500">
                      No contacts registered for this client yet. Click "Add New Contact" above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {client.contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-4 border bg-white relative space-y-2.5 transition-all ${
                            contact.is_primary
                              ? 'border-indigo-400 ring-1 ring-indigo-200'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                                {contact.is_primary && (
                                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold border border-indigo-200">
                                    <Star className="h-3 w-3 fill-indigo-600 text-indigo-600" />
                                    Primary
                                  </span>
                                )}
                              </div>
                              {contact.role && (
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{contact.role}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditContact(contact)}
                                title="Edit Contact"
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => contact.id && handleDeleteContact(contact.id)}
                                title="Delete Contact"
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <a href={`mailto:${contact.email}`} className="hover:underline text-indigo-600">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 font-mono">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INVOICES HISTORY */}
              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Client Invoices
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
                      <select
                        value={invoiceStatus}
                        onChange={(e) => {
                          setInvoiceStatus(e.target.value);
                          setInvoicePage(1);
                        }}
                        className="text-xs h-8 px-2 border border-slate-300 bg-white text-slate-800 focus:outline-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>

                  {/* Invoices List Table */}
                  {isLoadingInvoices ? (
                    <div className="py-8 text-center text-xs text-slate-500">Loading invoice history...</div>
                  ) : !invoices || invoices.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 p-8 text-center text-xs text-slate-500">
                      No invoices found for this client under current filter.
                    </div>
                  ) : (
                    <div className="border border-slate-200 overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[650px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                            <th className="py-2.5 px-3">Invoice Number</th>
                            <th className="py-2.5 px-3">Issued Date</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {invoices.map((inv) => {
                            const statusLower = (inv.billing_record_status || 'pending').toLowerCase();
                            return (
                              <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                                  {inv.invoice_number}
                                </td>
                                <td className="py-2.5 px-3">
                                  {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-2.5 px-3">
                                  {inv.due_at ? new Date(inv.due_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: inv.currency || client.currency || 'VND',
                                  }).format(inv.invoice_amount || 0)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {statusLower === 'paid' ? (
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                                      Paid
                                    </span>
                                  ) : statusLower === 'overdue' ? (
                                    <span className="bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                                      Overdue
                                    </span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                                      Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
