import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { createTaskSchema, projectIdSchema } from '@/lib/validations';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const page = params.page ? params.page : 1;
    const pageSize = params.pageSize ? params.pageSize : 10;

    const sagePage = Math.max(1, page);
    const sagePageSize = Math.min(50, Math.max(1, pageSize));

    const skip = (sagePage - 1) * sagePageSize;
    const take = sagePageSize;

    // SECURITY BUG: Only checking if user is authenticated, NOT if they own the project
    // This allows any authenticated user to access any project's tasks by ID
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
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
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
      return NextResponse.json('Not authenticated', { status: 401 }); // Inconsistent error
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json('Bad token', { status: 401 }); // Inconsistent error
    }

    const body = await request.json();
    const parsedBody = createTaskSchema.safeParse(body);

    const parsedProjectID = projectIdSchema.safeParse(params);
    
    if(!parsedBody.success || !parsedProjectID.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: {body: parsedBody.error,params: parsedProjectID.error} },
        { status: 400 }
      );
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
    return NextResponse.json(
      { message: 'Task creation failed' }, 
      { status: 500 }
    );
  }
}
