'use client';

import React from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Client } from '@/types';

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  isError: boolean;
  onViewDetail: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  isLoading,
  isError,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-100 w-full"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 text-center rounded-none my-4">
        <p className="text-sm font-medium">Failed to load client data. Please try again.</p>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-12 text-center my-4">
        <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">No Clients Found</h3>
        <p className="text-xs text-slate-500 mt-1">Get started by creating your first business client.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse min-w-[850px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Business / Company</th>
            <th className="py-3 px-4">Contact Info</th>
            <th className="py-3 px-4">Address / City</th>
            <th className="py-3 px-4 text-center">Contacts</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
          {clients.map((client) => {
            const isInactive = client.status === 'inactive' || client.is_active === false;
            const contactsCount = client.contacts?.length || 0;

            return (
              <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Business Info */}
                <td className="py-3.5 px-4 font-medium">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0 mt-0.5">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer" onClick={() => onViewDetail(client)}>
                        {client.business_name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {client.business_alias && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[10px] font-mono border border-slate-200">
                            {client.business_alias}
                          </span>
                        )}
                        {client.tax_code && (
                          <span>Tax: <strong className="font-mono text-slate-700">{client.tax_code}</strong></span>
                        )}
                      </div>
                      {client.legal_representative && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Rep: <span className="text-slate-700">{client.legal_representative}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email / Phone */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    {client.email ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <a href={`mailto:${client.email}`} className="hover:underline hover:text-indigo-600 truncate max-w-[180px]">
                          {client.email}
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No email</span>
                    )}

                    {client.phone_number ? (
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{client.phone_number}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">No phone</div>
                    )}
                  </div>
                </td>

                {/* Address & City */}
                <td className="py-3.5 px-4">
                  <div className="max-w-[200px]">
                    {client.address || client.city ? (
                      <div className="flex items-start gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {[client.address, client.city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                  </div>
                </td>

                {/* Contacts Count Badge */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs text-slate-700 font-medium">
                    <Users className="h-3 w-3 text-slate-500" />
                    {contactsCount}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 text-center">
                  {isInactive ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetail(client)}
                      title="View Details"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(client)}
                      title="Edit Client"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(client.id)}
                      title="Delete Client"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
