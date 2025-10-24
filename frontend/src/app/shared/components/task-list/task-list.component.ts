import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TaskItem } from 'src/app/core/models/lead.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @Input() tasks: TaskItem[] = [];
  @Input() leadId!: number;
  @Output() taskCreated = new EventEmitter<any>();
  @Output() taskUpdated = new EventEmitter<{taskId: number, task: any}>();
  @Output() taskDeleted = new EventEmitter<number>();

  showTaskForm = false;
  editingTask: TaskItem | null = null;

  ngOnInit(): void {
    console.log('TaskList initialized with leadId:', this.leadId);
  }

  onCreateTask(taskData: any): void {
    this.taskCreated.emit(taskData);
    this.showTaskForm = false;
  }

  onUpdateTask(taskData: any): void {
    if (this.editingTask) {
      this.taskUpdated.emit({
        taskId: this.editingTask.id,
        task: taskData
      });
      this.editingTask = null;
      this.showTaskForm = false;
    }
  }

  onEditTask(task: TaskItem): void {
    this.editingTask = task;
    this.showTaskForm = true;
  }

  onDeleteTask(taskId: number): void {
    if (confirm('Tem certeza que deseja excluir esta task?')) {
      this.taskDeleted.emit(taskId);
    }
  }

  onCancelForm(): void {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Todo': return 'badge-secondary';
      case 'Doing': return 'badge-warning';
      case 'Done': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Todo': return 'A Fazer';
      case 'Doing': return 'Fazendo';
      case 'Done': return 'Concluído';
      default: return status;
    }
  }
}