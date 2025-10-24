# 🚀 Lead Manager - CRUD de Leads e Tasks

Sistema completo de **gerenciamento de leads e tarefas** desenvolvido com **Angular 16+** e **.NET 8**, como parte do desafio técnico da **TQS Tecnologia**.  
Inclui autenticação, testes, paginação e containerização completa via Docker.  

---

## 🎯 Objetivo

Criar uma aplicação **full stack** com **CRUD de Leads e Tasks associadas**, validações, feedback visual e arquitetura limpa.

---

## 🧱 Funcionalidades

### 🧩 Leads
- ✅ CRUD completo — criar, listar, editar e excluir  
- ✅ Filtro por status: `New`, `Qualified`, `Won`, `Lost`  
- ✅ Busca por nome ou e-mail  
- ✅ Validações: nome ≥ 3 caracteres e e-mail válido  

### 🗂️ Tasks
- ✅ CRUD completo — criar, listar, editar e excluir  
- ✅ Status: `Todo`, `Doing`, `Done`  
- ✅ Data de vencimento (opcional)  
- ✅ Associação direta com o Lead  

### 🔐 Autenticação (Bônus)
- ✅ **JWT** — autenticação segura  
- ✅ **Auto-registro** — usuário demo criado automaticamente  
- ✅ **Interceptors** — token incluso automaticamente  
- ✅ **Guarda de rotas** — acesso protegido no Angular  

### ⚙️ Outros bônus implementados
- ✅ **Soft Delete** em Leads  
- ✅ **Paginação real** no backend  
- ✅ **Testes unitários** (xUnit / Jasmine)  
- ✅ **Containerização** com Docker e Docker Compose  
- ✅ **Proxy reverso** configurado com **Nginx**

---

## 🛠️ Tecnologias

### 🖥️ Frontend
- **Angular 16+**  
- **Angular Material**  
- **RxJS**  
- **TypeScript**

### 💾 Backend
- **.NET 8 (Web API)**  
- **Entity Framework Core**  
- **SQLite**  
- **JWT**  
- **Swagger**

### ☁️ Infraestrutura
- **Docker**  
- **Docker Compose**  
- **Nginx**

---

## 🚀 Como executar

### 🐳 Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd leadmanager-docker

# Build e execução
docker compose up --build
```

🌐 **Frontend:** [http://localhost:4200](http://localhost:4200)  
🔗 **Backend (Swagger):** [http://localhost:5209/swagger](http://localhost:5209/swagger)

---

### 💻 Opção 2: Desenvolvimento local

#### Backend (.NET 8)
```bash
cd backend
dotnet restore
dotnet run
```
➡️ API disponível em: [http://localhost:5209](http://localhost:5209)

#### Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
➡️ Aplicação disponível em: [http://localhost:4200](http://localhost:4200)

---

## 🔌 Endpoints da API

### 📋 Leads
| Método | Endpoint | Descrição |
|---------|-----------|-----------|
| GET | `/api/leads?search=&status=` | Lista com filtros e paginação |
| GET | `/api/leads/{id}` | Retorna lead e suas tasks |
| POST | `/api/leads` | Cria um novo lead |
| PUT | `/api/leads/{id}` | Atualiza um lead |
| DELETE | `/api/leads/{id}` | Remove (soft delete) |

### ✅ Tasks
| Método | Endpoint | Descrição |
|---------|-----------|-----------|
| GET | `/api/leads/{leadId}/tasks` | Lista tasks do lead |
| POST | `/api/leads/{leadId}/tasks` | Cria uma task |
| PUT | `/api/leads/{leadId}/tasks/{taskId}` | Atualiza uma task |
| DELETE | `/api/leads/{leadId}/tasks/{taskId}` | Exclui uma task |

### 🔐 Autenticação
| Método | Endpoint | Descrição |
|---------|-----------|-----------|
| POST | `/api/auth/register` | Registra um usuário |
| POST | `/api/auth/login` | Login e geração de token JWT |

👤 **Usuário demo criado automaticamente:**
```
Email: demo@leadmanager.com  
Senha: 123456
```

---

## 🧪 Testes

```bash
# Backend
cd backend
dotnet test

# Frontend
cd frontend
npm test
```

---

## 🧬 Modelagem

### Lead
```csharp
public class Lead {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
```

### TaskItem
```csharp
public class TaskItem {
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string Title { get; set; } = null!;
    public DateTime? DueDate { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Lead? Lead { get; set; }
}
```

---

## 🧭 Estrutura do Projeto

```
/backend
 ├── Controllers
 ├── DTOs
 ├── Entities
 ├── Repositories
 ├── Services
 └── Program.cs

/frontend
 ├── src/app
 │    ├── core
 │    │    ├── models
 │    │    └── services
 │    ├── pages
 │    │    ├── leads
 │    │    └── lead-detail
 │    └── shared
 └── environments
```

---

## 📄 Licença

Este projeto foi desenvolvido como parte do **Desafio Técnico – Angular + .NET Core (CRUD de Leads e Tasks)** da **TQS Tecnologia**.

---
