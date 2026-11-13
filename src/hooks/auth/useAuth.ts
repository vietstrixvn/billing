import { useQuery } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildCursorQueryParams, logError } from '@/utils';
import {
  FetchLoginHistoryListResponse,
  FetchSessionListResponse,
} from '@/types/auth/type';

const fetchLoginHistoryList = async (
  pageParam = '0',
  filters: Filters
): Promise<FetchLoginHistoryListResponse> => {
  try {
    const queryString = buildCursorQueryParams(filters, pageParam);
    const url = `${endpoints.admin.loginHistories}${queryString ? `?${queryString}` : ''}`;

    const response = await handleAPI(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching login history list:', error);
    throw error;
  }
};

const useLogHistoryList = (
  page: string,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchLoginHistoryListResponse, Error>({
    queryKey: ['login-history', 'list', page, filters, refreshKey],
    queryFn: () => fetchLoginHistoryList(page, filters),
    enabled: true,
    staleTime: 60000,
  });
};

const fetchSessionList = async (
  pageParam = '0',
  filters: Filters
): Promise<FetchSessionListResponse> => {
  try {
    const queryString = buildCursorQueryParams(filters, pageParam);

    const response = await handleAPI(
      `${endpoints.admin.sessions}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching session list:', error);
    throw error;
  }
};

const useSessionList = (
  page: string,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchSessionListResponse, Error>({
    queryKey: ['session', 'list', page, filters, refreshKey],
    queryFn: () => fetchSessionList(page, filters),
    enabled: true,
    staleTime: 60000,
  });
};

const fetchRootSessionList = async (
  pageParam = '0',
  filters: Filters
): Promise<FetchSessionListResponse> => {
  try {
    const queryString = buildCursorQueryParams(filters, pageParam);

    const response = await handleAPI(
      `${endpoints.admin.root_sessions}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching session list:', error);
    throw error;
  }
};

const useRootSessionList = (
  page: string,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchSessionListResponse, Error>({
    queryKey: ['root-session', 'list', page, filters, refreshKey],
    queryFn: () => fetchRootSessionList(page, filters),
    enabled: true,
    staleTime: 60000,
  });
};

export { useLogHistoryList, useSessionList, useRootSessionList };
