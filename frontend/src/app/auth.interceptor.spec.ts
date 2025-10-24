import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const testUrl = '/api/test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('when token exists', () => {
    const mockToken = 'mock-jwt-token-12345';

    beforeEach(() => {
      localStorage.setItem('auth_token', mockToken);
    });

    it('should add Authorization header with Bearer token', () => {
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('GET');
    });

    it('should add token to POST requests', () => {
      const testData = { name: 'Test' };
      
      httpClient.post(testUrl, testData).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(testData);
    });

    it('should add token to PUT requests', () => {
      const testData = { name: 'Test' };
      
      httpClient.put(testUrl, testData).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('PUT');
    });

    it('should add token to DELETE requests', () => {
      httpClient.delete(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('DELETE');
    });
  });

  describe('when token does not exist', () => {
    it('should not add Authorization header when no token', () => {
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeFalse();
      expect(req.request.method).toBe('GET');
    });

    it('should not add Authorization header when token is empty string', () => {
      localStorage.setItem('auth_token', '');
      
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeFalse();
    });

    it('should not add Authorization header when token is only whitespace', () => {
      localStorage.setItem('auth_token', '   ');
      
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeFalse();
    });
  });

  describe('token validation', () => {
    it('should handle token with special characters', () => {
      const specialToken = 'token-with-special-chars!@#$%^&*()';
      localStorage.setItem('auth_token', specialToken);
      
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${specialToken}`);
    });

    it('should handle very long token', () => {
      const longToken = 'a'.repeat(1000);
      localStorage.setItem('auth_token', longToken);
      
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${longToken}`);
    });
  });

  describe('request cloning', () => {
    it('should preserve original request headers', () => {
      localStorage.setItem('auth_token', 'test-token');
      
      httpClient.get(testUrl, {
        headers: { 'Custom-Header': 'custom-value' }
      }).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.has('Custom-Header')).toBeTrue();
      expect(req.request.headers.get('Custom-Header')).toBe('custom-value');
    });

    it('should preserve original request body', () => {
      localStorage.setItem('auth_token', 'test-token');
      const requestBody = { id: 1, data: 'test' };
      
      httpClient.post(testUrl, requestBody).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.body).toEqual(requestBody);
    });

    it('should preserve original request URL and method', () => {
      localStorage.setItem('auth_token', 'test-token');
      
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      
      expect(req.request.url).toBe(testUrl);
      expect(req.request.method).toBe('GET');
    });
  });
});