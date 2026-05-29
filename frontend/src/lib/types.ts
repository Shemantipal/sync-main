import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'member', 'viewer']);
export type Role = z.infer<typeof RoleSchema>;

export const StatusSchema = z.enum(['todo', 'in_progress', 'review', 'completed']);
export type TaskStatus = z.infer<typeof StatusSchema>;

export const PrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type TaskPriority = z.infer<typeof PrioritySchema>;

export const UserRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
});
export type UserRef = z.infer<typeof UserRefSchema>;

export const ProjectMemberSchema = z.object({
  user: UserRefSchema,
  role: RoleSchema,
  joinedAt: z.string(),
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

export const ProjectSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']),
  owner: UserRefSchema.or(z.string()),
  members: z.array(ProjectMemberSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const AttachmentSchema = z.object({
  fileId: z.string(),
  url: z.string(),
  publicId: z.string(),
  filename: z.string(),
  size: z.number(),
  mimeType: z.string(),
  uploadedBy: z.string(),
  uploadedAt: z.string(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const TaskSchema = z.object({
  _id: z.string(),
  project: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: StatusSchema,
  priority: PrioritySchema,
  assignees: z.array(UserRefSchema.or(z.string())).default([]),
  dueDate: z.string().nullable().optional(),
  attachments: z.array(AttachmentSchema).default([]),
  createdBy: UserRefSchema.or(z.string()),
  updatedBy: z.string().optional(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

export const ActivitySchema = z.object({
  _id: z.string(),
  project: z.string(),
  actor: UserRefSchema.or(z.string()),
  action: z.string(),
  target: z.object({ kind: z.string(), id: z.string() }).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const NotificationSchema = z.object({
  _id: z.string(),
  kind: z.string(),
  project: z.string().optional(),
  task: z.string().optional(),
  actor: z.string().optional(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;
