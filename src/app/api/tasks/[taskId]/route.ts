import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { createErrorResponse, ErrorCode } from '@/lib/apiResponse';
import { updateTaskSchema } from '@/lib/validations';

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
      return createErrorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', [], 401);
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return createErrorResponse(ErrorCode.INVALID_TOKEN, 'Invalid token', [], 401);
    }

    const body = await request.json();
    const parsedBody = updateTaskSchema.safeParse(body);

    if (!parsedBody.success) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [parsedBody.error],
        400
      );
    }

    // SECURITY BUG: Not verifying the task belongs to a project owned by the logged-in user
    // Any authenticated user can update any task by guessing the taskId
    const task = await prisma.task.update({
      where: { 
        id: params.taskId ,
        project: { userId: payload.userId }
      },
      data: {
        title: parsedBody.data.title !== undefined ? parsedBody.data.title : undefined,
        description: parsedBody.data.description !== undefined ? parsedBody.data.description : undefined,
        completed: parsedBody.data.completed !== undefined ? parsedBody.data.completed : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Update failed',
      [],
      500
    );
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
      return createErrorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', [], 401);
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return createErrorResponse(ErrorCode.INVALID_TOKEN, 'Invalid token', [], 401);
    }

    // SECURITY BUG: Not verifying the task belongs to a project owned by the logged-in user
    // Any authenticated user can delete any task by guessing the taskId
    await prisma.task.delete({
      where: { id: params.taskId, project: { userId: payload.userId } },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Delete operation failed',
      [],
      500
    );
  }
}
