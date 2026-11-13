# ✅ Refresh Token Implementation Summary

## Tổng Quan

Đã cấu hình lại hệ thống quản lý token để:

- Lưu trữ `expires_in` từ server response
- Tự động refresh token trước 30 phút khi hết hạn (sau 3.5 giờ)
- Quản lý refresh token an toàn qua HTTP-only cookies
- Xử lý token expiry chính xác

## Các Thay Đổi Chính

### 1. Constants (`constants.ts`)

**Thay đổi:**

```typescript
// Trước
REFRESH_BUFFER: 300, // 5 minutes
TOKEN_MAX_AGE: 14400,
REFRESH_TOKEN_MAX_AGE: 30, // 30 days

// Sau
REFRESH_BUFFER: 1800, // 30 minutes (1800 seconds)
ACCESS_TOKEN_MAX_AGE: 14400, // 4 hours
REFRESH_TOKEN_MAX_AGE: 6, // 6 days
```

**Lý do:**

- Buffer 30 phút đảm bảo token được refresh kịp thời
- Tách rõ ACCESS_TOKEN_MAX_AGE và REFRESH_TOKEN_MAX_AGE
- Refresh token 6 ngày phù hợp với yêu cầu

### 2. Token Helpers (`tokenHelpers.ts`)

**Thêm mới:**

```typescript
export function calculateTokenExpiry(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}
```

**Lý do:**

- Tính toán expiry timestamp từ expires_in của server
- Chính xác hơn việc parse JWT exp claim

### 3. Token Manager (`tokenManager.ts`)

**Thay đổi:**

```typescript
class TokenManager {
  private tokenExpiresAt: number | null = null; // NEW
  private readonly TOKEN_EXPIRY_KEY = '_te'; // NEW

  setAuthToken(token: string | null, expiresIn?: number) { // NEW parameter
    if (expiresIn) {
      this.tokenExpiresAt = Date.now() + expiresIn * 1000;
      // Store expiry timestamp
      secureStorage.setItem(this.TOKEN_EXPIRY_KEY, ...);
    }
  }

  async getAuthToken(): Promise<string | null> {
    // Restore expiry timestamp from storage
    const storedExpiry = await secureStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (storedExpiry) {
      this.tokenExpiresAt = parseInt(storedExpiry, 10);
    }
  }

  getTokenExpiry(): number | null { // NEW method
    return this.tokenExpiresAt;
  }
}
```

**Lý do:**

- Lưu trữ expiry timestamp riêng biệt
- Restore expiry sau page refresh
- Hỗ trợ scheduling chính xác

### 4. Token Refresh (`tokenRefresh.ts`)

**Thay đổi:**

```typescript
export async function refreshToken(
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void, // NEW
  clearAccessToken: () => void
): Promise<void> {
  const newAccessToken = data.data.access_token;
  const expiresIn = data.data.expires_in; // NEW: Get from server

  setAccessTokenWithExpiry(newAccessToken, expiresIn); // NEW: Pass expiresIn

  logDebug(
    `[TokenRefresh] Token refreshed, expires in ${expiresIn}s (${Math.round(expiresIn / 60)} minutes)`
  );
}
```

**Lý do:**

- Sử dụng expires_in từ server thay vì JWT claim
- Log thời gian hết hạn để debug
- Chính xác hơn với server time

### 5. Auth Actions (`authActions.ts`)

**Thay đổi:**

```typescript
export async function login(
  username: string,
  password: string,
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void, // NEW
  scheduleRefresh: () => void,
  handleFailure: () => void,
  setState: (state: any) => void
): Promise<boolean> {
  const accessToken = data.data.access_token;
  const expiresIn = data.data.expires_in; // NEW: Get from server

  console.log('[AuthActions] Token expires in:', expiresIn, 'seconds');

  setAccessTokenWithExpiry(accessToken, expiresIn); // NEW: Pass expiresIn
}
```

**Lý do:**

- Lưu expires_in ngay khi login
- Log để monitor token lifecycle
- Đồng bộ với server response

### 6. Two-Factor Actions (`twoFactorActions.ts`)

**Thay đổi:**

```typescript
export async function verifyTwoFactorLogin(
  code: string,
  tempToken: string,
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void, // NEW
  scheduleRefresh: () => void,
  setState: (state: any) => void
): Promise<boolean> {
  const accessToken = data.data.access_token;
  const expiresIn = data.data.expires_in; // NEW

  setAccessTokenWithExpiry(accessToken, expiresIn); // NEW
}
```

**Lý do:**

- 2FA flow cũng cần lưu expires_in
- Đồng nhất với login flow

### 7. Passkey Actions (`passkeyActions.ts`)

