# 🔄 Token Refresh System Guide

## Overview

Hệ thống quản lý token đã được cấu hình để tự động refresh access token trước khi hết hạn, đảm bảo trải nghiệm người dùng mượt mà và bảo mật.

## Token Lifecycle

### Access Token

- **Thời gian sống**: 4 giờ (14,400 giây)
- **Refresh buffer**: 30 phút (1,800 giây)
- **Auto-refresh**: Token sẽ được refresh tự động sau 3.5 giờ

### Refresh Token

- **Thời gian sống**: 6 ngày
- **Lưu trữ**: HTTP-only cookie (an toàn, không thể truy cập từ JavaScript)
- **Tự động gửi**: Browser tự động gửi cookie với mỗi request

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Login Response                          │
│  {                                                          │
│    "access_token": "eyJhbGc...",                           │
│    "expires_in": 14400,  // 4 hours in seconds            │
│    "token_type": "Bearer",                                 │
│    "user_id": 827066062380994561                          │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Token Storage (Multi-layer)                    │
│                                                             │
│  1. Memory (Primary)                                        │
│     - Fastest access                                        │
│     - Lost on page refresh                                  │
│                                                             │
│  2. Secure Storage (Backup)                                 │
│     - Encrypted storage                                     │
│     - Survives page refresh                                 │
│     - Auto-expires after 4 hours                           │
│                                                             │
│  3. Token Expiry Timestamp                                  │
│     - Stored separately                                     │
│     - Used for refresh scheduling                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Auto-Refresh Scheduler                            │
│                                                             │
│  Calculation:                                               │
│  - Token expires at: now + 14400s (4 hours)               │
│  - Refresh buffer: 1800s (30 minutes)                     │
│  - Refresh at: expires_at - 1800s                         │
│  - Result: Token refreshes after 3.5 hours                │
│                                                             │
│  Timer Setup:                                               │
│  setTimeout(() => {                                         │
│    refreshToken()                                           │
│    scheduleNextRefresh()                                    │
│  }, 3.5 hours)                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Refresh Token Flow                             │
│                                                             │
│  1. Check if token needs refresh                           │
│     - Is expired? → Refresh immediately                    │
│     - Near expiry? → Refresh proactively                   │
│                                                             │
│  2. Call refresh endpoint                                   │
│     - Browser sends refresh token cookie automatically     │
│     - Server validates refresh token                       │
│     - Returns new access token + expires_in                │
│                                                             │
│  3. Update token storage                                    │
│     - Store new access token                               │
│     - Calculate new expiry timestamp                       │
│     - Schedule next refresh                                │
│                                                             │
│  4. Handle failures                                         │
│     - Retry up to 3 times with 2s delay                   │
│     - If refresh token expired → Logout user              │
│     - If server error → Retry with backoff                │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Constants (`constants.ts`)

```typescript
export const AUTH_CONFIG = {
  REFRESH_BUFFER: 1800, // 30 minutes before expiry
  ACCESS_TOKEN_MAX_AGE: 14400, // 4 hours
  REFRESH_TOKEN_MAX_AGE: 6, // 6 days
  MAX_REFRESH_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
};
```

### 2. Token Manager (`tokenManager.ts`)

- Quản lý token trong memory và secure storage
- Lưu trữ expiry timestamp
- Tự động restore token sau page refresh
- Tích hợp với token security (fingerprinting, validation)

### 3. Token Refresh (`tokenRefresh.ts`)

- `refreshToken()`: Gọi API refresh và cập nhật token
- `scheduleTokenRefresh()`: Lên lịch auto-refresh
- `refreshTokenIfNeeded()`: Kiểm tra và refresh nếu cần
- Retry logic với exponential backoff

### 4. Auth Actions (`authActions.ts`)

- `login()`: Lưu token + expires_in từ server
- `logout()`: Clear tất cả token và security data
- Tích hợp với 2FA và Passkey flows

## Security Features

### 1. Token Fingerprinting

- Mỗi token được gắn với browser fingerprint
- Phát hiện token theft nếu fingerprint không khớp

### 2. Encrypted Storage

- Access token được mã hóa trước khi lưu
- Chỉ decrypt khi cần sử dụng

### 3. Memory-First Strategy

- Token chủ yếu lưu trong memory (XSS protection)
- Secure storage chỉ dùng cho page refresh

### 4. Automatic Cleanup

- Token tự động expire sau thời gian quy định
- Clear tất cả data khi logout

## Usage Examples

### Login Flow

```typescript
// User logs in
const success = await useAuthStore.getState().login(username, password);

// Server response:
// {
//   "access_token": "eyJhbGc...",
//   "expires_in": 14400,
//   "token_type": "Bearer"
// }

// System automatically:
// 1. Stores token in memory + secure storage
// 2. Calculates expiry: now + 14400s
// 3. Schedules refresh at: expiry - 1800s (3.5 hours)
```

### Auto-Refresh Flow

```typescript
// After 3.5 hours, system automatically:
// 1. Calls refreshToken()
// 2. Gets new token from server
// 3. Updates storage
// 4. Schedules next refresh

// User continues working without interruption
```

### Manual Refresh

```typescript
// Check if refresh needed
if (useAuthStore.getState().shouldRefreshToken()) {
  await useAuthStore.getState().refreshTokenIfNeeded();
}
```

## Configuration

### Adjust Refresh Timing

Edit `src/store/auth/constants.ts`:

```typescript
export const AUTH_CONFIG = {
  // Refresh 1 hour before expiry instead of 30 minutes
  REFRESH_BUFFER: 3600, // 1 hour = 3600 seconds

  // Or refresh 15 minutes before expiry
  REFRESH_BUFFER: 900, // 15 minutes = 900 seconds
};
```

### Adjust Retry Logic

```typescript
export const AUTH_CONFIG = {
  MAX_REFRESH_RETRIES: 5, // Try 5 times instead of 3
  RETRY_DELAY: 3000, // Wait 3 seconds between retries
};
```

## Monitoring

### Check Token Status

```typescript
const store = useAuthStore.getState();

// Check if token is near expiry
const isNearExpiry = store.isTokenNearExpiry();

// Check if token is expired
const isExpired = store.isTokenExpired();

// Get token expiry timestamp
const expiresAt = store.tokenExpiresAt;
const expiresIn = expiresAt ? (expiresAt - Date.now()) / 1000 : 0;
console.log(`Token expires in ${Math.round(expiresIn / 60)} minutes`);
```

### Debug Logs

Enable debug logs to monitor refresh behavior:

```typescript
// In browser console
localStorage.setItem('debug', 'auth:*');

// You'll see logs like:
// [TokenRefresh] Scheduling token refresh in 210 minutes
// [TokenRefresh] Token refreshed successfully, expires in 14400s (240 minutes)
// [TokenManager] Token stored securely
```

## Troubleshooting

### Token Not Refreshing

1. Check if refresh token cookie exists
2. Verify REFRESH_BUFFER is not too large
3. Check browser console for errors
4. Ensure server refresh endpoint is working

### Frequent Logouts

1. Check if refresh token is expiring too soon
2. Verify server is returning valid expires_in
3. Check for network issues during refresh
4. Review retry logic configuration

### Page Refresh Issues

1. Verify secure storage is working
2. Check if token is being restored from storage
3. Ensure token expiry timestamp is persisted
4. Review tokenManager initialization

## Best Practices

1. **Never store refresh token in localStorage**
   - Use HTTP-only cookies only
   - Prevents XSS attacks

2. **Always use expires_in from server**
   - More accurate than JWT exp claim
   - Accounts for server-client time differences

3. **Schedule refresh proactively**
   - Don't wait until token expires
   - Use buffer time (30 minutes recommended)

4. **Handle refresh failures gracefully**
   - Retry with backoff
   - Logout only if refresh token is invalid
   - Show user-friendly error messages

5. **Monitor token lifecycle**
   - Log refresh events
   - Track refresh success/failure rates
   - Alert on unusual patterns

## Migration Notes

### From Old System

If migrating from old token system:

1. Update login response to include `expires_in`
2. Update all auth actions to use `setAccessTokenWithExpiry()`
3. Remove any manual token expiry calculations
4. Test refresh flow thoroughly
5. Monitor logs for any issues

### Breaking Changes

- `setAccessToken()` now has optional `expiresIn` parameter
- New method `setAccessTokenWithExpiry()` preferred for login flows
- Token expiry now stored separately from token
- Refresh buffer increased from 5 to 30 minutes

## Future Improvements

1. **Sliding Window Refresh**
   - Refresh on user activity instead of fixed schedule
   - Extend session for active users

2. **Token Rotation**
   - Rotate refresh token on each refresh
   - Enhanced security

3. **Multi-Tab Sync**
   - Sync token refresh across browser tabs
   - Prevent duplicate refresh calls

4. **Offline Support**
   - Queue refresh requests when offline
   - Retry when connection restored
