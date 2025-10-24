import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { Lead, TaskItem } from '../../core/models/lead.model';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirmation/confirm-dialog.component';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit {
    lead: any;
    tasks: TaskItem[] = [];
    isLoading = false;
    showTaskForm = false;
    editingTask: TaskItem | null = null;
    leadId: number;

    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private leadService: LeadService,
      private notificationService: NotificationService,
      private dialog: MatDialog
    ) { 
      this.leadId = +this.route.snapshot.params['id'];
    }

    ngOnInit(): void {
      this.loadLead();
      this.loadTasks();
    }

    loadLead(): void {
      const leadId = +this.route.snapshot.params['id'];
      this.leadService.getLead(leadId).subscribe({
        next: (lead) => {
          this.lead = lead;
        },
        error: (error) => {
          console.error('Erro ao carregar lead:', error);
          alert('Erro ao carregar lead');
        }
      });
    }

    loadTasks(): void {
      const leadId = +this.route.snapshot.params['id'];
      this.leadService.getTasks(leadId).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (error) => {
          console.error('Erro ao carregar tasks:', error);
        }
      });
    }

   getTaskStatusText(status: any): string {
    // Se status for número, converte para string em português
    if (typeof status === 'number') {
      const statusMap = ['A Fazer', 'Fazendo', 'Concluído'];
      return statusMap[status] || 'A Fazer';
    }
    
    // Se já for string, converte para português
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'todo':
        return 'A Fazer';
      case 'doing':
        return 'Fazendo';
      case 'done':
        return 'Concluído';
      default:
        return status; // Se já estiver em português, mantém
    }
  }

  getTaskStatusClass(status: any): string {
    const statusText = this.getTaskStatusText(status);
    return `status-${statusText.toLowerCase()}`;
  }

  createTask(task: { title: string; dueDate?: string; status?: string }): void {
    this.leadService.createTask(this.leadId, task).subscribe({
      next: () => {
        this.loadTasks();
        this.showTaskForm = false;
        this.notificationService.showSuccess('Task criada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar task:', error);
        this.notificationService.showError('Erro ao criar task');
      }
    });
  }

  updateTask(taskId: number, task: { title: string; dueDate?: string; status: string }): void {
    this.leadService.updateTask(this.leadId, taskId, task).subscribe({
      next: () => {
        this.loadTasks(); 
        this.showTaskForm = false;
        this.editingTask = null;
        this.notificationService.showSuccess('Task atualizada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar task:', error);
        this.notificationService.showError('Erro ao atualizar task');
      }
    });
  }

  deleteTask(taskId: number): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { 
          message: 'Deseja excluir esta task?' 
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.leadService.deleteTask(this.leadId, taskId).subscribe({
            next: () => {
              this.loadTasks();
              this.notificationService.showSuccess('Task excluída com sucesso!');
            },
            error: (error) => {
              console.error('Erro ao excluir task:', error);
              this.notificationService.showError('Erro ao excluir task');
            }
          });
        }
      });
    }

  onTaskSave(taskData: any): void {
    if (this.editingTask) {
      this.updateTask(this.editingTask.id, taskData);
    } else {
      this.createTask(taskData);
    }
  }

  editTask(task: TaskItem): void {
    this.editingTask = { ...task };
    this.showTaskForm = true;
  }

  cancelTaskForm(): void {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  onBack(): void {
    this.router.navigate(['/leads']);
  }

  getStatusColor(status: string): string {
  if (!status) return '#757575';
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'new':
    case 'novo':
    case 'todo': 
    case 'a fazer':
      return '#3f51b5'; // Azul
    case 'qualified':
    case 'qualificado':
    case 'doing': 
    case 'fazendo':
      return '#ff4081'; // Rosa
    case 'won':
    case 'ganho':
    case 'done': 
    case 'concluído':
      return '#4caf50'; // Verde
    case 'lost':
    case 'perdido': 
      return '#f44336'; // Vermelho
    default: 
      return '#757575'; // Cinza
  }
}
}