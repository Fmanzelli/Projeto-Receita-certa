const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// === DICIONARIO DE FISICA E CONVERSAO UNIVERSAL ===
function normalizeUnit(unit) {
  if (!unit) return 'un';
  const u = unit.toLowerCase().trim();
  if (['g', 'gr', 'grama', 'gramas'].includes(u)) return 'g';
  if (['kg', 'kilo', 'quilo', 'kilograma', 'quilograma', 'kilogramas', 'quilogramas'].includes(u)) return 'kg';
  if (['l', 'litro', 'litros'].includes(u)) return 'l';
  if (['ml', 'mililitro', 'mililitros'].includes(u)) return 'ml';
  return 'un'; 
}

function getConvertedCost(baseCost, baseUnitRaw, usedUnitRaw) {
  const baseCostFloat = parseFloat(baseCost);
  const baseUnit = normalizeUnit(baseUnitRaw);
  const usedUnit = normalizeUnit(usedUnitRaw);
  
  if (baseUnit === usedUnit) return baseCostFloat;
  
  // Fatores multiplicadores para a fracao de preco.
  // Ex: base em kg, preco de 1 g = multiplica por 0.001.
  const map = {
    'kg_to_g': 0.001,
    'g_to_kg': 1000,
    'l_to_ml': 0.001,
    'ml_to_l': 1000,
  };
  
  const factor = map[`${baseUnit}_to_${usedUnit}`];
  if (factor) return baseCostFloat * factor;
  
  return baseCostFloat; // Fallback 1:1 se for desconhecido.
}

function toNumber(value, fallback = 0) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveLaborHours(recipe) {
  const laborTime = toNumber(recipe.labor_time);
  const laborMinutes = toNumber(recipe.labor_minutes);

  return laborTime + (laborMinutes / 60);
}

function resolveLaborCost(recipe) {
  const explicitLaborCost = toNumber(recipe.labor_cost);
  const laborRate = toNumber(recipe.labor_rate);

  return explicitLaborCost || (resolveLaborHours(recipe) * laborRate);
}

// === MOTOR RECURSIVO DE CUSTOS (BOM) ===
async function calculateBOMCost(recipe_id, user_id, connection, visitedIds = []) {
  if (visitedIds.includes(String(recipe_id))) {
    throw new Error('CircularReference');
  }
  const currentVisited = [...visitedIds, String(recipe_id)];

  // 1. Puxar Cabecalho da Receita/Sub-Receita
  const [receitas] = await connection.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [recipe_id, user_id]);
  if (receitas.length === 0) throw new Error('RecipeNotFound');
  const receita = receitas[0];

  // 2. Extrair ingredientes basicos e fichas maes/sub-fichas.
  const [ingredientesRAW] = await connection.query(`
    SELECT ri.id as relation_id, 
           ri.ingredient_id, ri.sub_recipe_id, ri.quantity, ri.unit as used_unit,
           i.cost_per_unit, i.unit as base_unit
    FROM recipe_ingredients ri
    LEFT JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = ?
  `, [recipe_id]);

  let custoIngredientes = 0;

  for (let item of ingredientesRAW) {
    let costPerUsedUnit = 0;
    
    if (item.ingredient_id) {
       costPerUsedUnit = getConvertedCost(item.cost_per_unit, item.base_unit, item.used_unit || item.base_unit);
       custoIngredientes += parseFloat(item.quantity) * costPerUsedUnit;
    } else if (item.sub_recipe_id) {
       // MAGIA OCORRE AQUI: A descida recursiva no buraco do coelho (Sub-receita dentro de Receita)
       const subData = await calculateBOMCost(item.sub_recipe_id, user_id, connection, currentVisited);
       
       // O custo base unitario da subreceita e o custo total dividido pelo rendimento fisico dela.
       const yield_qty = parseFloat(subData.yield_quantity || 1);
       const baseCostOfSub = yield_qty > 0 ? (subData.total_cost / yield_qty) : subData.total_cost;
       const baseUnitOfSub = subData.yield_unit;
       
       costPerUsedUnit = getConvertedCost(baseCostOfSub, baseUnitOfSub, item.used_unit || baseUnitOfSub);
       custoIngredientes += parseFloat(item.quantity) * costPerUsedUnit;
    }
  }

  const laborCost = resolveLaborCost(receita);
  const packagingCost = toNumber(receita.packaging_cost);
  const overhead = custoIngredientes * (toNumber(receita.overhead_percent) / 100);
  const custoFinal = custoIngredientes + laborCost + overhead + packagingCost;
  const precoVenda = custoFinal * (1 + toNumber(receita.profit_margin) / 100);

  return {
    recipe_id: receita.id,
    name: receita.name,
    yield_quantity: receita.yield_quantity,
    yield_unit: receita.yield_unit,
    ingredients_cost: custoIngredientes,
    labor_cost: laborCost,
    packaging_cost: packagingCost,
    overhead_cost: overhead,
    total_cost: custoFinal,
    suggested_price: precoVenda
  };
}

// Proteger todas as rotas deste arquivo com o usuario logado.
router.use(authenticateToken);

// Listar receitas apenas do locatario.
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipes WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar receita apenas do locatario.
router.post('/', async (req, res) => {
  try {
    const { name, labor_time, labor_minutes, labor_rate, labor_cost, overhead_percent, packaging_cost, profit_margin, yield_quantity, yield_unit, instructions } = req.body;
    const finalLaborCost = labor_cost ?? resolveLaborCost({ labor_time, labor_minutes, labor_rate });
    const [result] = await db.query(
      'INSERT INTO recipes (user_id, name, labor_time, labor_minutes, labor_rate, labor_cost, overhead_percent, packaging_cost, profit_margin, yield_quantity, yield_unit, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, labor_time || 0, labor_minutes || 0, labor_rate || 0, finalLaborCost || 0, overhead_percent || 0, packaging_cost || 0, profit_margin || 0, yield_quantity || 1, yield_unit || 'un', instructions || null]
    );
    res.status(201).json({ id: result.insertId, user_id: req.user.id, name });
  } catch (error) {
    console.error("ERRO NO POST /recipes:", error);
    res.status(500).json({ error: 'Erro ao criar receita', details: error.message || error.toString() });
  }
});

