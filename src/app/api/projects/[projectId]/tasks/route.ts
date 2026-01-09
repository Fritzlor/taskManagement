import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { createTaskSchema, projectIdSchema } from '@/lib/validations';
import { createErrorResponse, ErrorCode } from '@/lib/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';

// GET /api/projects/:projectId/tasks - List tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string , page?: number, pageSize?: number } }
) {
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

    const page = params.page ? params.page : 1;
    const pageSize = params.pageSize ? params.pageSize : 10;

    const sagePage = Math.max(1, page);
    const sagePageSize = Math.min(50, Math.max(1, pageSize));

    const skip = (sagePage - 1) * sagePageSize;
    const take = sagePageSize;

    // Check if the project exists and belongs to the authenticated user
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: payload.userId,
      },
    });

    if (!project) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Access denied to this project', [], 403);
    }

    const tasks = await prisma.task.findMany({
      where: { 
        projectId: params.projectId,
        project: { userId: payload.userId } 
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const totalCount = await prisma.task.count({
      where: { 
        projectId: params.projectId,
        project: { userId: payload.userId } 
      },
    });

    return NextResponse.json({
      data: tasks,
      pagination: {
        page: sagePage,
        pageSize: sagePageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / sagePageSize),
        hasNext: (sagePage * sagePageSize) < totalCount,
        hasPrevious: sagePage > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to fetch tasks',
      [],
      500
    );
  }
}

// POST /api/projects/:projectId/tasks - Create a task
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
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
    const parsedBody = createTaskSchema.safeParse(body);

    const parsedProjectID = projectIdSchema.safeParse(params);
    
    if(!parsedBody.success || !parsedProjectID.success) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [{ body: parsedBody.error, params: parsedProjectID.error }],
        400
      );
    }

    // Check if the project exists and belongs to the authenticated user
    const project = await prisma.project.findFirst({
      where: {
        id: parsedProjectID.data.projectId,
        userId: payload.userId,
      },
    });

    if (!project) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Access denied to this project', [], 403);
    }

    const task = await prisma.task.create({
      data: {
        title: parsedBody.data.title,
        description: parsedBody.data.description || null,
        projectId: parsedProjectID.data.projectId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Task creation failed',
      [],
      500
    );
  }
}
