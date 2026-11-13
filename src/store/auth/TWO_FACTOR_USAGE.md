# Two-Factor Authentication (2FA) Implementation Guide

This guide explains how to use the 2FA functionality in your application.

## Overview

The 2FA implementation follows this flow:

1. **Setup 2FA**: Admin initiates 2FA setup and receives QR code
2. **Verify & Enable**: Admin scans QR code and verifies with a code
3. **Login with 2FA**: User logs in and provides 2FA code
4. **Disable 2FA**: Admin can disable 2FA with password and code

## API Endpoints

### 1. Setup 2FA (Protected)

```
POST /api/v1/admin/2fa/setup
Headers: Authorization: Bearer {access_token}
```

### 2. Verify & Enable 2FA (Protected)

```
POST /api/v1/admin/2fa/verify
Headers: Authorization: Bearer {access_token}
Body: { "code": "123456" }
```

### 3. Disable 2FA (Protected)

```
POST /api/v1/admin/2fa/disable
Headers: Authorization: Bearer {access_token}
Body: { "password": "your_password", "code": "123456" }
```

### 4. Verify 2FA During Login (Public)

```
POST /api/v1/auth/2fa/verify
Body: { "temp_token": "...", "code": "123456" }
```

## Store Usage

### State

The auth store includes the following 2FA-related state:

```typescript
{
  requiresTwoFactor: boolean; // True when 2FA is required during login
  tempToken: string | null; // Temporary token from initial login
  twoFactorSetupData: TwoFactorSetupData | null; // QR code and secret data
}
```

### Actions

#### 1. Setup 2FA

```typescript
import { useAuthStore } from '@/store';

const { setupTwoFactor } = useAuthStore();

// Initiate 2FA setup
const setupData = await setupTwoFactor();

if (setupData) {
  console.log('QR Code:', setupData.qr_code);
  console.log('Secret:', setupData.secret);
  console.log('Issuer:', setupData.issuer);
  console.log('Account:', setupData.account);
}
```

#### 2. Verify and Enable 2FA

```typescript
import { useAuthStore } from '@/store';

const { verifyAndEnableTwoFactor } = useAuthStore();

// User enters code from authenticator app
const code = '123456';
const success = await verifyAndEnableTwoFactor(code);

if (success) {
  console.log('2FA enabled successfully!');
}
```

#### 3. Disable 2FA

```typescript
import { useAuthStore } from '@/store';

const { disableTwoFactor } = useAuthStore();

// User provides password and current 2FA code
const password = 'user_password';
const code = '123456';
const success = await disableTwoFactor(password, code);

if (success) {
  console.log('2FA disabled successfully!');
}
```

#### 4. Verify 2FA During Login

```typescript
import { useAuthStore } from '@/store';

const { verifyTwoFactorLogin, requiresTwoFactor, tempToken } = useAuthStore();

// After initial login, if requiresTwoFactor is true
if (requiresTwoFactor && tempToken) {
  const code = '123456'; // User enters code
  const success = await verifyTwoFactorLogin(code);

  if (success) {
    console.log('Login successful!');
    // User is now authenticated
  }
}
```

#### 5. Clear 2FA State

```typescript
import { useAuthStore } from '@/store';

const { clearTwoFactorState } = useAuthStore();

// Clear 2FA state (e.g., when user cancels)
clearTwoFactorState();
```

## Complete Login Flow with 2FA

```typescript
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

function LoginPage() {
  const router = useRouter();
  const {
    login,
    requiresTwoFactor,
    verifyTwoFactorLogin
  } = useAuthStore();

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);

    if (success) {
      // Login successful without 2FA
      router.push('/admin');
    } else if (requiresTwoFactor) {
      // 2FA is required, show 2FA input
      router.push('/sign-in/2fa');
    }
  };

  const handle2FAVerify = async (code: string) => {
    const success = await verifyTwoFactorLogin(code);

    if (success) {
      router.push('/admin');
    }
  };

  // Render login form or 2FA form based on state
  return requiresTwoFactor ? (
    <TwoFactorForm onVerify={handle2FAVerify} />
  ) : (
    <LoginForm onLogin={handleLogin} />
  );
}
```

## Component Examples

### Setup 2FA Component

```typescript
import { TwoFactorSetupDialog } from '@/components/auth/two-factor-setup-dialog';

function SecuritySettings() {
  return (
    <div>
      <h2>Security Settings</h2>
      <TwoFactorSetupDialog />
    </div>
  );
}
```

### Disable 2FA Component

```typescript
import { TwoFactorDisableDialog } from '@/components/auth/two-factor-disable-dialog';

function SecuritySettings() {
  return (
    <div>
      <h2>Security Settings</h2>
      <TwoFactorDisableDialog />
    </div>
  );
}
```

### 2FA Login Component

```typescript
import { TwoFactorLoginForm } from '@/components/auth/two-factor-login-form';

function TwoFactorPage() {
  return <TwoFactorLoginForm />;
}
```

## Error Handling

All 2FA actions handle errors automatically and display toast notifications. You can also check the `error` state:

```typescript
const { error, loading } = useAuthStore();

if (error) {
  console.error('2FA Error:', error);
}
```

## Security Notes

1. **Temporary Token**: The `tempToken` is only valid for a short period after initial login
2. **QR Code**: The QR code contains sensitive data and should only be displayed to the authenticated user
3. **Secret Key**: The secret key should be stored securely by the user's authenticator app
4. **Verification Code**: Codes are time-based (TOTP) and expire after 30 seconds
5. **Password Required**: Disabling 2FA requires both password and current 2FA code

## Testing

To test the 2FA flow:

1. Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
2. Scan the QR code or manually enter the secret
3. Enter the 6-digit code from the app
4. The code changes every 30 seconds

## Troubleshooting

### "Invalid verification code"

- Ensure your device's time is synchronized
- The code expires every 30 seconds, try a fresh code
- Check that you're using the correct account in your authenticator app

### "No temporary token found"

- The temporary token may have expired
- Try logging in again

### "2FA setup failed"

- Ensure you're authenticated with a valid access token
- Check network connectivity
- Verify the API endpoint is accessible
