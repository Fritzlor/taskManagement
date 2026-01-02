import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';

// GET /api/projects/:projectId/tasks - List tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Duplicated auth logic (intentional code smell)
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // SECURITY BUG: Only checking if user is authenticated, NOT if they own the project
    // This allows any authenticated user to access any project's tasks by ID
    const tasks = await prisma.task.findMany({
      where: { projectId: params.projectId },
      orderBy: { createdAt: 'desc' },
      // No pagination (intentional issue)
    });

    return NextResponse.json(tasks);
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

  
     const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        projectId: params.projectId,
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
