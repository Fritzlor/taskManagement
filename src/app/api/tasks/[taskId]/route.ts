import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';

// PATCH /api/tasks/:taskId - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
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

    const body = await request.json();

    // SECURITY BUG: Not verifying the task belongs to a project owned by the logged-in user
    // Any authenticated user can update any task by guessing the taskId
    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        completed: body.completed !== undefined ? body.completed : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    // Inconsistent error format
    return NextResponse.json('Update failed', { status: 500 });
  }
}

// DELETE /api/tasks/:taskId - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Duplicated auth logic yet again (intentional code smell)
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ unauthorized: true }, { status: 401 }); // Inconsistent
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ unauthorized: true }, { status: 401 });
    }

    // SECURITY BUG: Not verifying the task belongs to a project owned by the logged-in user
    // Any authenticated user can delete any task by guessing the taskId
    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: { message: 'Delete operation failed' } }, // Yet another error shape
      { status: 500 }
    );
  }
}