**Thay đổi:**

```typescript
export async function finishPasskeyLogin(
  options: PasskeyLoginBeginData,
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void, // NEW
  scheduleRefresh: () => void,
  setState: (state: any) => void
): Promise<boolean> {
  const accessToken = data.data.access_token;
  const expiresIn = data.data.expires_in; // NEW

  setAccessTokenWithExpiry(accessToken, expiresIn); // NEW
}
```

**Lý do:**

- Passkey login cũng cần lưu expires_in
- Đồng nhất với các auth flows khác

### 8. Auth Store (`store.ts`)

**Thêm mới:**

```typescript
setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => {
  if (token) {
    // Prefer expires_in from server, fallback to JWT exp claim
    const expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : getTokenExpiryFromJWT(token);

    set({ accessToken: token, tokenExpiresAt: expiresAt });
    tokenManager.setAuthToken(token, expiresIn);
  } else {
    set({ accessToken: null, tokenExpiresAt: null });
    tokenManager.clearAuthToken();
  }
};
```

**Cập nhật:**

```typescript
login: async (username: string, password: string): Promise<boolean> => {
  const { setAccessTokenWithExpiry, ... } = get(); // Use new method
  return AuthActions.login(username, password, setAccessTokenWithExpiry, ...);
}

refreshToken: async (): Promise<void> => {
  const { setAccessTokenWithExpiry, clearAccessToken } = get();
  return refreshToken(setAccessTokenWithExpiry, clearAccessToken);
}

verifyTwoFactorLogin: async (code: string): Promise<boolean> => {
  const { setAccessTokenWithExpiry, ... } = get();
  return TwoFactorActions.verifyTwoFactorLogin(code, tempToken, setAccessTokenWithExpiry, ...);
}

finishPasskeyLogin: async (credential: any): Promise<boolean> => {
  const { setAccessTokenWithExpiry, ... } = get();
  return PasskeyActions.finishPasskeyLogin(passkeyLoginOptions, setAccessTokenWithExpiry, ...);
}
```

**Lý do:**

- Method mới ưu tiên expires_in từ server
- Fallback về JWT exp claim nếu không có expires_in
- Tất cả auth flows sử dụng method mới

### 9. Type Definitions (`types/auth/responses.ts`)

**Thêm mới:**

```typescript
export interface AuthActions {
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void; // NEW
  // ... existing methods
}
```

**Lý do:**

- Type safety cho method mới
- TypeScript autocomplete

## Server Response Format

Server cần trả về format sau:

### Login Response

```json
{
  "success": true,
  "code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 14400,
    "token_type": "Bearer",
    "user_id": 827066062380994561
  }
}
```

### Refresh Response

```json
{
  "success": true,
  "code": 200,
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 14400,
    "token_type": "Bearer"
  }
}
```

### 2FA Verify Response

```json
{
  "success": true,
  "code": 200,
  "message": "2FA verified",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 14400,
    "token_type": "Bearer"
  }
}
```

### Passkey Login Response

```json
{
  "success": true,
  "code": 200,
  "message": "Passkey login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 14400,
    "token_type": "Bearer"
  }
}
```

## Token Lifecycle

```
Login
  ↓
Store token + expires_in (14400s = 4 hours)
  ↓
Calculate expiry: now + 14400s
  ↓
Schedule refresh at: expiry - 1800s (3.5 hours)
  ↓
Wait 3.5 hours...
  ↓
Auto refresh token
  ↓
Get new token + expires_in
  ↓
Update storage
  ↓
Schedule next refresh (3.5 hours)
  ↓
Repeat...
```

## Security Features

### 1. HTTP-Only Cookies

- Refresh token lưu trong HTTP-only cookie
- Không thể truy cập từ JavaScript
- Tự động gửi với mỗi request
- Bảo vệ khỏi XSS attacks

### 2. Encrypted Storage

- Access token được mã hóa trước khi lưu
- Chỉ decrypt khi cần sử dụng
- Bảo vệ khỏi storage attacks

### 3. Token Fingerprinting

- Mỗi token gắn với browser fingerprint
- Phát hiện token theft
- Tự động revoke nếu fingerprint không khớp

### 4. Automatic Expiry

- Token tự động expire sau thời gian quy định
- Không cần manual cleanup
- Giảm thiểu rủi ro token leak

## Testing

### Test Auto-Refresh

```typescript
// 1. Login
await useAuthStore.getState().login('username', 'password');

// 2. Check token expiry
const expiresAt = useAuthStore.getState().tokenExpiresAt;
const expiresIn = (expiresAt - Date.now()) / 1000;
console.log(`Token expires in ${Math.round(expiresIn / 60)} minutes`);

// 3. Wait for auto-refresh (3.5 hours)
// Or manually trigger refresh
await useAuthStore.getState().refreshTokenIfNeeded();

// 4. Verify new token
const newExpiresAt = useAuthStore.getState().tokenExpiresAt;
console.log('Token refreshed, new expiry:', new Date(newExpiresAt));
```

