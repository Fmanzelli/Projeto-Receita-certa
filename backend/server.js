require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ingredientsRoutes = require('./routes/ingredients');
const recipesRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguranças Globais
app.set('trust proxy', 1); // Essencial para o express-rate-limit funcionar no Railway/Render
app.use(helmet());
app.use(cors());
app.use(express.json());

// Limite Global (Anti-DDoS base)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Muitas requisições deste IP. Tente novamente após 15 minutos.' }
});
app.use(globalLimiter);

// Limite Estrito para Login/Cadastro (Anti-Força Bruta)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15, // Apenas 15 tentativas de entrada por hora
  message: { error: 'Muitas tentativas de Acesso/Cadastro. Conta bloqueada temporariamente (1h) por Segurança.' }
});

// Routes
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth', authRoutes);
app.use('/ingredients', ingredientsRoutes);
app.use('/recipes', recipesRoutes);
app.use('/ai', aiRoutes);

const { exec } = require('child_process');

app.get('/setup-db', (req, res) => {
  exec('node create_users_table.js && node migrate_saas.js && node migrate_bom.js && node migrate_pastrycal.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro na execução: ${error.message}`);
      return res.status(500).send(`Erro: ${error.message}`);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    res.send(`<pre>Tabelas criadas com sucesso!\n\n${stdout}</pre>`);
  });
});

app.get('/', (req, res) => {
  res.send('API do Receita Certa MVP rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});
