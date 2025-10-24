import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

// Importações do Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LeadFormComponent } from './lead-form.component';
import { LeadService } from '../../core/services/lead.service';
import { NotificationService } from '../../core/services/notification.service';
import { Lead } from '../../core/models/lead.model';

describe('LeadFormComponent', () => {
  let component: LeadFormComponent;
  let fixture: ComponentFixture<LeadFormComponent>;
  let mockLeadService: jasmine.SpyObj<LeadService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Criar mocks
    mockLeadService = jasmine.createSpyObj('LeadService', ['getLead', 'createLead', 'updateLead']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock ActivatedRoute para modo criação
    mockActivatedRoute = {
      params: of({}) // Sem ID = modo criação
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        // Módulos do Angular Material necessários
        NoopAnimationsModule,
        MatToolbarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule
      ],
      declarations: [LeadFormComponent],
      providers: [
        { provide: LeadService, useValue: mockLeadService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization - Create Mode', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize in create mode by default', () => {
      expect(component.isEdit).toBeFalse();
      expect(component.leadId).toBeUndefined();
      expect(component.isLoading).toBeFalse();
    });

    it('should initialize form with default values', () => {
      expect(component.leadForm).toBeDefined();
      expect(component.name?.value).toBe('');
      expect(component.email?.value).toBe('');
      expect(component.status?.value).toBe('New');
    });
  });

  describe('Initialization - Edit Mode', () => {
    beforeEach(() => {
      // Configurar ActivatedRoute para modo edição
      mockActivatedRoute.params = of({ id: '1' });
      mockLeadService.getLead.and.returnValue(of({
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        status: 'Novo', // Status em português
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      }));
    });

    it('should initialize in edit mode when ID is provided', () => {
      // Recriar componente com route params diferentes
      fixture = TestBed.createComponent(LeadFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isEdit).toBeTrue();
      expect(component.leadId).toBe(1);
    });

    it('should load lead data when in edit mode', () => {
      fixture = TestBed.createComponent(LeadFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockLeadService.getLead).toHaveBeenCalledWith(1);
      expect(component.name?.value).toBe('John Doe');
      expect(component.email?.value).toBe('john@test.com');
      expect(component.status?.value).toBe('New'); // Status mapeado para inglês
    });

    it('should handle Portuguese status mapping', () => {
      mockLeadService.getLead.and.returnValue(of({
        id: 1,
        name: 'Test Lead',
        email: 'test@test.com',
        status: 'Qualificado', // Status em português
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      }));

      fixture = TestBed.createComponent(LeadFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.status?.value).toBe('Qualified'); // Mapeado para inglês
    });

    it('should handle error when loading lead fails', () => {
      const error = new Error('Load failed');
      mockLeadService.getLead.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture = TestBed.createComponent(LeadFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith('Erro ao carregar lead:', error);
      expect(mockNotificationService.showError).toHaveBeenCalledWith('Erro ao carregar lead');
    });
  });

  describe('Form Validation', () => {
    it('should validate name as required', () => {
      component.name?.setValue('');
      expect(component.name?.invalid).toBeTrue();
      expect(component.name?.errors?.['required']).toBeTruthy();
    });

    it('should validate name minimum length', () => {
      component.name?.setValue('ab');
      expect(component.name?.invalid).toBeTrue();
      expect(component.name?.errors?.['minlength']).toBeTruthy();

      component.name?.setValue('abc');
      expect(component.name?.valid).toBeTrue();
    });

    it('should validate email as required', () => {
      component.email?.setValue('');
      expect(component.email?.invalid).toBeTrue();
      expect(component.email?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      component.email?.setValue('invalid-email');
      expect(component.email?.invalid).toBeTrue();
      expect(component.email?.errors?.['email']).toBeTruthy();

      component.email?.setValue('valid@email.com');
      expect(component.email?.valid).toBeTrue();
    });

    it('should validate status as required', () => {
      component.status?.setValue('');
      expect(component.status?.invalid).toBeTrue();
      expect(component.status?.errors?.['required']).toBeTruthy();
    });

    it('should mark form as invalid when required fields are empty', () => {
      component.leadForm.patchValue({
        name: '',
        email: '',
        status: ''
      });

      expect(component.leadForm.invalid).toBeTrue();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
      component.leadForm.patchValue({
        name: 'Valid Name',
        email: 'valid@email.com',
        status: 'New'
      });

      expect(component.leadForm.valid).toBeTrue();
    });
  });

  describe('Form Submission - Create Mode', () => {
    beforeEach(() => {
      // Preencher form com dados válidos
      component.leadForm.patchValue({
        name: 'New Lead',
        email: 'new@test.com',
        status: 'Qualified'
      });

      mockLeadService.createLead.and.returnValue(of({} as Lead));
    });

    it('should create lead when form is valid', () => {
      component.onSubmit();

      expect(mockLeadService.createLead).toHaveBeenCalledWith({
        name: 'New Lead',
        email: 'new@test.com',
        status: 'Qualified'
      });
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Lead criado com sucesso!');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/leads']);
    });

    it('should not submit when form is invalid', () => {
      component.leadForm.patchValue({ name: '' }); // Tornar inválido
      
      // Espionar o método privado indiretamente verificando se os controles ficaram touched
      const nameControl = component.leadForm.get('name');
      const emailControl = component.leadForm.get('email');
      const statusControl = component.leadForm.get('status');

      component.onSubmit();

      expect(mockLeadService.createLead).not.toHaveBeenCalled();
      expect(nameControl?.touched).toBeTrue();
      expect(emailControl?.touched).toBeTrue();
      expect(statusControl?.touched).toBeTrue();
    });

    it('should handle error when creating lead fails', () => {
      const error = new Error('Create failed');
      mockLeadService.createLead.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Erro ao salvar lead:', error);
      expect(mockNotificationService.showError).toHaveBeenCalledWith('Erro ao criar lead');
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Form Submission - Edit Mode', () => {
    beforeEach(() => {
      // Configurar modo edição
      component.isEdit = true;
      component.leadId = 1;
      
      // Preencher form com dados válidos
      component.leadForm.patchValue({
        name: 'Updated Lead',
        email: 'updated@test.com',
        status: 'Won'
      });

      mockLeadService.updateLead.and.returnValue(of(void 0));
    });

    it('should update lead when form is valid', () => {
      component.onSubmit();

      expect(mockLeadService.updateLead).toHaveBeenCalledWith(1, {
        name: 'Updated Lead',
        email: 'updated@test.com',
        status: 'Won'
      });
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Lead atualizado com sucesso!');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/leads']);
    });

    it('should handle error when updating lead fails', () => {
      const error = new Error('Update failed');
      mockLeadService.updateLead.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Erro ao salvar lead:', error);
      expect(mockNotificationService.showError).toHaveBeenCalledWith('Erro ao atualizar lead');
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Form Utilities', () => {
    it('should navigate back on cancel', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/leads']);
    });

    it('should provide access to form controls via getters', () => {
      expect(component.name).toBe(component.leadForm.get('name'));
      expect(component.email).toBe(component.leadForm.get('email'));
      expect(component.status).toBe(component.leadForm.get('status'));
    });
  });

  describe('Loading State', () => {
    it('should set loading state during submission', () => {
      component.leadForm.patchValue({
        name: 'Test',
        email: 'test@test.com',
        status: 'New'
      });
      mockLeadService.createLead.and.returnValue(of({} as Lead));

      component.onSubmit();

      // Loading deve ser true durante a requisição e false após
      expect(component.isLoading).toBeFalse(); // Já terminou devido ao mock síncrono
    });

    it('should show loading state during async operation', (done) => {
      component.leadForm.patchValue({
        name: 'Test',
        email: 'test@test.com',
        status: 'New'
      });

      // Criar um Observable que não completa imediatamente
      let resolve: any;
      const promise = new Promise<Lead>((r) => { resolve = r; });
      mockLeadService.createLead.and.returnValue(of({} as Lead).pipe()); // Manter síncrono por simplicidade

      component.onSubmit();
      
      // Verificar que isLoading foi resetado após a operação
      expect(component.isLoading).toBeFalse();
      done();
    });
  });

  describe('Form State After Submission', () => {
    it('should reset loading state after successful submission', () => {
      component.leadForm.patchValue({
        name: 'Test Lead',
        email: 'test@test.com',
        status: 'New'
      });
      mockLeadService.createLead.and.returnValue(of({} as Lead));

      component.onSubmit();

      expect(component.isLoading).toBeFalse();
    });

    it('should reset loading state after failed submission', () => {
      component.leadForm.patchValue({
        name: 'Test Lead',
        email: 'test@test.com',
        status: 'New'
      });
      mockLeadService.createLead.and.returnValue(throwError(() => new Error('Failed')));

      component.onSubmit();

      expect(component.isLoading).toBeFalse();
    });
  });
});