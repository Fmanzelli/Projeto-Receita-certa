const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// === DICIONÁRIO DE FÍSICA E CONVERSÃO UNIVERSAL ===
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
  
  // Fatores Multiplicadores para a Fração de Preço
  // Ex: Baseada em KG, eu preciso do preço de 1 G ? = Multiplico por 0.001
  const map = {
    'kg_to_g': 0.001,
    'g_to_kg': 1000,
    'l_to_ml': 0.001,
    'ml_to_l': 1000,
  };
  
  const factor = map[`${baseUnit}_to_${usedUnit}`];
  if (factor) return baseCostFloat * factor;
  
  return baseCostFloat; // Fallback 1:1 se for inidentificável
}

// === MOTOR RECURSIVO DE CUSTOS (BOM) ===
async function calculateBOMCost(recipe_id, user_id, connection) {
  // 1. Puxar Cabecalho da Receita/Sub-Receita
  const [receitas] = await connection.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [recipe_id, user_id]);
  if (receitas.length === 0) throw new Error('RecipeNotFound');
  const receita = receitas[0];

  // 2. Extrair Entranhas Matemáticas Acopladas (Ingredientes Básicos e Fichas Mães/Sub-Fichas)
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
       const subData = await calculateBOMCost(item.sub_recipe_id, user_id, connection);
       
       // O Custo Base Unitário da subreceita é tudo que custa para fabricá-la DIVIDIDO pelo próprio Rendimento Físico dela.
       const yield_qty = parseFloat(subData.yield_quantity || 1);
       const baseCostOfSub = yield_qty > 0 ? (subData.total_cost / yield_qty) : subData.total_cost;
       const baseUnitOfSub = subData.yield_unit;
       
       costPerUsedUnit = getConvertedCost(baseCostOfSub, baseUnitOfSub, item.used_unit || baseUnitOfSub);
       custoIngredientes += parseFloat(item.quantity) * costPerUsedUnit;
    }
  }

  const overhead = custoIngredientes * (parseFloat(receita.overhead_percent) / 100);
  const custoFinal = custoIngredientes + parseFloat(receita.labor_cost) + overhead;
  const precoVenda = custoFinal * (1 + parseFloat(receita.profit_margin) / 100);

  return {
    recipe_id: receita.id,
    name: receita.name,
    yield_quantity: receita.yield_quantity,
    yield_unit: receita.yield_unit,
    ingredients_cost: custoIngredientes,
    labor_cost: parseFloat(receita.labor_cost),
    overhead_cost: overhead,
    total_cost: custoFinal,
    suggested_price: precoVenda
  };
}

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
    const { name, labor_cost, overhead_percent, profit_margin, yield_quantity, yield_unit } = req.body;
    const [result] = await db.query(
      'INSERT INTO recipes (user_id, name, labor_cost, overhead_percent, profit_margin, yield_quantity, yield_unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, labor_cost || 0, overhead_percent || 0, profit_margin || 0, yield_quantity || 1, yield_unit || 'un']
    );
    res.status(201).json({ id: result.insertId, user_id: req.user.id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver detalhes da receita (Mapeamento Unificado de Componentes e Sub-Componentes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [receitas] = await db.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (receitas.length === 0) return res.status(404).json({ error: 'Permissão restrita. Ação cancelada.' });

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

    // Transpilamos a máscara visual para que o Front-End React receba apenas um item "Montado" mastigado
    const mapped = ingredientes.map(item => {
       if (item.ingredient_id) {
           return { relation_id: item.relation_id, is_sub: false, id: item.ingredient_id, name: item.ingredient_name, base_unit: item.ingredient_base_unit, quantity: item.quantity, used_unit: item.used_unit || item.ingredient_base_unit };
       } else {
           return { relation_id: item.relation_id, is_sub: true, id: item.sub_recipe_id, name: `[Pré-preparo] ${item.sub_recipe_name}`, base_unit: item.sub_recipe_base_unit, quantity: item.quantity, used_unit: item.used_unit || item.sub_recipe_base_unit };
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
    if (receitas.length === 0) return res.status(403).json({ error: 'Permissão restrita. Ação cancelada.' });
    
    // Evitar DeadLock Circular 1:1 (Ex: Receita A apontando p/ A)
    if (sub_recipe_id && String(sub_recipe_id) === String(id)) {
        return res.status(400).json({ error: 'Uma receita não pode ter ela mesma como ingrediente (Loop Infinito Bloqueado O.o).' });
    }

    await db.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, sub_recipe_id, quantity, unit) VALUES (?, ?, ?, ?, ?)',
      [id, ingredient_id || null, sub_recipe_id || null, quantity, unit || null]
    );
    res.status(201).json({ message: 'Componente conectado à ficha.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover ingrediente/sub-receita de uma receita
router.delete('/:id/ingredients/:relation_id', async (req, res) => {
  try {
    const { id, relation_id } = req.params;
    
    const [receitas] = await db.query('SELECT id FROM recipes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (receitas.length === 0) return res.status(403).json({ error: 'Permissão restrita. Ação cancelada.' });

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
    const { name, labor_cost, overhead_percent, profit_margin, yield_quantity, yield_unit } = req.body;
    await db.query(
      'UPDATE recipes SET name = ?, labor_cost = ?, overhead_percent = ?, profit_margin = ?, yield_quantity = ?, yield_unit = ? WHERE id = ? AND user_id = ?',
      [name, labor_cost || 0, overhead_percent || 0, profit_margin || 0, yield_quantity || 1, yield_unit || 'un', id, req.user.id]
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
    res.json({ message: 'Excluída com sucesso' });
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
      overhead_cost: report.overhead_cost.toFixed(2),
      total_cost: report.total_cost.toFixed(4),
      suggested_price: report.suggested_price.toFixed(4)
    });
  } catch (error) {
    if(error.message === 'RecipeNotFound') return res.status(404).json({ error: 'Permissão restrita. Título não existe sob sua titularidade.' });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
