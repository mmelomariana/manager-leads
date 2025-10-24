# 🚀 Lead Manager - CRUD de Leads e Tasks

![Angular](https://img.shields.io/badge/Angular-16+-DD0031?logo=angular&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![CSharp](https://img.shields.io/badge/C%23-8.0-239120?logo=csharp&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

Sistema completo de **gerenciamento de leads e tarefas** desenvolvido com **Angular 16+** e **.NET 8**, atendendo **100% dos requisitos obrigatórios e bônus opcionais** do desafio técnico.

---

## 🎯 Objetivo

Criar uma aplicação **Full Stack** com **CRUD de Leads e Tasks associadas**, validações, feedback visual e arquitetura limpa, avaliando clareza, organização e domínio da stack.

---

## ✅ Requisitos Atendidos

### Funcionalidades Obrigatórias
- ✅ **Listagem de Leads** com busca e filtro por status (`New`, `Qualified`, `Won`, `Lost`)  
- ✅ **CRUD completo de Leads** com validações (nome ≥ 3 caracteres e e-mail válido)  
- ✅ **CRUD completo de Tasks** associadas a cada Lead  
- ✅ **Formulários reativos** com validação e feedback visual  
- ✅ **README** com instruções de execução  

### Bônus Implementados
- ✅ **Soft Delete (IsDeleted)** em Leads e Tasks  
- ✅ **Paginação real** no backend  
- ✅ **Autenticação JWT** com guardas de rota e interceptors  
- ✅ **Criação automática de usuário demo** via interceptor  
- ✅ **Testes unitários** (xUnit no backend / Jasmine no frontend)  
- ✅ **Containerização completa** com Docker, Compose e Nginx  

---

## 🧩 Funcionalidades

### Leads
- CRUD completo (criar, listar, editar, soft delete)  
- Busca e filtros por status  
- Paginação real no backend  

### Tasks
- CRUD completo vinculado ao Lead  
- Campos: título, status (`Todo`, `Doing`, `Done`) e data de vencimento  
- Soft delete e ordenação por data  

---

## 🔐 Autenticação Automática (JWT)

O sistema possui um **interceptor inteligente** que permite testar a autenticação JWT **sem precisar se registrar manualmente**.

### 🔹 Como funciona
1. Ao acessar a aplicação pela primeira vez, o interceptor detecta que não há token JWT válido  
2. Ele **cria automaticamente um usuário demo** no backend  
3. Faz o login e armazena o token no `localStorage`  
4. Todas as requisições subsequentes passam a incluir o token automaticamente  

### 👤 Usuário Demo
```bash
Email: demo@leadmanager.com
Senha: 123456
```

---

## 🛠️ Tecnologias

**Frontend:** Angular 16+, Angular Material, RxJS, TypeScript, Jasmine/Karma  
**Backend:** .NET 8 (Web API), Entity Framework Core, JWT Authentication, xUnit, Swagger  
**Infraestrutura:** Docker, Docker Compose, Nginx (proxy reverso)

---

## 🐳 Como Executar

### 🔸 Opção 1: Docker (recomendada)
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd leadmanager-docker

# Build e execução
docker compose up --build
```

🌐 Frontend: http://localhost:4200  
🔗 Backend (Swagger): http://localhost:5209/swagger  

💡 *O sistema criará automaticamente um usuário demo para autenticação JWT.*

---

### 🔸 Opção 2: Desenvolvimento Local

#### Backend (.NET 8)
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

➡️ API: http://localhost:5209  
➡️ Swagger: http://localhost:5209/swagger  

#### Frontend (Angular)
```bash
cd frontend
npm install
npm start
```

➡️ Aplicação: http://localhost:4200  

---

## 🔌 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|-----------|-----------|
| GET | /api/leads?search=&status=&page=1&pageSize=10 | Lista Leads com filtros e paginação |
| GET | /api/leads/{id} | Retorna Lead e suas Tasks |
| POST | /api/leads | Cria novo Lead |
| PUT | /api/leads/{id} | Atualiza Lead |
| DELETE | /api/leads/{id} | Soft delete de Lead |
| GET | /api/leads/{leadId}/tasks | Lista Tasks do Lead |
| POST | /api/leads/{leadId}/tasks | Cria nova Task |
| PUT | /api/leads/{leadId}/tasks/{id} | Atualiza Task |
| DELETE | /api/leads/{leadId}/tasks/{id} | Soft delete de Task |

---

## 💻 Autor

**Mariana Melo**  
Desenvolvedora Full Stack • Angular | .NET | SQL | React Native  
https://www.linkedin.com/in/mmelomariana/

