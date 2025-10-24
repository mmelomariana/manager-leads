import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, catchError, of } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Não aplicar interceptor para requisições de auth
    if (req.url.includes('/auth/')) {
      return next.handle(req);
    }

    // Primeiro verifica se já tem token
    let token = localStorage.getItem('authToken');
    
    if (token && token.trim() !== '') {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }

    // Se não tem token, cria usuário demo automaticamente
    return this.createDemoUser().pipe(
      switchMap(authToken => {
        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${authToken}`)
        });
        return next.handle(cloned);
      }),
      catchError(error => {
        console.error('Erro ao criar usuário demo:', error);
        return next.handle(req); // Continua sem token em caso de erro
      })
    );
  }

  private createDemoUser(): Observable<string> {
    const demoUser = {
      name: 'Usuário Demo',
      email: 'demo@leadmanager.com', 
      password: '123456'
    };

    console.log('🔄 Criando usuário demo automaticamente...');

    // IMPORTANTE: Usar HttpClient diretamente, sem passar pelo interceptor
    return this.http.post<any>(`http://localhost:5209/api/auth/register`, demoUser, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      switchMap(response => {
        const token = response.token;
        localStorage.setItem('authToken', token);
        console.log('✅ Usuário demo criado automaticamente');
        return of(token);
      }),
      catchError(error => {
        // Se o usuário já existe, tenta fazer login
        if (error.status === 400) {
          console.log('🔄 Usuário já existe, fazendo login...');
          return this.http.post<any>(`http://localhost:5209/api/auth/login`, {
            email: demoUser.email,
            password: demoUser.password
          }, {
            headers: { 'Content-Type': 'application/json' }
          }).pipe(
            switchMap(loginResponse => {
              const token = loginResponse.token;
              localStorage.setItem('authToken', token);
              console.log('✅ Login automático realizado');
              return of(token);
            })
          );
        }
        console.error('❌ Erro no auto-auth:', error);
        throw error;
      })
    );
  }
}