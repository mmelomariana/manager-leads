import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LeadsComponent } from './leads.component';
import { LeadService } from '../../core/services/lead.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirmation/confirm-dialog.component';
import { Lead } from '../../core/models/lead.model';

describe('LeadsComponent', () => {
  let component: LeadsComponent;
  let fixture: ComponentFixture<LeadsComponent>;
  let mockLeadService: jasmine.SpyObj<LeadService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockLeads: Lead[] = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@test.com', 
      status: 'New', 
      createdAt: '2023-01-01', 
      updatedAt: '2023-01-01',
      tasksCount: 2
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@test.com', 
      status: 'Qualified', 
      createdAt: '2023-01-02', 
      updatedAt: '2023-01-02',
      tasksCount: 1
    },
    { 
      id: 3, 
      name: 'Bob Wilson', 
      email: 'bob@test.com', 
      status: 'Won', 
      createdAt: '2023-01-03', 
      updatedAt: '2023-01-03',
      tasksCount: 0
    }
  ];

  beforeEach(async () => {
    // Criar mocks
    mockLeadService = jasmine.createSpyObj('LeadService', ['getLeads', 'deleteLead']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Configurar retornos padrão
    mockLeadService.getLeads.and.returnValue(of(mockLeads));
    mockLeadService.deleteLead.and.returnValue(of(void 0));
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);

    await TestBed.configureTestingModule({
      declarations: [LeadsComponent],
      imports: [
        // Módulos do Angular Material necessários
        NoopAnimationsModule, // Para evitar problemas com animações
        MatToolbarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTooltipModule
      ],
      providers: [
        { provide: LeadService, useValue: mockLeadService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load leads on init', () => {
      expect(mockLeadService.getLeads).toHaveBeenCalled();
      expect(component.leads).toEqual(mockLeads);
      expect(component.filteredLeads).toEqual(mockLeads);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading leads fails', () => {
      const error = new Error('Load failed');
      mockLeadService.getLeads.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.loadLeads();

      expect(console.error).toHaveBeenCalledWith('Erro ao carregar leads:', error);
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.leads = mockLeads;
    });

    it('should filter leads by search term (name)', () => {
      component.searchTerm = 'john';
      component.applyFilters();

      expect(component.filteredLeads.length).toBe(1);
      expect(component.filteredLeads[0].name).toBe('John Doe');
    });

    it('should filter leads by search term (email)', () => {
      component.searchTerm = 'jane@test.com';
      component.applyFilters();

      expect(component.filteredLeads.length).toBe(1);
      expect(component.filteredLeads[0].email).toBe('jane@test.com');
    });

    it('should filter leads by status (exact match)', () => {
      component.selectedStatus = 'Qualified';
      component.applyFilters();

      expect(component.filteredLeads.length).toBe(1);
      expect(component.filteredLeads[0].status).toBe('Qualified');
    });

    it('should filter leads by both search and status', () => {
      component.searchTerm = 'john';
      component.selectedStatus = 'New';
      component.applyFilters();

      expect(component.filteredLeads.length).toBe(1);
      expect(component.filteredLeads[0].name).toBe('John Doe');
    });

    it('should show all leads when filters are cleared', () => {
      component.searchTerm = 'xyz123nonexistent';
      component.selectedStatus = 'NonexistentStatus';
      component.applyFilters();

      expect(component.filteredLeads.length).toBe(0);

      component.clearFilters();

      expect(component.searchTerm).toBe('');
      expect(component.selectedStatus).toBe('');
      expect(component.filteredLeads.length).toBe(3);
    });

    it('should apply filters when search changes', () => {
      spyOn(component, 'applyFilters');
      
      component.onSearchChange('test');

      expect(component.searchTerm).toBe('test');
      expect(component.applyFilters).toHaveBeenCalled();
    });

    it('should apply filters when status changes', () => {
      spyOn(component, 'applyFilters');
      
      component.onStatusChange('Won');

      expect(component.selectedStatus).toBe('Won');
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('Lead Operations', () => {
    it('should navigate to create lead', () => {
      component.createLead();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/leads/new']);
    });

    it('should navigate to view lead details', () => {
      const lead = mockLeads[0];
      component.viewLead(lead);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/leads', lead.id]);
    });

    it('should navigate to edit lead', () => {
      const lead = mockLeads[0];
      component.editLead(lead);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/leads/edit', lead.id]);
    });

    it('should delete lead when confirmed', () => {
      const lead = mockLeads[0];
      
      component.deleteLead(lead);

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        data: { message: `Deseja excluir o lead "${lead.name}"?` }
      });
      expect(mockLeadService.deleteLead).toHaveBeenCalledWith(lead.id);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Lead excluído com sucesso!', 
        'Fechar', 
        { duration: 3000, panelClass: ['success-snackbar'] }
      );
    });

    it('should not delete lead when cancelled', () => {
      const lead = mockLeads[0];
      mockDialog.open.and.returnValue({ afterClosed: () => of(false) } as any);

      component.deleteLead(lead);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockLeadService.deleteLead).not.toHaveBeenCalled();
    });

    it('should handle error when deleting lead fails', () => {
      const lead = mockLeads[0];
      const error = new Error('Delete failed');
      mockLeadService.deleteLead.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.deleteLead(lead);

      expect(console.error).toHaveBeenCalledWith('Erro ao excluir lead:', error);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Erro ao excluir lead', 
        'Fechar', 
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    });
  });

  describe('Status Color', () => {
    it('should return correct color for status', () => {
      expect(component.getStatusColor('New')).toBe('#3f51b5');
      expect(component.getStatusColor('new')).toBe('#3f51b5');
      expect(component.getStatusColor('Qualified')).toBe('#ff4081');
      expect(component.getStatusColor('qualified')).toBe('#ff4081');
      expect(component.getStatusColor('Won')).toBe('#4caf50');
      expect(component.getStatusColor('won')).toBe('#4caf50');
      expect(component.getStatusColor('Lost')).toBe('#f44336');
      expect(component.getStatusColor('lost')).toBe('#f44336');
    });

    it('should return gray for unknown status', () => {
      expect(component.getStatusColor('Unknown')).toBe('#757575');
      expect(component.getStatusColor('')).toBe('#757575');
    });

    it('should handle Portuguese status names', () => {
      expect(component.getStatusColor('Novo')).toBe('#3f51b5');
      expect(component.getStatusColor('Qualificado')).toBe('#ff4081');
      expect(component.getStatusColor('Ganho')).toBe('#4caf50');
      expect(component.getStatusColor('Perdido')).toBe('#f44336');
    });
  });
});