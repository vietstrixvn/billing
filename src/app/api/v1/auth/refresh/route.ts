import { NextResponse } from 'next/server';
import { grpcRefreshToken } from '@/libs/grpcClient';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    let refresh_token: string | undefined;

    // 1. Try reading from HttpOnly cookie
    const cookieStore = await cookies();
    refresh_token = cookieStore.get('refresh_token')?.value;

    // 2. Fallback to request body if present
    if (!refresh_token) {
      try {
        const body = await request.json();
        refresh_token = body?.refresh_token;
      } catch {
        // Body may be empty
      }
    }

    if (!refresh_token) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 401 }
      );
    }

    const ip_address =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const user_agent = request.headers.get('user-agent') || '';

    const grpcResponse = await grpcRefreshToken({
      refresh_token,
      ip_address,
      user_agent,
    });

    if (!grpcResponse || !grpcResponse.access_token) {
      const errorRes = NextResponse.json(
        { success: false, message: 'Token refresh failed' },
        { status: 401 }
      );
      errorRes.cookies.delete('refresh_token');
      return errorRes;
    }

    const response = NextResponse.json({
      success: true,
      data: grpcResponse,
    });

    // Update refresh_token cookie if backend returned a new refresh token
    if (grpcResponse.refresh_token) {
      response.cookies.set('refresh_token', grpcResponse.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('[API /auth/refresh Error]:', error);
    const errorRes = NextResponse.json(
      {
        success: false,
        message: error.details || error.message || 'Token refresh failed',
      },
      { status: 401 }
    );
    errorRes.cookies.delete('refresh_token');
    return errorRes;
  }
}
