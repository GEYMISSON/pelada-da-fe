# 🏗️ ARCHITECTURE.md

> Documento oficial da arquitetura do projeto **Pelada da Fé**.

---

# Visão Geral

O Pelada da Fé é uma aplicação Web + PWA para gerenciamento de peladas de futebol.

O sistema poderá ser utilizado tanto pelo navegador quanto instalado como aplicativo em dispositivos móveis e computadores, utilizando a mesma base de código.

---

# Objetivos

- Código organizado
- Fácil manutenção
- Escalável
- Responsivo
- Instalação como PWA
- Banco de dados online (MongoDB Atlas)

---

# Arquitetura Geral

```
Usuário
    │
    ▼
Frontend (HTML + CSS + JavaScript)
    │
    ▼
API REST (Express)
    │
    ▼
Controllers
    │
    ▼
Services
    │
    ▼
Models (Mongoose)
    │
    ▼
MongoDB Atlas
```

---

# Estrutura do Projeto

```
pelada-da-fe/

client/
│
├── assets/
│   ├── css/
│   ├── icons/
│   ├── img/
│   └── js/
│       ├── api.js
│       ├── app.js
│       ├── config.js
│       ├── utils.js
│       ├── modules/
│       └── services/
│
├── components/
│
├── views/
│
└── index.html

server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```

---

# Arquitetura Frontend

Cada tela deverá seguir o fluxo:

```
Tela
   │
   ▼
Module
   │
   ▼
Service
   │
   ▼
API
```

Nenhuma tela deverá utilizar `fetch()` diretamente.

Toda comunicação com o backend deverá passar pelos Services.

---

# Arquitetura Backend

```
Routes

↓

Controllers

↓

Services

↓

Models

↓

MongoDB
```

Cada camada possui uma responsabilidade específica:

- **Routes**: define os endpoints.
- **Controllers**: recebe a requisição e monta a resposta.
- **Services**: concentra a lógica de negócio.
- **Models**: acesso aos dados.

---

# Convenções

## Arquivos

Model

```
Jogador.js
```

Controller

```
jogadorController.js
```

Service

```
jogadorService.js
```

Route

```
jogadores.js
```

---

# Versionamento

Seguiremos Versionamento Semântico (SemVer).

Exemplos:

```
v0.1.0

v0.2.0

v0.3.0

v1.0.0
```

---

# Padrões de Código

- Código simples
- Funções pequenas
- Comentários apenas quando agregarem valor
- Evitar duplicação de código
- Reutilização de componentes

---

# Próximas Evoluções

- Autenticação
- Dashboard
- PWA
- Estatísticas
- Relatórios
- Backup
- Deploy
