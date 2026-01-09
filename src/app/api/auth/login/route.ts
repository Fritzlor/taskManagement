import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { createErrorResponse, ErrorCode } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return createErrorResponse(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
        [],
        401
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return createErrorResponse(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
        [],
        401
      );
    }

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred during login',
      [],
      500
    );
  }
}
