const express = require('express');
const cors = require('cors');
const ingredientsRoutes = require('./routes/ingredients');
const recipesRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/ingredients', ingredientsRoutes);
app.use('/recipes', recipesRoutes);

app.get('/', (req, res) => {
  res.send('API do Receita Certa MVP rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});
