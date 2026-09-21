# História Quiz

MVP de uma plataforma web de aprendizagem de História para estudantes do Ensino Médio.

## Stack

- Node.js + Express
- Sequelize ORM
- MySQL
- JWT + bcrypt
- HTML/CSS/JavaScript no frontend
- API REST

## Funcionalidades do MVP

### Aluno
- Cadastro e login
- Dashboard
- Lista de quizzes
- Realização de quiz
- Correção com explicação
- Pontos e XP
- Níveis
- Conquistas
- Ranking geral/turma
- Histórico

### Professor
- Login
- Dashboard com estatísticas
- CRUD de perguntas
- CRUD de quizzes
- Visualização de alunos
- Relatórios básicos

## Como executar

### 1. Criar o banco

No MySQL:

```sql
CREATE DATABASE historia_quiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar ambiente

Copie `.env.example` para `.env` e preencha os dados do MySQL.

### 3. Instalar

```bash
npm install
```

### 4. Criar tabelas e dados de demonstração

```bash
npm run seed
```

O seed cria:
- 1 professor
- 10 alunos
- 3 turmas
- 30 perguntas
- 5 quizzes
- 10 conquistas

Contas de demonstração:

Professor:
- email: professor@historiaquiz.com
- senha: 123456

Aluno:
- email: aluno1@historiaquiz.com
- senha: 123456

### 5. Executar

```bash
npm start
```

Abra:

http://localhost:3000

## Estrutura

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    server.js
    seed.js

frontend/
  index.html
  app.js
  styles.css
database/
  README.md
```

## Observação

Este é um MVP acadêmico. Antes de produção real, adicione HTTPS, recuperação de senha por e-mail, rate limiting, logs, validação mais rígida, migrations e política de privacidade.
