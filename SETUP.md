# ⚽ Pelada da Fé

Sistema para gerenciamento de peladas de futebol.

---

# 🚀 Configuração do Ambiente

## Requisitos

Instale os seguintes programas:

| Programa | Versão Recomendada |
|----------|--------------------|
| Node.js | LTS |
| Git | Última versão |
| Visual Studio Code | Última versão |
| Google Chrome | Última versão |
| MongoDB Compass *(Opcional)* | Última versão |

---

# Clonar o Projeto

```bash
git clone https://github.com/GEYMISSON/pelada-da-fe.git
```

Entrar na pasta:

```bash
cd pelada-da-fe
```

---

# Instalar Dependências

```bash
npm install
```

---

# Arquivo .env

Criar um arquivo chamado:

```text
.env
```

Conteúdo:

```env
PORT=3000

MONGO_URI=mongodb+srv://USUARIO:SENHA@SERVIDOR/pelada_da_fe?retryWrites=true&w=majority
```

⚠ Nunca envie este arquivo para o GitHub.

---

# Executar o Projeto

Modo Desenvolvimento

```bash
npm run dev
```

Modo Produção

```bash
npm start
```

Abrir no navegador:

```
http://localhost:3000
```

---

# Estrutura do Projeto

```
pelada-da-fe/

│

├── client/

│   ├── assets/

│   │   ├── css/

│   │   ├── img/

│   │   └── js/

│   │

│   ├── views/

│   │

│   └── index.html

│

├── server/

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── models/

│   ├── routes/

│   ├── services/

│   ├── app.js

│   └── server.js

│

├── .env

├── package.json

└── README.md
```

---

# Dependências

Instalar automaticamente:

```bash
npm install
```

Caso necessário:

```bash
npm install express
npm install mongoose
npm install cors
npm install dotenv
```

Dependência de desenvolvimento

```bash
npm install -D nodemon
```

---

# Scripts

Executar

```bash
npm start
```

Desenvolvimento

```bash
npm run dev
```

---

# Git

Verificar alterações

```bash
git status
```

Adicionar arquivos

```bash
git add .
```

Criar Commit

```bash
git commit -m "Mensagem"
```

Enviar

```bash
git push
```

Baixar alterações

```bash
git pull
```

---

# Extensões VS Code

✔ Material Icon Theme

✔ Prettier

✔ ESLint

✔ GitLens

✔ Error Lens

✔ DotENV

✔ Thunder Client

✔ Auto Rename Tag

✔ Auto Close Tag

✔ Path Intellisense

---

# Bibliotecas Front-end

Bootstrap

SweetAlert2

Toastify

Flatpickr

---

# Banco de Dados

MongoDB Atlas

Coleção:

- jogadores
- peladas
- partidas

---

# Roadmap

## Sprint 1

- Cadastro de Jogadores

## Sprint 2

- Cadastro de Peladas

## Sprint 3

- Sorteio Automático

## Sprint 4

- Partidas

## Sprint 5

- Artilharia

## Sprint 6

- Estatísticas

## Sprint 7

- Aplicativo PWA

---

# Convenção de Commits

Nova funcionalidade

```
feat:
```

Correção

```
fix:
```

Melhoria

```
refactor:
```

Documentação

```
docs:
```

Estilo

```
style:
```

---

# Versões

## v0.1.0

- Estrutura inicial

## v0.2.0

- Cadastro de jogadores

## v0.3.0

- Cadastro de peladas

## v0.4.0

- Sorteio automático

---

Desenvolvido para o projeto **Pelada da Fé** ⚽