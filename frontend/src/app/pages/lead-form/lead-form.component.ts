import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { Lead } from '../../core/models/lead.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss']
})
export class LeadFormComponent implements OnInit {
  leadForm!: FormGroup;
  isEdit = false;
  leadId?: number;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private notificationService: NotificationService
  ) {
    this.leadForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.leadId = +params['id'];
        this.loadLead();
      } else {
        this.createForm();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['New', Validators.required]
    });
  }

  loadLead(): void {
  if (!this.leadId) return;
  
  this.leadService.getLead(this.leadId).subscribe({
    next: (lead: any) => {        
      // Mapeamento dos valores de status
      let status = 'New';
      if (lead.status) {
        // Converte os valores com acento para os valores do select
        const statusMap: { [key: string]: string } = {
          'Novo': 'New',
          'Qualificado': 'Qualified',
          'Ganho': 'Won',
          'Perdido': 'Lost'
        };
        
        // Se o status existir no mapa, usa o valor mapeado, senão usa o original
        status = statusMap[lead.status] || lead.status;
      }

      this.leadForm.patchValue({
        name: lead.name || '',
        email: lead.email || '',
        status: status
      });

    },
    error: (error: any) => {  
      console.error('Erro ao carregar lead:', error);
      this.notificationService.showError('Erro ao carregar lead');
    }
  });
}

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    console.log('🔐 Token antes de enviar:', localStorage.getItem('auth_token'));
  console.log('📤 Enviando lead:', this.leadForm.value);
  
    this.isLoading = true;
    const formValue = this.leadForm.value;

    const handleSuccess = (): void => {
      this.isLoading = false;
      const message = this.isEdit ? 'Lead atualizado com sucesso!' : 'Lead criado com sucesso!';
      this.notificationService.showSuccess(message);
      this.router.navigate(['/leads']);
    };

    const handleError = (error: any): void => {
      this.isLoading = false;
      console.error('Erro ao salvar lead:', error);
      const message = this.isEdit ? 'Erro ao atualizar lead' : 'Erro ao criar lead';
      this.notificationService.showError(message);
    };

    if (this.isEdit) {
      this.leadService.updateLead(this.leadId!, formValue).subscribe({
        next: handleSuccess,
        error: handleError
      });
    } else {
      this.leadService.createLead(formValue).subscribe({
        next: handleSuccess,
        error: handleError
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.leadForm.controls).forEach(key => {
      this.leadForm.get(key)?.markAsTouched();
    });
  }

  get name() { return this.leadForm.get('name'); }
  get email() { return this.leadForm.get('email'); }
  get status() { return this.leadForm.get('status'); }

  onCancel(): void {
    this.router.navigate(['/leads']);
  }
}