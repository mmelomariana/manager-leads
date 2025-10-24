import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Lead, TaskItem } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  getLeads(search?: string, status?: string): Observable<Lead[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get<any[]>(`${this.apiUrl}/leads`, { params }).pipe(
      map(leads => leads.map(lead => this.mapLead(lead)))
    );
  }

  getLead(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leads/${id}`).pipe(
      map(lead => this.mapLeadDetail(lead))
    );
  }

  private mapLead(lead: any): Lead {
    return {
      ...lead,
      status: this.mapLeadStatus(lead.status)
    };
  }

  private mapLeadDetail(lead: any): any {
    return {
      ...lead,
      status: this.mapLeadStatus(lead.status),
      tasks: lead.tasks?.map((task: any) => this.mapTask(task)) || []
    };
  }

  private mapTask(task: any): TaskItem {
    return {
      ...task,
      status: this.mapTaskStatus(task.status)
    };
  }

  private mapLeadStatus(status: number): string {
    const statusMap = ['Novo', 'Qualificado', 'Ganho', 'Perdido'];
    return statusMap[status] || 'New';
  }

  private mapTaskStatus(status: number): string {
    const statusMap = ['Todo', 'Doing', 'Done'];
    return statusMap[status] || 'Todo';
  }

  createLead(lead: { name: string; email: string; status?: string }): Observable<Lead> {
    const leadToCreate = {
      ...lead,
      status: this.mapStatusToNumber(lead.status || 'New')
    };
    return this.http.post<Lead>(`${this.apiUrl}/leads`, leadToCreate);
  }

  updateLead(id: number, lead: { name: string; email: string; status: string }): Observable<void> {
    const leadToUpdate = {
      ...lead,
      status: this.mapStatusToNumber(lead.status)
    };
    return this.http.put<void>(`${this.apiUrl}/leads/${id}`, leadToUpdate);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leads/${id}`);
  }

  getTasks(leadId: number): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(`${this.apiUrl}/leads/${leadId}/tasks`);
  }

  createTask(leadId: number, task: { title: string; dueDate?: string; status?: string }): Observable<TaskItem> {
    const taskToCreate = {
      ...task,
      status: this.mapTaskStatusToNumber(task.status || 'Todo')
    };
    return this.http.post<TaskItem>(`${this.apiUrl}/leads/${leadId}/tasks`, taskToCreate);
  }

  updateTask(leadId: number, taskId: number, task: { title: string; dueDate?: string; status: string }): Observable<void> {
    const taskToUpdate = {
      ...task,
      status: this.mapTaskStatusToNumber(task.status)
    };
    return this.http.put<void>(`${this.apiUrl}/leads/${leadId}/tasks/${taskId}`, taskToUpdate);
  }

  deleteTask(leadId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leads/${leadId}/tasks/${taskId}`);
  }

  private mapStatusToNumber(status: string): number {
    const statusMap: { [key: string]: number } = {
      'New': 0,
      'Qualified': 1,
      'Won': 2,
      'Lost': 3
    };
    return statusMap[status] || 0;
  }

  private mapTaskStatusToNumber(status: string): number {
    const statusMap: { [key: string]: number } = {
      'Todo': 0,
      'Doing': 1,
      'Done': 2
    };
    return statusMap[status] || 0;
  }
}