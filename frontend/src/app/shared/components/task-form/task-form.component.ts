import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskStatus, TaskItem } from './../../../core/models/lead.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  @Input() task?: TaskItem;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.task) {
      this.patchFormWithTaskData();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      dueDate: ['', Validators.required],
      status: ['Todo', Validators.required]
    });
  }

  patchFormWithTaskData(): void {
    if (!this.task) return;

    // Converte a data para o formato do datepicker
    let dueDate = null;
    if (this.task.dueDate) {
      try {
        const date = new Date(this.task.dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = date;
        }
      } catch (error) {
        console.error('Erro ao formatar data:', error);
      }
    }

    // Converte status
    let status = 'Todo';
    if (typeof this.task.status === 'number') {
      const statusMap = ['Todo', 'Doing', 'Done'];
      status = statusMap[this.task.status] || 'Todo';
    } else {
      status = this.task.status;
    }

    this.taskForm.patchValue({
      title: this.task.title,
      dueDate: dueDate,
      status: status
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      // Converte a data para string no formato YYYY-MM-DD
      const formValue = { ...this.taskForm.value };
      if (formValue.dueDate instanceof Date) {
        const year = formValue.dueDate.getFullYear();
        const month = (formValue.dueDate.getMonth() + 1).toString().padStart(2, '0');
        const day = formValue.dueDate.getDate().toString().padStart(2, '0');
        formValue.dueDate = `${year}-${month}-${day}`;
      }
      
      this.save.emit(formValue);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get title() { return this.taskForm.get('title'); }
  get dueDate() { return this.taskForm.get('dueDate'); }
  get status() { return this.taskForm.get('status'); }
}