### Test Page Refresh

```typescript
// 1. Login
await useAuthStore.getState().login('username', 'password');

// 2. Refresh page
window.location.reload();

// 3. Verify token restored
const token = await tokenManager.getAuthToken();
const expiry = tokenManager.getTokenExpiry();
console.log('Token restored:', !!token);
console.log('Expiry restored:', new Date(expiry));
```

### Test Token Expiry

```typescript
// 1. Login
await useAuthStore.getState().login('username', 'password');

// 2. Manually set expiry to past
useAuthStore.setState({
  tokenExpiresAt: Date.now() - 1000,
});

// 3. Check if expired
const isExpired = useAuthStore.getState().isTokenExpired();
console.log('Token expired:', isExpired); // Should be true

// 4. Try to refresh
const success = await useAuthStore.getState().refreshTokenIfNeeded();
console.log('Refresh success:', success);
```

## Monitoring

### Browser Console

```javascript
// Enable debug logs
localStorage.setItem('debug', 'auth:*');

// Check token status
const store = useAuthStore.getState();
console.log('Token:', store.accessToken?.substring(0, 20) + '...');
console.log('Expires at:', new Date(store.tokenExpiresAt));
console.log(
  'Expires in:',
  Math.round((store.tokenExpiresAt - Date.now()) / 1000 / 60),
  'minutes'
);
console.log('Is expired:', store.isTokenExpired());
console.log('Is near expiry:', store.isTokenNearExpiry());
console.log('Should refresh:', store.shouldRefreshToken());
```

### Network Tab

- Xem refresh token requests
- Kiểm tra response format
- Verify cookies được gửi đúng

## Troubleshooting

### Token không tự động refresh

**Nguyên nhân:**

- Refresh buffer quá lớn
- Timer bị clear
- Server không trả về expires_in

**Giải pháp:**

1. Kiểm tra AUTH_CONFIG.REFRESH_BUFFER
2. Xem console logs
3. Verify server response format

### Token bị mất sau page refresh

**Nguyên nhân:**

- Secure storage không hoạt động
- Token không được lưu
- Expiry timestamp không được restore

**Giải pháp:**

1. Kiểm tra tokenManager.getAuthToken()
2. Xem secure storage
3. Verify TOKEN_EXPIRY_KEY

### Refresh token expired

**Nguyên nhân:**

- User không active trong 6 ngày
- Refresh token bị revoke
- Cookie bị xóa

**Giải pháp:**

1. User cần login lại
2. Kiểm tra cookie settings
3. Verify server refresh token lifetime

## Next Steps

1. **Test thoroughly**
   - Test tất cả auth flows (login, 2FA, passkey)
   - Test auto-refresh
   - Test page refresh
   - Test token expiry

2. **Monitor in production**
   - Track refresh success rate
   - Monitor token lifecycle
   - Alert on unusual patterns

3. **Optimize if needed**
   - Adjust refresh buffer
   - Tune retry logic
   - Add more logging

4. **Document for team**
   - Share TOKEN_REFRESH_GUIDE.md
   - Train team on new system
   - Update API documentation

## Files Changed

1. `src/store/auth/constants.ts` - Updated refresh buffer and token ages
2. `src/store/auth/tokenHelpers.ts` - Added calculateTokenExpiry()
3. `src/store/auth/tokenManager.ts` - Added expiry storage and restore
4. `src/store/auth/tokenRefresh.ts` - Updated to use expires_in
5. `src/store/auth/authActions.ts` - Updated login to use setAccessTokenWithExpiry
6. `src/store/auth/twoFactorActions.ts` - Updated 2FA verify to use setAccessTokenWithExpiry
7. `src/store/auth/passkeyActions.ts` - Updated passkey login to use setAccessTokenWithExpiry
8. `src/store/store.ts` - Added setAccessTokenWithExpiry method
9. `src/types/auth/responses.ts` - Added setAccessTokenWithExpiry to AuthActions

## Files Created

1. `src/store/auth/TOKEN_REFRESH_GUIDE.md` - Comprehensive guide
2. `src/store/auth/REFRESH_TOKEN_IMPLEMENTATION.md` - This file

## Backward Compatibility

- `setAccessToken()` vẫn hoạt động (fallback to JWT exp claim)
- Existing code không bị break
- Recommended: Migrate to `setAccessTokenWithExpiry()` dần dần
