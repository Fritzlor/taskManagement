import {z} from 'zod';

// model Task {
//   id          String   @id @default(cuid())
//   title       String
//   description String?
//   completed   Boolean  @default(false)
//   projectId   String
//   createdAt   DateTime @default(now())
//   project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
// }



export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(3).max(1000).optional(),
});

export const projectIdSchema = z.object({
  projectId: z.string(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  completed: z.boolean().optional(),
}); 