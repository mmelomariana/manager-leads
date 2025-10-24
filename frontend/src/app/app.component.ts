import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  ngOnInit() {
    this.autoRegister();
  }

  autoRegister() {
    // Verifica se já tem token
    if (!localStorage.getItem('auth_token')) {
      console.log('🔐 Criando usuário automático...');
      
      fetch('http://localhost:5209/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Demo User',
          email: 'demo@leadmanager.com',
          password: '123456'
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          console.log('✅ Usuário demo criado e token salvo automaticamente');
        }
      })
      .catch(error => {
        // Se der erro (usuário já existe), tenta fazer login
        console.log('🔄 Usuário já existe, tentando login...');
        this.autoLogin();
      });
    }
  }

  autoLogin() {
    fetch('http://localhost:5209/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@leadmanager.com',
        password: '123456'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('✅ Logado com sucesso!');
      }
    })
    .catch(error => console.error('Erro no login automático:', error));
  }
}