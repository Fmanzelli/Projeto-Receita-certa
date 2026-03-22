const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Proteger todas as rotas deste arquivo com o crachá do usuário logado
router.use(authenticateToken);

// Listar todos os ingredientes Apenas do LOCATÁRIO
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ingredients WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar ingrediente Apenas do LOCATÁRIO
router.post('/', async (req, res) => {
  try {
    const { name, unit, cost_per_unit } = req.body;
    const [result] = await db.query(
      'INSERT INTO ingredients (user_id, name, unit, cost_per_unit) VALUES (?, ?, ?, ?)',
      [req.user.id, name, unit, cost_per_unit]
    );
    res.status(201).json({ id: result.insertId, user_id: req.user.id, name, unit, cost_per_unit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editar ingrediente Apenas do LOCATÁRIO
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, cost_per_unit } = req.body;
    await db.query(
      'UPDATE ingredients SET name = ?, unit = ?, cost_per_unit = ? WHERE id = ? AND user_id = ?',
      [name, unit, cost_per_unit, id, req.user.id]
    );
    res.json({ message: 'Ingrediente atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar ingrediente Apenas do LOCATÁRIO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM ingredients WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Ingrediente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
