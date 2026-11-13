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

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const authPackage = protoDescriptor.auth?.v1;

// Clean target host from URL protocol if present
const rawUrl = process.env.GRPC_AUTH_SERVER_URL || 'grpc.vietstrix.com:443';
const target = rawUrl.replace(/^https?:\/\//, '');

// Create SSL credentials for port 443 / domain, or insecure for local dev
const credentials =
  target.endsWith(':443') || !target.includes(':')
    ? grpc.credentials.createSsl()
    : grpc.credentials.createInsecure();

export const grpcAuthServiceClient = new authPackage.AuthService(
  target,
  credentials
);

/**
 * Promisified gRPC Login call
 */
export function grpcLogin(payload: {
  username: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    grpcAuthServiceClient.Login(payload, (err: any, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

/**
 * Promisified gRPC Verify2FA call
 */
export function grpcVerify2FA(payload: {
  temp_token: string;
  code: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    grpcAuthServiceClient.Verify2FA(payload, (err: any, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

/**
 * Promisified gRPC RefreshToken call
 */
export function grpcRefreshToken(payload: {
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    grpcAuthServiceClient.RefreshToken(payload, (err: any, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

/**
 * Promisified gRPC GetProfile call
 */
export function grpcGetProfile(userId: string | number, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const metadata = new grpc.Metadata();
    if (token) {
      metadata.add('authorization', `Bearer ${token}`);
    }
    grpcAuthServiceClient.GetProfile(
      { user_id: userId },
      metadata,
      (err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      }
    );
  });
}
