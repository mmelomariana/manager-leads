import { TestBed } from '@angular/core/testing';

describe('🚀 AMBIENTE DE TESTE - VERIFICAÇÃO', () => {
  
  it('✅ Jasmine está funcionando', () => {
    expect(true).toBe(true);
  });

  it('✅ Operações básicas funcionam', () => {
    expect(2 + 2).toBe(4);
    expect('hello').toContain('hell');
  });

  it('✅ Mocks do Jasmine funcionam', () => {
    const mockFn = jasmine.createSpy('mockFunction');
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});

describe('📦 MÓDULOS ANGULAR', () => {
  it('✅ TestBed está disponível', () => {
    expect(TestBed).toBeDefined();
  });
});