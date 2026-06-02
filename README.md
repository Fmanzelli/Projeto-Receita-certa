# Projeto Receita Certa - MVP

Sistema inteligente de cálculo de custo de receitas para confeitaria, construído com **React, Vite, Tailwind CSS, Node.js, Express, MySQL (sem ORM) e IA Generativa (Google Gemini)**.

## Requisitos
- Node.js (v18+)
- MySQL Server (Rodando localmente)
- Chave API do Google Gemini (para funcionalidades de IA)

## Passo a Passo para Rodar o Projeto

### 1. Banco de Dados
1. Abra seu cliente MySQL (ex: MySQL Workbench, DBeaver, ou via terminal).
2. O usuário padrão configurado no backend é `root` e sem senha. Se você usar outra porta ou senha, edite o arquivo `backend/db.js`.
3. Execute as tabelas contidas no arquivo `backend/schema.sql` para criar o banco de dados `receitacerta` e suas tabelas (`ingredients`, `recipes` e `recipe_ingredients`).
   - *Se preferir, copie o texto do `schema.sql` e execute no workbench diretamente.*

### 2. Configuração da IA (Google Gemini)
1. Obtenha uma chave API gratuita no [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Na pasta `backend`, crie um arquivo `.env` (ou renomeie `.env.example`):
   ```
   GEMINI_API_KEY=sua_chave_api_aqui
   ```
3. A aplicação usará os modelos `gemini-2.5-flash` e `gemini-2.0-flash` com fallback automático.

### 3. Rodando o Backend (API)
1. Abra um terminal e acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
   > O servidor rodará na porta **3000** (`http://localhost:3000`).

### 4. Rodando o Frontend (Interface)
1. Abra um segundo (novo) terminal e acesse a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie a aplicação React:
   ```bash
   npm run dev
   ```
   > O frontend rodará na porta **5173**. Acesse no seu navegador através do link `http://localhost:5173`.

---

## Funcionalidades Principais
- **Ingredientes:** Cadastro, edição, listagem e exclusão com seu respectivo custo por unidade (Ex: Gramas, Unidades, MLs).
- **Fichas Técnicas (Receitas):** Criação de receitas definindo custo de mão de obra para a receita (fixo), percentual de overhead (gasto indireto percentual sobre insumos) e margem de lucro percentual.
- **Cálculo de Custo Automático:** Adição de ingredientes já na quantidade necessária da receita e cálculo imediato e inteligente do custo total de insumos e preço de venda sugerido.

## 🤖 Funcionalidades de IA (Gemini)
- **Extrator Mágico:** Envie o texto de uma receita (modo livre) e a IA extrai automaticamente:
  - Nome da receita
  - Lista de ingredientes com quantidades
  - Conversão automática de medidas caseiras (xícaras, colheres) para o sistema métrico
  - Criação automática de ingredientes no banco de dados (auto-healing)

### Endpoints de IA
- **POST** `/ai/extract-recipe` - Extrai ingredientes de um texto usando IA
  - Requer autenticação (JWT)
  - Body: `{ "text": "2 xícaras de farinha, 3 ovos, 1 xícara de leite..." }`
  - Retorna: `{ "recipeName": "...", "ingredients": [...] }`

## Arquitetura de Resiliência
- **Motor de Retry Automático:** Tenta novamente em caso de falhas na IA
- **Fallback de Modelos:** Utiliza múltiplos modelos do Gemini (2.5-flash e 2.0-flash)
- **Rate Limit Handling:** Aguarda e tenta novamente em caso de sobrecarga (HTTP 429/503)
- **Auto-Healing de Dados:** Cria automaticamente ingredientes não encontrados no banco
