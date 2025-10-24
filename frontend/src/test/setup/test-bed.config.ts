import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

// Mocks genéricos
export const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

export const mockDialog = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true)
  })
};

export const mockActivatedRoute = {
  snapshot: {
    params: { id: '1' }
  }
};

// Configuração padrão do TestBed
export const configureTestBed = (declarations: any[] = [], providers: any[] = []) => {
  TestBed.configureTestingModule({
    declarations,
    providers: [
      ...providers,
      { provide: Router, useValue: mockRouter },
      { provide: MatDialog, useValue: mockDialog }
    ]
  });
};