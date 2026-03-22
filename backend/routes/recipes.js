const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Proteger todas as rotas deste arquivo com o crachá do usuário logado
router.use(authenticateToken);

// Listar receitas Apenas do LOCATÁRIO
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipes WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar receita Apenas do LOCATÁRIO
router.post('/', async (req, res) => {
  try {
    const { name, labor_cost, overhead_percent, profit_margin, yield: recipe_yield, labor_time, labor_rate, packaging_cost } = req.body;
    const [result] = await db.query(
      'INSERT INTO recipes (user_id, name, `yield`, labor_time, labor_rate, labor_cost, overhead_percent, profit_margin, packaging_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, recipe_yield || 1, labor_time || 0, labor_rate || 0, labor_cost || 0, overhead_percent || 0, profit_margin || 0, packaging_cost || 0]
    );
    res.status(201).json({ id: result.insertId, user_id: req.user.id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver detalhes da receita Apenas do LOCATÁRIO
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [receitas] = await db.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (receitas.length === 0) {
      return res.status(404).json({ error: 'Receita não encontrada ou você não possui permissão de acesso.' });
    }

    const [ingredientes] = await db.query(`
      SELECT ri.id as relation_id, i.id as ingredient_id, i.name, i.unit, i.cost_per_unit, ri.quantity
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
    `, [id]);

    res.json({ ...receitas[0], ingredients: ingredientes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar ingrediente a uma receita Apenas do LOCATÁRIO
router.post('/:id/ingredients', async (req, res) => {
  try {
    const { id } = req.params; // recipe_id
    const { ingredient_id, quantity } = req.body;

    const [receitas] = await db.query('SELECT id FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (receitas.length === 0) return res.status(403).json({ error: 'Permissão restrita. Ação cancelada.' });

    await db.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
      [id, ingredient_id, quantity]
    );
    res.status(201).json({ message: 'Ingrediente adicionado à receita' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover ingrediente de uma receita Apenas do LOCATÁRIO
router.delete('/:id/ingredients/:relation_id', async (req, res) => {
  try {
    const { id, relation_id } = req.params;
    
    const [receitas] = await db.query('SELECT id FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (receitas.length === 0) return res.status(403).json({ error: 'Permissão restrita. Ação cancelada pelo SaaS.' });

    await db.query('DELETE FROM recipe_ingredients WHERE id = ? AND recipe_id = ?', [relation_id, id]);
    res.json({ message: 'Ingrediente removido da receita' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar receita Apenas do LOCATÁRIO
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, labor_cost, overhead_percent, profit_margin, yield: recipe_yield, labor_time, labor_rate, packaging_cost } = req.body;
    await db.query(
      'UPDATE recipes SET name = ?, `yield` = ?, labor_time = ?, labor_rate = ?, labor_cost = ?, overhead_percent = ?, profit_margin = ?, packaging_cost = ? WHERE id = ? AND user_id = ?',
      [name, recipe_yield || 1, labor_time || 0, labor_rate || 0, labor_cost || 0, overhead_percent || 0, profit_margin || 0, packaging_cost || 0, id, req.user.id]
    );
    res.json({ message: 'Receita atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar receita Apenas do LOCATÁRIO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Receita excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calcular custo da receita Apenas do LOCATÁRIO (Para histórico fixo ou double check do backend)
router.get('/:id/cost', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar propriedade do Locatário
    const [receitas] = await db.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (receitas.length === 0) return res.status(404).json({ error: 'Receita não encontrada' });
    const receita = receitas[0];

    const [ingredientes] = await db.query(`
      SELECT i.cost_per_unit, ri.quantity
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
    `, [id]);

    let custoIngredientes = 0;
    ingredientes.forEach(item => {
      custoIngredientes += parseFloat(item.quantity) * parseFloat(item.cost_per_unit);
    });

    const tempoHoras = parseFloat(receita.labor_time) || 0;
    const valorHora = parseFloat(receita.labor_rate) || 0;
    const maoDeObra = (tempoHoras * valorHora) || parseFloat(receita.labor_cost) || 0;

    const custoEmbalagem = parseFloat(receita.packaging_cost) || 0;
    const overhead = custoIngredientes * (parseFloat(receita.overhead_percent) / 100);
    const custoFinal = custoIngredientes + maoDeObra + overhead + custoEmbalagem;
    
    const fatorLucro = parseFloat(receita.profit_margin) || 1;
    // se profit_margin for ex: 3.5, preco = custoFinal * 3.5. 
    // ou se mantiver em %, preco = custoFinal * (1 + lucro/100).
    // O frontend novo lidará com isso com o React State, mas vamos usar a lógica clássica se > 10
    let precoVenda = custoFinal * (1 + fatorLucro / 100);
    if (fatorLucro < 10 && fatorLucro > 0) { // assumimos q fator multiplier, ex: 3
        precoVenda = custoFinal * fatorLucro;
    } else if (fatorLucro === 0) {
        precoVenda = custoFinal;
    }

    const rendimento = parseInt(receita.yield) || 1;
    const custoPorcao = custoFinal / rendimento;
    const precoPorcao = precoVenda / rendimento;

    res.json({
      recipe_id: id,
      yield: rendimento,
      ingredients_cost: custoIngredientes.toFixed(2),
      labor_cost: maoDeObra.toFixed(2),
      overhead_cost: overhead.toFixed(2),
      packaging_cost: custoEmbalagem.toFixed(2),
      total_cost: custoFinal.toFixed(2),
      cost_per_serving: custoPorcao.toFixed(2),
      suggested_price: precoVenda.toFixed(2),
      suggested_price_per_serving: precoPorcao.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
