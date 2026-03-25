const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ingredientsRoutes = require('./routes/ingredients');
const recipesRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguranças Globais
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
app.use('/auth', authLimiter, authRoutes);
app.use('/ingredients', ingredientsRoutes);
app.use('/recipes', recipesRoutes);

app.get('/', (req, res) => {
  res.send('API do Receita Certa MVP rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});
