import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Calculator, Info, Save, ShoppingCart, Clock, Package, TrendingUp, FileText } from 'lucide-react';
import api from '../api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [baseIngredientsCost, setBaseIngredientsCost] = useState(0); // Puxado do Motor Back-end p/ Suportar a recursividade de Preços

  const [calcForm, setCalcForm] = useState({
    name: '', yield_quantity: 1, yield_unit: 'un',
    labor_time: 0, labor_rate: 0,
    overhead_percent: 0, packaging_cost: 0, profit_margin: 0,
    instructions: ''
  });
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Novo State p/ Injeção Dupla (Ingredientes Naturais e Pré-preparos) com Conversão de Unidade
  const [itemForm, setItemForm] = useState({ component_id: '', quantity: '', unit: 'g' });

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (selectedRecipe) {
      fetchRecipeDetails(selectedRecipe.id);
    }
  }, [selectedRecipe]);

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      setRecipes(response.data);
    } catch (error) {
      console.error('Erro ao buscar receitas', error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (error) {
      console.error('Erro ao buscar ingredientes', error);
    }
  };

  const fetchRecipeDetails = async (id) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      const data = response.data;

      let backendCostRaw = 0;
      try {
        const costRes = await api.get(`/recipes/${id}/cost`);
        backendCostRaw = parseFloat(costRes.data.ingredients_cost) || 0;
      } catch (err) {
        console.error("Motor de Custo Bloqueado/Falhou:", err);
      }

      setBaseIngredientsCost(backendCostRaw);
      setCalcForm({
        name: data.name || '',
        yield_quantity: data.yield_quantity || 1,
        yield_unit: data.yield_unit || 'un',
        labor_time: data.labor_time || 0,
        labor_rate: data.labor_rate || 0,
        overhead_percent: data.overhead_percent || 0,
        packaging_cost: data.packaging_cost || 0,
        profit_margin: data.profit_margin || 0,
        instructions: data.instructions || '',
      });
      setRecipeIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Erro ao montar Detalhes', error);
    }
  };

  const handleCreateNewProfile = () => {
    setSelectedRecipe(null);
    setIsCreatingNew(true);
    setCalcForm({
      name: '', yield_quantity: 1, yield_unit: 'un',
      labor_time: 0, labor_rate: 0,
      overhead_percent: 0, packaging_cost: 0, profit_margin: 0,
      instructions: ''
    });
    setRecipeIngredients([]);
    setBaseIngredientsCost(0);
  };

  const handleSaveCalculator = async (e) => {
    e.preventDefault();
    try {
      if (selectedRecipe && selectedRecipe.id) {
        await api.put(`/recipes/${selectedRecipe.id}`, calcForm);
      } else {
        const response = await api.post('/recipes', calcForm);
        setSelectedRecipe({ id: response.data.id, name: response.data.name });
      }
      setIsCreatingNew(false);
      fetchRecipes();
      alert("Receita e Cálculo Arquivados!");
    } catch (error) {
      console.error('Erro ao salvar calculos', error);
    }
  };

  const handleDeleteRecipe = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Excluir esta Receita/Pré-preparo desmontará todas as Receitas que dependem dela! Deseja prosseguir de fato?')) {
      try {
        await api.delete(`/recipes/${id}`);
        if (selectedRecipe && selectedRecipe.id === id) {
          handleCreateNewProfile();
        }
        fetchRecipes();
      } catch (error) {
        console.error('Erro ao excluir', error);
      }
    }
  };

  const handAddItem = async (e) => {
    e.preventDefault();

    // AUTO-SAVE SILENCIOSO: Se a receita ainda não existe no banco, criamos ela agora
    let recipeId = selectedRecipe?.id;
    if (!recipeId) {
      try {
        const autoName = calcForm.name || 'Receita sem nome';
        const response = await api.post('/recipes', { ...calcForm, name: autoName });
        recipeId = response.data.id;
        setSelectedRecipe({ id: recipeId, name: autoName });
        setIsCreatingNew(false);
        fetchRecipes(); // Atualiza a lista lateral
      } catch (err) {
        alert('Erro ao criar a receita automaticamente. Tente novamente.');
        return;
      }
    }

    try {
      const isSub = itemForm.component_id.startsWith('sub_');
      const realId = itemForm.component_id.split('_')[1];

      const payload = {
        ingredient_id: isSub ? null : realId,
        sub_recipe_id: isSub ? realId : null,
        quantity: itemForm.quantity,
        unit: itemForm.unit
      };

      await api.post(`/recipes/${recipeId}/ingredients`, payload);
      setItemForm({ component_id: '', quantity: '', unit: 'g' });
      fetchRecipeDetails(recipeId);
    } catch (error) {
      alert(error.response?.data?.error || 'Falha ao plugar este item na montagem.');
    }
  };

  const handleRemoveItem = async (relation_id) => {
    if (!selectedRecipe) return;
    try {
      await api.delete(`/recipes/${selectedRecipe.id}/ingredients/${relation_id}`);
      fetchRecipeDetails(selectedRecipe.id);
    } catch (error) {
      console.error('Erro ao remover', error);
    }
  };

  const handleChange = (e) => {
    setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
  };

  // UX Instantânea da Dash Integrada com Banco Real-Time Recursivo Centralizado
  const totalIngredientsCost = baseIngredientsCost;
  const laborCost = (parseFloat(calcForm.labor_time) || 0) * (parseFloat(calcForm.labor_rate) || 0);
  const overheadCost = totalIngredientsCost * ((parseFloat(calcForm.overhead_percent) || 0) / 100);
  const packagingCost = parseFloat(calcForm.packaging_cost) || 0;

  const finalCost = totalIngredientsCost + laborCost + overheadCost + packagingCost;
  const yieldAmount = parseFloat(calcForm.yield_quantity) || 1;
  const costPerServing = finalCost / yieldAmount;

  const profit = parseFloat(calcForm.profit_margin) || 0;
  let suggestedPrice = finalCost;
  if (profit > 0) {
    if (profit < 10) suggestedPrice = finalCost * profit;
    else suggestedPrice = finalCost * (1 + profit / 100);
  }
  const pricePerServing = suggestedPrice / yieldAmount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          <Calculator className="text-brand-600" />
          Ficha Técnica & Montagem
        </h2>
        <p className="text-gray-400 dark:text-zinc-500 mt-1">Calcule custo em tempo real criando Ingredientes ou Pré-preparos de forma infinita e recursiva.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Painel Esquerdo (Banco de Receitas Salvas) */}
        <div className="xl:col-span-1 space-y-4">
          <button onClick={handleCreateNewProfile} className="btn-primary w-full py-3 flex items-center justify-center gap-2 shadow-md hover:bg-brand-700 transition">
            <Plus size={20} /> Nova Ficha Isolada
          </button>

          <div className="card !p-0 overflow-hidden shadow-sm border border-brand-100/50 dark:border-brand-500/20">
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold text-gray-800 dark:text-zinc-200 text-sm uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-brand-500" /> Suas Fichas
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto bg-gray-50/30 dark:bg-zinc-900/10">
              {recipes.length === 0 ? (
                <p className="p-6 text-center text-gray-400 text-sm">Nenhuma receita/fase na base.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  {recipes.map(recipe => (
                    <li
                      key={recipe.id}
                      onClick={() => { setSelectedRecipe(recipe); setIsCreatingNew(false); }}
                      className={`p-4 cursor-pointer transition-all hover:bg-brand-50 dark:hover:bg-brand-500/10 group relative ${selectedRecipe?.id === recipe.id ? 'bg-brand-50 dark:bg-brand-500/20 shadow-inner' : ''}`}
                    >
                      <div className="pr-12 flex flex-col">
                        <div className={`font-semibold ${selectedRecipe?.id === recipe.id ? 'text-brand-800 dark:text-brand-300' : 'text-gray-900 dark:text-zinc-100'}`}>{recipe.name}</div>
                        <span className="text-[10px] uppercase text-gray-400 font-bold mt-1">Rende: {parseFloat(recipe.yield_quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {recipe.yield_unit}</span>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleDeleteRecipe(e, recipe.id)} className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Lados Central e Direito (Monitor e Dashboard) */}
        <div className="xl:col-span-3 space-y-6">
          {!isCreatingNew && !selectedRecipe ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-brand-200 dark:border-brand-500/30 rounded-2xl bg-brand-50 dark:bg-brand-500/5 xl:h-[700px]">
              <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl shadow-sm mb-5">
                <Calculator size={48} className="text-brand-400 dark:text-brand-300 opacity-80" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">Calculadora Inativa</h3>
              <p className="text-gray-400 dark:text-zinc-500 max-w-sm text-sm leading-relaxed">Crie uma nova fase de montagem no botão à esquerda para calcular seus fracionamentos.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 xl:min-h-[700px] overflow-hidden flex flex-col animate-in fade-in transition duration-300">

              {/* Header do Sistema */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-800 dark:to-brand-900 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:flex-1">
                  <label className="text-brand-100 text-[10px] uppercase tracking-wider font-semibold mb-1 block">Nome do Produto</label>
                  <input type="text" name="name" value={calcForm.name} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/50 font-semibold text-lg" placeholder="Ex: Bolo de Cenoura..." />
                </div>
                <div className="w-full md:w-auto">
                  <label className="text-brand-100 text-[10px] uppercase tracking-wider font-semibold mb-1 block text-left md:text-center">Rendimento Bruto</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" name="yield_quantity" value={calcForm.yield_quantity} onChange={handleChange} min="0.1" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white w-full md:w-24 focus:outline-none focus:ring-2 focus:ring-white/50 text-center font-bold text-lg" />
                    <select name="yield_unit" value={calcForm.yield_unit} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-bold uppercase cursor-pointer shrink-0">
                      <option className="text-gray-900 hidden" value="">Sel...</option>
                      <option className="text-gray-900 font-bold" value="un">UN</option>
                      <option className="text-gray-900 font-bold" value="g">G</option>
                      <option className="text-gray-900 font-bold" value="kg">KG</option>
                      <option className="text-gray-900 font-bold" value="ml">ML</option>
                      <option className="text-gray-900 font-bold" value="l">L</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">

                {/* Entradas */}
                <div className="space-y-8">
                  {/* Ingredientes Form e Display */}
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <ShoppingCart size={16} className="text-brand-500" /> Ingredientes
                    </h4>

                    <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-xl p-4 border border-gray-100 dark:border-zinc-800/50 mb-4">

                      {recipeIngredients.length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {recipeIngredients.map(ing => (
                            <div key={ing.relation_id} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm group">
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${ing.is_sub ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-zinc-200'}`}>{ing.name}</p>
                                <p className="text-xs text-gray-500">Uso: <span className="font-bold text-gray-700 dark:text-gray-300">{parseFloat(ing.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {ing.used_unit}</span> <span className="text-[10px] opacity-70 ml-1">(Padrão Ref: {ing.base_unit})</span></p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button onClick={() => handleRemoveItem(ing.relation_id)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-zinc-800 p-1.5 rounded opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-center text-gray-400 italic py-4">Nenhum componente vinculado.</p>
                      )}

                      {/* Novo Botão Inteligente com Conversão de Unidades Padrão */}
                      <form onSubmit={handAddItem} className="mt-4 flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-zinc-700">
                        <select required className="input-field w-full sm:flex-1 text-sm py-2 px-2" value={itemForm.component_id} onChange={(e) => setItemForm({ ...itemForm, component_id: e.target.value })}>
                          <option value="">+ Add Componente</option>
                          <optgroup label="Ingredientes Crus">
                            {ingredients.map(ing => (
                              <option key={`ing_${ing.id}`} value={`ing_${ing.id}`}>{ing.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Pré-preparos">
                            {recipes.filter(r => r.id !== selectedRecipe?.id).map(rec => (
                              <option key={`sub_${rec.id}`} value={`sub_${rec.id}`}>📦 {rec.name}</option>
                            ))}
                          </optgroup>
                        </select>
                        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <input type="number" step="0.001" required className="input-field flex-1 sm:w-16 text-sm py-2 px-1 text-center" placeholder="Qtd." value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
                          <select className="input-field w-20 sm:w-16 text-sm py-2 px-1 bg-gray-100 dark:bg-zinc-800 font-bold cursor-pointer shrink-0" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}>
                            <option value="un">un</option>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">L</option>
                          </select>
                          <button type="submit" title="Vincular à Ficha" className="bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800 px-4 rounded-lg font-bold shadow-sm transition flex items-center justify-center"><Plus size={16} /></button>
                        </div>
                      </form>
                    </div>
                  </section>

                  {/* Manual Labor e Indiretos (Omissos por Padrão) */}
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <Clock size={16} className="text-blue-500" /> Mão de Obra
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Tempo (Horas)</label>
                        <input type="number" step="0.1" name="labor_time" value={calcForm.labor_time} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30" placeholder="Ex: 1.5" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Valor Hora (R$)</label>
                        <input type="number" step="0.5" name="labor_rate" value={calcForm.labor_rate} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30" placeholder="Ex: 15.00" />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <Package size={16} className="text-orange-500" /> Indiretos
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">Custos Indiretos (%) <Info size={12} title="Gás, Luz, Água, Perdas" /></label>
                        <input type="number" step="1" name="overhead_percent" value={calcForm.overhead_percent} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30" placeholder="Ex: 20" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Embal./Extras (R$)</label>
                        <input type="number" step="0.1" name="packaging_cost" value={calcForm.packaging_cost} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30" placeholder="Ex: 3.50" />
                      </div>
                    </div>
                  </section>

                  {/* Modo de Preparo / Anotações do Chef */}
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <FileText size={16} className="text-purple-500" /> Modo de Preparo / Anotações
                    </h4>
                    <textarea
                      name="instructions"
                      value={calcForm.instructions}
                      onChange={handleChange}
                      rows={6}
                      className="input-field bg-gray-50 dark:bg-zinc-800/30 w-full resize-y min-h-[120px] leading-relaxed text-sm"
                      placeholder={"Ex:\n1. Pré-aqueça o forno a 180°C.\n2. Misture os ingredientes secos.\n3. Adicione os líquidos e bata por 3 minutos.\n4. Despeje na forma untada e leve ao forno por 35 min.\n\nOu qualquer anotação importante sobre esta receita..."}
                    />
                  </section>
                </div>

                {/* Dashboard Analítico */}
                <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-zinc-800/50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-6">
                      <TrendingUp size={16} className="text-green-500" /> Resumo Operacional
                    </h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">Total Cascata Ingred.</span>
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIngredientsCost)}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">Total Manufatura</span>
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(laborCost)}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">Despesas / Variáveis</span>
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overheadCost + packagingCost)}</span>
                      </div>
                      <div className="flex justify-between items-end bg-brand-50 dark:bg-brand-500/10 p-3 rounded-lg mt-4 shadow-sm border border-brand-100/30 dark:border-brand-500/20">
                        <span className="font-bold text-brand-800 dark:text-brand-100">CUSTO FINAL DO LOTE</span>
                        <span className="font-black text-lg text-brand-700 dark:text-brand-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalCost)}</span>
                      </div>
                    </div>

                    <div className="mt-8 mb-4">
                      <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">Marcar Lucro Global</label>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <input type="number" step="0.1" name="profit_margin" value={calcForm.profit_margin} onChange={handleChange} className="input-field text-lg font-bold w-full sm:w-32 shadow-inner" placeholder="Ex: 3" />
                        <div className="text-[10px] text-gray-400 self-start sm:self-center leading-tight">
                          Ex: <b>3</b> para Fator x3.<br />Ou <b>150</b> para 150%.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="bg-white dark:bg-zinc-900 border border-green-500/30 rounded-xl p-5 shadow-md relative overflow-hidden ring-1 ring-green-500/10 group">
                      <div className="absolute top-0 -right-8 -mt-8 bg-green-500/20 w-32 h-32 rounded-full blur-3xl group-hover:bg-green-500/30 transition-colors"></div>
                      <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-bold mb-1">Cálculo de Venda: Lote Inteiro</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedPrice)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-center shadow-sm relative overflow-hidden">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1/2">Custo de 1 {calcForm.yield_unit}</p>
                        <p className="text-lg font-bold text-gray-700 dark:text-zinc-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(costPerServing)}</p>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border border-brand-200 dark:border-brand-500/30 rounded-xl p-4 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                        <p className="text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-widest font-bold mb-1/2">Se Vender por 1 {calcForm.yield_unit}</p>
                        <p className="text-lg font-bold text-brand-700 dark:text-brand-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricePerServing)}</p>
                      </div>
                    </div>

                    <button onClick={handleSaveCalculator} className="btn-primary w-full py-4 mt-6 shadow-xl flex justify-center items-center gap-2 text-lg font-black hover:scale-[1.02] transition-transform">
                      <Save size={20} /> Gravar Custo da Etapa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
