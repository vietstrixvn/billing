import type { CursorPaginatedData } from '../base/base.type';
import type {
  PermissionsResponse,
  ResourcesResponse,
  RolesResponse,
} from './rbac';
import type { LoginHistoryResponse, SessionResponse } from './responses';

export type FetchLoginHistoryListResponse =
  CursorPaginatedData<LoginHistoryResponse>;

export type FetchSessionListResponse = CursorPaginatedData<SessionResponse>;

export type FetchRoleListResponse = CursorPaginatedData<RolesResponse>;

export type FetchPermissionListResponse =
  CursorPaginatedData<PermissionsResponse>;

export type FetchResourcesListResponse = CursorPaginatedData<ResourcesResponse>;
