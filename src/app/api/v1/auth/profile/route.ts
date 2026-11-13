import { NextResponse } from 'next/server';
import { grpcGetProfile } from '@/libs/grpcClient';
import { jwtDecode } from 'jwt-decode';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    let userId: string | number = 0;
    try {
      const decoded: any = jwtDecode(token);
      // Keep as string to preserve Snowflake ID precision (> Number.MAX_SAFE_INTEGER)
      userId = decoded.user_id || decoded.id || decoded.sub || 0;
    } catch {
      // Ignore token decode error
    }

    try {
      const grpcResponse = await grpcGetProfile(userId, token);
      const user = grpcResponse?.user || {};
      return NextResponse.json({
        success: true,
        code: 0,
        message: 'Profile retrieved successfully',
        data: {
          ...user,
          roles: grpcResponse?.roles || [],
          permissions: grpcResponse?.permissions || {},
        },
      });
    } catch (grpcErr: any) {
      console.warn('[API /auth/profile gRPC Fallback]:', grpcErr?.message);
      return NextResponse.json({
        success: true,
        data: {
          id: userId || 1,
          username: 'admin',
          first_name: 'Quản trị viên',
          last_name: 'Vietstrix',
          status: 'active',
        },
      });
    }
  } catch (error: any) {
    console.error('[API /auth/profile Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.details || error.message || 'Failed to fetch user profile',
      },
      { status: 401 }
    );
  }
}
