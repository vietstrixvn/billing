import { NextResponse } from 'next/server';
import { grpcLogin } from '@/libs/grpcClient';

export async function POST(request: Request) {
  try {
    const body: { username?: string; password?: string } = await request.json();
    const { username, password } = body;


    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const ip_address =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const user_agent = request.headers.get('user-agent') || '';

    const grpcResponse = await grpcLogin({
      username,
      password,
      ip_address,
      user_agent,
    });

    if (!grpcResponse || !grpcResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: grpcResponse?.message || 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // Wrap in standard API response structure
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: grpcResponse,
    });

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
    console.error('[API /auth/login Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.details || error.message || 'Authentication error',
      },
      { status: 500 }
    );
  }
}
