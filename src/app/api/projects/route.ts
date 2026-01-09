import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { createErrorResponse, ErrorCode } from '@/lib/apiResponse';
import { createProjectSchema } from '@/lib/validations';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';

// GET /api/projects - List user's projects
export async function GET() {
  try {
    // Duplicated auth logic (intentional code smell)
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', [], 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return createErrorResponse(ErrorCode.INVALID_TOKEN, 'Invalid token', [], 401);
    }

    const projects = await prisma.project.findMany({
      where: { userId: payload.userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to fetch projects',
      [],
      500
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    // Duplicated auth logic again (intentional code smell)
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', [], 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return createErrorResponse(ErrorCode.INVALID_TOKEN, 'Invalid token', [], 401);
    }

    const body = await request.json();
    const parsedBody = createProjectSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [parsedBody.error],
        400
      );
    }
    
    // No validation on body (intentional issue)
    const project = await prisma.project.create({
      data: {
        name: parsedBody.data.name,
        userId: payload.userId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to create project',
      [],
      500
    );
  }
}
