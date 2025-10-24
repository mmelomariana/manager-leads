import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LeadService } from './lead.service';
import { Lead, TaskItem } from '../models/lead.model';

describe('LeadService', () => {
  let service: LeadService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:5209/api'; // ✅ URL CORRETA

  // Dados de teste
  const mockLeads = [
    { id: 1, name: 'Lead 1', email: 'lead1@test.com', status: 0, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
    { id: 2, name: 'Lead 2', email: 'lead2@test.com', status: 1, createdAt: '2023-01-02', updatedAt: '2023-01-02' }
  ];

  const mockLeadDetail = {
    id: 1,
    name: 'Lead 1',
    email: 'lead1@test.com',
    status: 0,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    tasks: [
      { id: 1, leadId: 1, title: 'Task 1', status: 0, dueDate: '2023-12-31', createdAt: '2023-01-01', updatedAt: '2023-01-01' }
    ]
  };

  const mockTasks = [
    { id: 1, leadId: 1, title: 'Task 1', status: 0, dueDate: '2023-12-31', createdAt: '2023-01-01', updatedAt: '2023-01-01' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeadService]
    });
    
    service = TestBed.inject(LeadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que não há requests pendentes
  });

  describe('getLeads', () => {
    it('should fetch leads without filters', () => {
      service.getLeads().subscribe(leads => {
        expect(leads.length).toBe(2);
        expect(leads[0].name).toBe('Lead 1');
        expect(leads[0].status).toBe('Novo'); // Status mapeado
      });

      const req = httpMock.expectOne(`${API_URL}/leads`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLeads);
    });

    it('should fetch leads with search filter', () => {
      service.getLeads('lead1', undefined).subscribe();

      const req = httpMock.expectOne(`${API_URL}/leads?search=lead1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('lead1');
      req.flush(mockLeads);
    });

    it('should fetch leads with status filter', () => {
      service.getLeads(undefined, 'Qualified').subscribe();

      const req = httpMock.expectOne(`${API_URL}/leads?status=Qualified`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe('Qualified');
      req.flush(mockLeads);
    });
  });

  describe('getLead', () => {
    it('should fetch lead details with tasks', () => {
      service.getLead(1).subscribe(lead => {
        expect(lead.id).toBe(1);
        expect(lead.name).toBe('Lead 1');
        expect(lead.status).toBe('Novo'); // Status mapeado
        expect(lead.tasks.length).toBe(1);
        expect(lead.tasks[0].title).toBe('Task 1');
      });

      const req = httpMock.expectOne(`${API_URL}/leads/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLeadDetail);
    });
  });

  describe('createLead', () => {
    it('should create a new lead', () => {
      const newLead = { name: 'New Lead', email: 'new@test.com', status: 'New' };

      service.createLead(newLead).subscribe();

      const req = httpMock.expectOne(`${API_URL}/leads`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'New Lead',
        email: 'new@test.com',
        status: 0 // Status mapeado para número
      });
      req.flush({});
    });
  });

  describe('updateLead', () => {
    it('should update an existing lead', () => {
      const updatedLead = { name: 'Updated Lead', email: 'updated@test.com', status: 'Won' };

      service.updateLead(1, updatedLead).subscribe();

      const req = httpMock.expectOne(`${API_URL}/leads/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.status).toBe(2); // Won = 2
      req.flush({});
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead', () => {
      service.deleteLead(1).subscribe();

      const req = httpMock.expectOne(`${API_URL}/leads/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Task Operations', () => {
    it('should get tasks for a lead', () => {
      service.getTasks(1).subscribe(tasks => {
        expect(tasks.length).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/leads/1/tasks`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });

    it('should create a task', () => {
      const newTask = { title: 'New Task', dueDate: '2023-12-31', status: 'Todo' };

      service.createTask(1, newTask).subscribe();

      const req = httpMock.expectOne(`${API_URL}/leads/1/tasks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.status).toBe(0); // Todo = 0
      req.flush({});
    });
  });

  describe('Status Mapping', () => {
    it('should map lead status numbers to Portuguese text', () => {
      // Testa o mapeamento interno
      expect(service['mapLeadStatus'](0)).toBe('Novo');
      expect(service['mapLeadStatus'](1)).toBe('Qualificado');
      expect(service['mapLeadStatus'](2)).toBe('Ganho');
      expect(service['mapLeadStatus'](3)).toBe('Perdido');
    });

    it('should map task status numbers to English text', () => {
      expect(service['mapTaskStatus'](0)).toBe('Todo');
      expect(service['mapTaskStatus'](1)).toBe('Doing');
      expect(service['mapTaskStatus'](2)).toBe('Done');
    });

    it('should map lead status text to numbers', () => {
      expect(service['mapStatusToNumber']('New')).toBe(0);
      expect(service['mapStatusToNumber']('Qualified')).toBe(1);
      expect(service['mapStatusToNumber']('Won')).toBe(2);
      expect(service['mapStatusToNumber']('Lost')).toBe(3);
    });

    it('should map task status text to numbers', () => {
      expect(service['mapTaskStatusToNumber']('Todo')).toBe(0);
      expect(service['mapTaskStatusToNumber']('Doing')).toBe(1);
      expect(service['mapTaskStatusToNumber']('Done')).toBe(2);
    });
  });
});