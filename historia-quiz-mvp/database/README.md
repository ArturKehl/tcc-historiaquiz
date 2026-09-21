# Banco de dados

O projeto usa MySQL + Sequelize.

Crie o banco:

```sql
CREATE DATABASE historia_quiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Depois configure o `.env` e rode:

```bash
npm run seed
```

O Sequelize cria as tabelas automaticamente.
