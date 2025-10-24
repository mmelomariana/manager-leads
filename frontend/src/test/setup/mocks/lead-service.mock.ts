import { of, throwError } from 'rxjs';

export class MockLeadService {
  getLead = jasmine.createSpy('getLead').and.returnValue(of({
    id: 1,
    name: 'Test Lead',
    email: 'test@example.com',
    status: 'New',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }));

  getTasks = jasmine.createSpy('getTasks').and.returnValue(of([
    {
      id: 1,
      leadId: 1,
      title: 'Test Task',
      dueDate: '2023-12-31',
      status: 'Todo',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ]));

  createTask = jasmine.createSpy('createTask').and.returnValue(of({}));
  updateTask = jasmine.createSpy('updateTask').and.returnValue(of({}));
  deleteTask = jasmine.createSpy('deleteTask').and.returnValue(of({}));
  getLeads = jasmine.createSpy('getLeads').and.returnValue(of([]));
  createLead = jasmine.createSpy('createLead').and.returnValue(of({}));
  updateLead = jasmine.createSpy('updateLead').and.returnValue(of({}));
  deleteLead = jasmine.createSpy('deleteLead').and.returnValue(of({}));

  withError() {
    this.getLead.and.returnValue(throwError(() => new Error('Test error')));
    this.getTasks.and.returnValue(throwError(() => new Error('Test error')));
    return this;
  }
}