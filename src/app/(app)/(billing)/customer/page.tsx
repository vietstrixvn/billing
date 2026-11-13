'use client';

import React, { useState } from 'react';
import { Plus, Search, Building2, X, RefreshCw, Filter } from 'lucide-react';
import { Header } from '@/components/customs/header.design';
import { Container } from '@/components/wrappers/container';
import { FilterContainer } from '@/components/wrappers/filter.container';
import { RefreshButton } from '@/components/buttons/refresh.button';
import { CustomPagination } from '@/components/customs/pagination.custom';
import { Input } from '@/components/ui';
import { PageSizeSelect } from '@/components';
import { ClientTable } from '@/components/tables/billing/client.table';
import { ClientForm } from '@/components/forms/client.form';
import { ClientDetailDialog } from '@/components/dialogs/client-detail.dialog';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '@/hooks/billing';
import type { Client, CreateClientDTO, UpdateClientDTO } from '@/types';

export default function CustomerPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [actualSearchQuery, setActualSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals & Selection state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);

  const filters = {
    ...(actualSearchQuery && { search: actualSearchQuery }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { clients, isLoading, isError, pagination } = useClients(
    currentPage,
    filters,
    refreshKey,
    pageSize
  );

  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (pagination?.total_pages || 0)) {
      setCurrentPage(page);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setActualSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActualSearchQuery('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenCreateForm = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleCreateSubmit = (dto: CreateClientDTO) => {
    createClientMutation.mutate(dto, {
      onSuccess: () => {
        handleCloseForm();
        handleRefresh();
      },
    });
  };

  const handleUpdateSubmit = (id: string, dto: UpdateClientDTO) => {
    updateClientMutation.mutate(
      { id, dto },
      {
        onSuccess: () => {
          handleCloseForm();
          handleRefresh();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this business client?')) {
      deleteClientMutation.mutate(id, {
        onSuccess: () => {
          handleRefresh();
        },
      });
    }
  };

  const handleViewDetail = (client: Client) => {
    setViewingClientId(client.id);
  };

  return (
    <Container className="mt-8 space-y-6">
      <Header title="Client & Contact Management" />

      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleOpenCreateForm}
          className="inline-flex items-center gap-2 bg-main hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <FilterContainer>
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search business, tax code, email (Press Enter)"
                className="pl-9 pr-8 text-xs h-9 bg-white border border-slate-300 rounded-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                  setCurrentPage(1);
                }}
                className="text-xs h-9 px-3 border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                <option value="all">All Clients</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <RefreshButton onClick={handleRefresh} />
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Show:</span>
            <PageSizeSelect
              handlePageSizeChange={handlePageSizeChange}
              pageSize={pageSize}
            />
          </div>
        </div>
      </FilterContainer>

      {/* Main Table */}
      <ClientTable
        clients={clients}
        isLoading={isLoading}
        isError={isError}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEditForm}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
      />

      {/* Pagination */}
      {!isLoading &&
        !isError &&
        clients.length > 0 &&
        pagination &&
        pagination.total_pages > 0 && (
          <div className="mt-4 flex justify-end">
            <CustomPagination
              currentPage={currentPage}
              totalPage={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      {/* Form Modal (Create / Edit Client) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-3xl shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                {editingClient ? 'Edit Client Profile' : 'Create New Business Client'}
              </h3>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <ClientForm
                clientToEdit={editingClient}
                onSubmitCreate={handleCreateSubmit}
                onSubmitUpdate={handleUpdateSubmit}
                onCancel={handleCloseForm}
                isPending={
                  createClientMutation.isPending || updateClientMutation.isPending
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail & Contact Management & Invoices Dialog */}
      <ClientDetailDialog
        clientId={viewingClientId}
        isOpen={!!viewingClientId}
        onClose={() => setViewingClientId(null)}
      />
    </Container>
  );
}
