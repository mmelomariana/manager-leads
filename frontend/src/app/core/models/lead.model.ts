export type LeadStatus = 'New' | 'Qualified' | 'Won' | 'Lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
}

export type TaskStatus = 'Todo' | 'Doing' | 'Done';

export interface TaskItem {
  id: number;
  leadId: number;
  title: string;
  dueDate?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}