// Ver detalhes da receita (Mapeamento Unificado de Componentes e Sub-Componentes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [receitas] = await db.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (receitas.length === 0) return res.status(404).json({ error: 'Permissao restrita. Acao cancelada.' });

    const [ingredientes] = await db.query(`
      SELECT ri.id as relation_id, 
             ri.ingredient_id, i.name as ingredient_name, i.unit as ingredient_base_unit, 
             ri.sub_recipe_id, sub.name as sub_recipe_name, sub.yield_unit as sub_recipe_base_unit,
             ri.quantity, ri.unit as used_unit
      FROM recipe_ingredients ri
      LEFT JOIN ingredients i ON ri.ingredient_id = i.id
      LEFT JOIN recipes sub ON ri.sub_recipe_id = sub.id
      WHERE ri.recipe_id = ?
    `, [id]);

    // Transpila a mascara visual para o Front-End receber um item montado.
    const mapped = ingredientes.map(item => {
       if (item.ingredient_id) {
           return { relation_id: item.relation_id, is_sub: false, id: item.ingredient_id, name: item.ingredient_name, base_unit: item.ingredient_base_unit, quantity: item.quantity, used_unit: item.used_unit || item.ingredient_base_unit };
       } else {
           return { relation_id: item.relation_id, is_sub: true, id: item.sub_recipe_id, name: `[Pre-preparo] ${item.sub_recipe_name}`, base_unit: item.sub_recipe_base_unit, quantity: item.quantity, used_unit: item.used_unit || item.sub_recipe_base_unit };
       }
    });

    res.json({ ...receitas[0], ingredients: mapped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar Componente (Ingred ou SubRecipe) a uma receita
router.post('/:id/ingredients', async (req, res) => {
  try {
    const { id } = req.params; // recipe_id
    const { ingredient_id, sub_recipe_id, quantity, unit } = req.body;

    const [receitas] = await db.query('SELECT id FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (receitas.length === 0) return res.status(403).json({ error: 'Permissao restrita. Acao cancelada.' });
    
    // Evitar DeadLock Circular 1:1 (Ex: Receita A apontando p/ A)
    if (sub_recipe_id && String(sub_recipe_id) === String(id)) {
        return res.status(400).json({ error: 'Uma receita nao pode ter ela mesma como ingrediente (Loop Infinito Bloqueado O.o).' });
    }

    await db.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, sub_recipe_id, quantity, unit) VALUES (?, ?, ?, ?, ?)',
      [id, ingredient_id || null, sub_recipe_id || null, quantity, unit || null]
    );
    res.status(201).json({ message: 'Componente conectado a ficha.' });
  } catch (error) {
    console.error("ERRO NO POST /recipes/:id/ingredients:", error);
    res.status(500).json({ error: 'Erro ao conectar componente', details: error.message || error.toString() });
  }
});

// Remover ingrediente/sub-receita de uma receita
router.delete('/:id/ingredients/:relation_id', async (req, res) => {
  try {
    const { id, relation_id } = req.params;
    
    const [receitas] = await db.query('SELECT id FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (receitas.length === 0) return res.status(403).json({ error: 'Permissao restrita. Acao cancelada.' });

    await db.query('DELETE FROM recipe_ingredients WHERE id = ? AND recipe_id = ?', [relation_id, id]);
    res.json({ message: 'Componente removido da receita' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar receita matriz
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, labor_time, labor_minutes, labor_rate, labor_cost, overhead_percent, packaging_cost, profit_margin, yield_quantity, yield_unit, instructions } = req.body;
    const finalLaborCost = labor_cost ?? resolveLaborCost({ labor_time, labor_minutes, labor_rate });
    await db.query(
      'UPDATE recipes SET name = ?, labor_time = ?, labor_minutes = ?, labor_rate = ?, labor_cost = ?, overhead_percent = ?, packaging_cost = ?, profit_margin = ?, yield_quantity = ?, yield_unit = ?, instructions = ? WHERE id = ? AND user_id = ?',
      [name, labor_time || 0, labor_minutes || 0, labor_rate || 0, finalLaborCost || 0, overhead_percent || 0, packaging_cost || 0, profit_margin || 0, yield_quantity || 1, yield_unit || 'un', instructions || null, id, req.user.id]
    );
    res.json({ message: 'Receita atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar receita
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Excluida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calcular custo Mestre da receita (Agrega a cascata do Motor)
router.get('/:id/cost', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await calculateBOMCost(id, req.user.id, db);
    
    res.json({
      recipe_id: report.recipe_id,
      ingredients_cost: report.ingredients_cost.toFixed(4),
      labor_cost: report.labor_cost.toFixed(2),
      packaging_cost: report.packaging_cost.toFixed(2),
      overhead_cost: report.overhead_cost.toFixed(2),
      total_cost: report.total_cost.toFixed(4),
      suggested_price: report.suggested_price.toFixed(4)
    });
  } catch (error) {
    if(error.message === 'RecipeNotFound') return res.status(404).json({ error: 'Permissao restrita. Titulo nao existe sob sua titularidade.' });
    if(error.message === 'CircularReference') return res.status(400).json({ error: 'Loop infinito detectado! Uma receita esta tentando usar a si mesma dentro da sua cascata de pre-preparos.' });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
