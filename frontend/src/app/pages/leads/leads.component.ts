import { Component, OnInit } from '@angular/core';
import { Lead } from '../../core/models/lead.model';
import { MatDialog } from '@angular/material/dialog';
import { LeadService } from '../../core/services/lead.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirmation/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = []; // Todos os leads do backend
  filteredLeads: Lead[] = []; // Leads filtrados para exibição
  searchTerm: string = '';
  selectedStatus: string = '';
  isLoading: boolean = false;

  constructor(
    private leadService: LeadService,
    private router: Router,
    private dialog: MatDialog, 
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
  this.isLoading = true;
  this.leadService.getLeads().subscribe({
    next: (leads) => {
      this.leads = leads;
      this.applyFilters();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erro ao carregar leads:', error);
      this.isLoading = false;
    }
  });
}

  applyFilters(): void {
  let filtered = [...this.leads];

  // Filtro por busca (nome ou email)
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(lead => 
      lead.name?.toLowerCase().includes(term) || 
      lead.email?.toLowerCase().includes(term)
    );
  }

  // Filtro por status - VERSÃO FLEXÍVEL
  if (this.selectedStatus) {
    filtered = filtered.filter(lead => {
      if (!lead.status) return false;
      
      const leadStatus = lead.status.toLowerCase().trim();
      const selectedStatus = this.selectedStatus.toLowerCase().trim();
      
      // Verifica múltiplas possibilidades
      return leadStatus === selectedStatus ||
             this.getEquivalentStatus(leadStatus) === selectedStatus ||
             this.getEquivalentStatus(selectedStatus) === leadStatus;
    });
  }

  this.filteredLeads = filtered;
}

  onSearchChange(searchValue: string): void {
    this.searchTerm = searchValue;
    this.applyFilters(); // Aplica filtro localmente sem chamar o backend
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters(); // Aplica filtro localmente sem chamar o backend
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters(); // Mostra todos os leads
  }

  deleteLead(lead: Lead): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { 
      message: `Deseja excluir o lead "${lead.name}"?` 
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.leadService.deleteLead(lead.id).subscribe({
        next: () => {
          this.loadLeads();
          this.snackBar.open('Lead excluído com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erro ao excluir lead:', error);
          this.snackBar.open('Erro ao excluir lead', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  });
}

  editLead(lead: Lead): void {
    this.router.navigate(['/leads/edit', lead.id]);
  }

  viewLead(lead: Lead): void {
    this.router.navigate(['/leads', lead.id]);
  }

  createLead(): void {
    this.router.navigate(['/leads/new']);
  }

  getStatusColor(status: string): string {
    if (!status) return '#757575';
    
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'new':
      case 'novo': 
        return '#3f51b5';
      case 'qualified':
      case 'qualificado': 
        return '#ff4081';
      case 'won':
      case 'ganho': 
        return '#4caf50';
      case 'lost':
      case 'perdido': 
        return '#f44336';
      default: 
        return '#757575';
    }
  }

  private getEquivalentStatus(status: string): string {
  const statusMap: {[key: string]: string} = {
    'new': 'novo',
    'novo': 'new',
    'qualified': 'qualificado', 
    'qualificado': 'qualified',
    'won': 'ganho',
    'ganho': 'won',
    'lost': 'perdido',
    'perdido': 'lost'
  };
  
  return statusMap[status] || status;
}
}