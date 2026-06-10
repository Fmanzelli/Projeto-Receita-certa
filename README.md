# 🍰 Receita Certa

Sistema inteligente para cálculo de custos, precificação e gestão de fichas técnicas para confeitaria e produção de alimentos.

O Receita Certa foi desenvolvido para auxiliar confeiteiros, pequenos empreendedores e produtores alimentícios a calcularem de forma precisa seus custos de produção, margem de lucro e preço de venda, além de utilizar Inteligência Artificial para agilizar o cadastro de receitas.

---

## 🚀 Demonstração

**Frontend:** https://projeto-receita-certa.vercel.app

---

## 📋 Funcionalidades

### 👤 Autenticação

* Cadastro de usuários
* Login seguro com JWT
* Senhas criptografadas com bcrypt
* Rotas protegidas

### 🥄 Gestão de Ingredientes

* Cadastro de ingredientes
* Edição e exclusão
* Controle de unidade de medida
* Definição de custo por unidade

### 📖 Fichas Técnicas

* Criação de receitas
* Associação de ingredientes e quantidades
* Inclusão de mão de obra
* Inclusão de custos indiretos (overhead)
* Definição de margem de lucro

### 💰 Precificação Inteligente

* Cálculo automático do custo de insumos
* Cálculo de custo total da receita
* Sugestão automática de preço de venda
* Estrutura para sub-receitas

### 🤖 Inteligência Artificial (Google Gemini)

* Extração automática de receitas a partir de texto livre
* Identificação de ingredientes
* Conversão de medidas caseiras para métricas
* Criação automática de ingredientes não cadastrados
* Geração de modo de preparo estruturado

### 🛡️ Segurança

* JWT Authentication
* Hash de senhas com bcrypt
* Helmet
* CORS configurado
* Rate Limiting para proteção contra abusos

---

## 🏗️ Arquitetura

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express
* JWT
* Bcrypt
* Google Gemini API

### Banco de Dados

* MySQL
* SQL puro (sem ORM)

### Infraestrutura

* Frontend hospedado na Vercel
* Banco de dados hospedado na Railway

---

## 📁 Estrutura do Projeto

```text
Projeto-Receita-certa/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── db.js
│   └── package.json
│
└── README.md
```

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Fmanzelli/Projeto-Receita-certa.git
```

### 2. Instale as dependências

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta backend:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=receitacerta

JWT_SECRET=sua_chave_jwt

GEMINI_API_KEY=sua_chave_gemini
```

### 4. Configure o banco de dados

Execute os scripts SQL presentes no projeto para criar as tabelas necessárias.

### 5. Execute o backend

```bash
npm run dev
```

### 6. Execute o frontend

```bash
npm run dev
```

---

## 🔌 Principais Endpoints

### Autenticação

```http
POST /auth/register
POST /auth/login
```

### Ingredientes

```http
GET    /ingredients
POST   /ingredients
PUT    /ingredients/:id
DELETE /ingredients/:id
```

### Receitas

```http
GET    /recipes
POST   /recipes
PUT    /recipes/:id
DELETE /recipes/:id
```

### Inteligência Artificial

```http
POST /ai/extract-recipe
```

---

## 📚 Aprendizados Aplicados

Durante o desenvolvimento deste projeto foram aplicados conceitos de:

* Desenvolvimento Full Stack
* Arquitetura Cliente-Servidor
* APIs REST
* Autenticação JWT
* Segurança Web
* Integração com IA Generativa
* Modelagem Relacional
* Deploy de aplicações
* Tratamento de erros
* Controle de acesso por usuário

---

## 👨‍💻 Autor

Felipe Manzelli

GitHub:
https://github.com/Fmanzelli

LinkedIn:
https://www.linkedin.com/in/felipemanzelli

Deploy:
https://projeto-receita-certa.vercel.app

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e demonstração de portfólio.
