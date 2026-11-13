# 🔌 Vietstrix gRPC Auth Service - Integration Guide

Tài liệu hướng dẫn kết nối và xác thực người dùng qua **gRPC Auth Service** từ các ứng dụng con (Billing, CRM, Mobile App, v.v.).

---

## 📌 1. Thông tin Kết Nối (Connection Config)

- **Production Endpoint:** `grpc.vietstrix.com:443`
- **Protocol:** `gRPC over TLS (HTTP/2)`
- **Port:** `443` (HTTPS tiêu chuẩn)
- **Local / Dev Endpoint:** `localhost:50051` (Plaintext)

---

## 📜 2. Protobuf Schema (`proto/auth/v1/auth.proto`)

Copy file `.proto` này vào dự án con để generate code gRPC client:

```protobuf
syntax = "proto3";

package auth.v1;

option go_package = "vietstrix_be/pkg/pb/auth/v1;authv1";

service AuthService {
  rpc Login (LoginRequest) returns (LoginResponse);
  rpc Verify2FA (Verify2FARequest) returns (Verify2FAResponse);
  rpc RefreshToken (RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc ValidateToken (ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc GetProfile (GetProfileRequest) returns (GetProfileResponse);
}

message LoginRequest {
  string username = 1;
  string password = 2;
  string ip_address = 3;
  string user_agent = 4;
}

message LoginResponse {
  bool success = 1;
  string message = 2;
  string access_token = 3;
  string refresh_token = 4;
  bool requires_2fa = 5;
  string temp_token = 6;
}

message Verify2FARequest {
  string temp_token = 1;
  string code = 2;
}

message Verify2FAResponse {
  bool success = 1;
  string message = 2;
  string access_token = 3;
  string refresh_token = 4;
}

message RefreshTokenRequest {
  string refresh_token = 1;
}

message RefreshTokenResponse {
  bool success = 1;
  string access_token = 2;
  string refresh_token = 3;
}

message ValidateTokenRequest {
  string access_token = 1;
}

message ValidateTokenResponse {
  bool is_valid = 1;
  uint64 user_id = 2;
  string role = 3;
  repeated string permissions = 4;
  string error_message = 5;
}

message GetProfileRequest {
  string access_token = 1;
}

message UserProfile {
  uint64 id = 1;
  string username = 2;
  string email = 3;
  string full_name = 4;
  string role = 5;
  bool is_active = 6;
  string created_at = 7;
}

message GetProfileResponse {
  bool success = 1;
  UserProfile profile = 2;
  repeated string permissions = 3;
  string error_message = 4;
}
```

---

## 💻 3. Code Mẫu Kết Nối (Code Examples)

### 🔹 Cách 1: Sử dụng Golang Client

```go
package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	
	pb "your_app/pkg/pb/auth/v1"
)

func main() {
	serverAddr := "grpc.vietstrix.com:443"
	
	// Khởi tạo kết nối gRPC với TLS
	creds := credentials.NewTLS(&tls.Config{})
	conn, err := grpc.NewClient(serverAddr, grpc.WithTransportCredentials(creds))
	if err != nil {
		log.Fatalf("❌ Kết nối thất bại: %v", err)
	}
	defer conn.Close()

	client := pb.NewAuthServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Kiểm tra JWT Token
	valRes, err := client.ValidateToken(ctx, &pb.ValidateTokenRequest{
		AccessToken: "your_jwt_access_token_here",
	})
	if err != nil {
		log.Fatalf("RPC Error: %v", err)
	}

	if valRes.GetIsValid() {
		fmt.Printf("✅ Token Hợp Lệ! UserID: %d, Role: %s\n", valRes.GetUserId(), valRes.GetRole())
		fmt.Printf("Permissions: %v\n", valRes.GetPermissions())
	} else {
		fmt.Printf("❌ Token Không Hợp Lệ: %s\n", valRes.GetErrorMessage())
	}
}
```

---

### 🔹 Cách 2: Sử dụng Node.js / Next.js Client (`@grpc/grpc-js`)

Cài đặt package:
```bash
npm install @grpc/grpc-js @grpc/proto-loader
```

Tạo file `lib/grpc-auth-client.js`:

```javascript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(process.cwd(), 'proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth.v1;

// Khởi tạo client kết nối TLS tới grpc.vietstrix.com:443
export const authGrpcClient = new authProto.AuthService(
  'grpc.vietstrix.com:443',
  grpc.credentials.createSsl()
);

/**
 * Hàm hỗ trợ Verify Token trong Next.js Middleware hoặc API Route
 */
export function validateAccessToken(accessToken) {
  return new Promise((resolve, reject) => {
    authGrpcClient.ValidateToken({ access_token: accessToken }, (err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
  });
}
```

---

## 🛠️ 4. Bảng Tra Cứu RPC Methods (API Reference)

| RPC Method | Request Body | Response Body | Mô tả |
|---|---|---|---|
| `ValidateToken` | `access_token` | `is_valid`, `user_id`, `role`, `permissions` | Kiểm tra nhanh JWT Token có hợp lệ không & lấy quyền |
| `Login` | `username`, `password` | `access_token`, `refresh_token`, `requires_2fa` | Đăng nhập tài khoản |
| `Verify2FA` | `temp_token`, `code` | `access_token`, `refresh_token` | Xác thực mã 2FA (OTP) |
| `RefreshToken` | `refresh_token` | `access_token`, `refresh_token` | Cấp lại Access Token mới khi sắp hết hạn |
| `GetProfile` | `access_token` | `profile`, `permissions` | Lấy chi tiết Hồ sơ người dùng |

---

## 🔒 5. Biến Môi Trường Ví Dụ (`.env`)

```env
# gRPC Auth Connection
GRPC_AUTH_SERVER_URL=grpc.vietstrix.com:443
```
