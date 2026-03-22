import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Calculator, Info, Edit2, Save, ShoppingCart, Clock, Package, TrendingUp } from 'lucide-react';
import api from '../api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Real-time Calculator State (Instant zero-lag UX)
  const [calcForm, setCalcForm] = useState({
    name: '', yield: 1,
    labor_time: 0, labor_rate: 0,
    overhead_percent: 0, packaging_cost: 0, profit_margin: 0
  });
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [itemForm, setItemForm] = useState({ ingredient_id: '', quantity: '' });

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
      console.error('Erro', error);
    }
  };

  const fetchRecipeDetails = async (id) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      const data = response.data;
      setCalcForm({
        name: data.name || '',
        yield: data.yield || 1,
        labor_time: data.labor_time || 0,
        labor_rate: data.labor_rate || 0,
        overhead_percent: data.overhead_percent || 0,
        packaging_cost: data.packaging_cost || 0,
        profit_margin: data.profit_margin || 0,
      });
      setRecipeIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Erro', error);
    }
  };

  const handleCreateNewProfile = () => {
    setSelectedRecipe(null);
    setCalcForm({
      name: 'Nova Ficha Técnica', yield: 1,
      labor_time: 0, labor_rate: 0,
      overhead_percent: 0, packaging_cost: 0, profit_margin: 0
    });
    setRecipeIngredients([]);
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
      fetchRecipes();
      alert("Configurações da Receita Salvas!");
    } catch (error) {
      console.error('Erro', error);
    }
  };

  const handleDeleteRecipe = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta Ficha Técnica inteira?')) {
      try {
        await api.delete(`/recipes/${id}`);
        if (selectedRecipe && selectedRecipe.id === id) {
          setSelectedRecipe(null);
          setCalcForm({name:'', yield:1, labor_time:0, labor_rate:0, overhead_percent:0, packaging_cost:0, profit_margin:0});
          setRecipeIngredients([]);
        }
        fetchRecipes();
      } catch (error) {
        console.error('Erro ao excluir receita', error);
      }
    }
  };

  // Instant Add/Remove without waiting for massive re-renders
  const handAddItem = async (e) => {
    e.preventDefault();
    if (!selectedRecipe || !selectedRecipe.id) {
       alert("Salve a Ficha Técnica primeiro clicando em 'Salvar Configurações' antes de adicionar ingredientes!");
       return;
    }
    try {
      await api.post(`/recipes/${selectedRecipe.id}/ingredients`, itemForm);
      setItemForm({ ingredient_id: '', quantity: '' });
      fetchRecipeDetails(selectedRecipe.id);
    } catch (error) {
      console.error('Erro', error);
    }
  };

  const handleRemoveItem = async (relation_id) => {
    if (!selectedRecipe) return;
    try {
      await api.delete(`/recipes/${selectedRecipe.id}/ingredients/${relation_id}`);
      fetchRecipeDetails(selectedRecipe.id);
    } catch (error) {
      console.error('Erro', error);
    }
  };

  const handleChange = (e) => {
    setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
  };

  // ======================================
  // REAL-TIME MATH ENGINE (PASTRYCAL CLONE)
  // ======================================
  let totalIngredientsCost = 0;
  recipeIngredients.forEach(ing => {
    totalIngredientsCost += parseFloat(ing.quantity) * parseFloat(ing.cost_per_unit);
  });

  const laborCost = (parseFloat(calcForm.labor_time) || 0) * (parseFloat(calcForm.labor_rate) || 0);
  const overheadCost = totalIngredientsCost * ((parseFloat(calcForm.overhead_percent) || 0) / 100);
  const packagingCost = parseFloat(calcForm.packaging_cost) || 0;
  
  const finalCost = totalIngredientsCost + laborCost + overheadCost + packagingCost;
  const yieldAmount = parseInt(calcForm.yield) || 1;
  const costPerServing = finalCost / yieldAmount;

  const profit = parseFloat(calcForm.profit_margin) || 0;
  let suggestedPrice = finalCost;
  if (profit > 0) {
      if (profit < 10) { // Assume it's a multiplier (e.g. 3x)
          suggestedPrice = finalCost * profit;
      } else { // Assume it's percentage (e.g. 150%)
          suggestedPrice = finalCost * (1 + profit / 100);
      }
  }
  const pricePerServing = suggestedPrice / yieldAmount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          <Calculator className="text-brand-600" />
          Calculadora de Custos
        </h2>
        <p className="text-gray-400 dark:text-zinc-500 mt-1">Simulador em tempo real de lucratividade inspirado no formato PastryCal</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Coluna Esquerda: Banco de Receitas */}
        <div className="xl:col-span-1 space-y-4">
          <button onClick={handleCreateNewProfile} className="btn-primary w-full py-3 flex items-center justify-center gap-2 shadow-md">
            <Plus size={20} /> Nova Calculadora
          </button>

          <div className="card !p-0 overflow-hidden shadow-sm border border-brand-100/50 dark:border-brand-500/20">
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold text-gray-800 dark:text-zinc-200 text-sm uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-brand-500"/> Fichas Salvas
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto bg-gray-50/30 dark:bg-zinc-900/10">
              {recipes.length === 0 ? (
                <p className="p-6 text-center text-gray-400 text-sm">Nenhuma receita na base.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  {recipes.map(recipe => (
                    <li 
                      key={recipe.id} 
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`p-4 cursor-pointer transition-all hover:bg-brand-50 dark:hover:bg-brand-500/10 group relative ${selectedRecipe?.id === recipe.id ? 'bg-brand-50 dark:bg-brand-500/20 shadow-inner' : ''}`}
                    >
                      <div className="pr-12">
                        <div className={`font-semibold ${selectedRecipe?.id === recipe.id ? 'text-brand-800 dark:text-brand-300' : 'text-gray-900 dark:text-zinc-100'}`}>{recipe.name}</div>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Coluna Central e Direita: O Calculador */}
        <div className="xl:col-span-3 space-y-6">
          {!calcForm.name && !selectedRecipe ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-brand-200 dark:border-brand-500/30 rounded-2xl bg-brand-50 dark:bg-brand-500/5 xl:h-[700px]">
             <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl shadow-sm mb-5">
               <Calculator size={48} className="text-brand-400 dark:text-brand-300 opacity-80" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">Calculadora Inativa</h3>
             <p className="text-gray-400 dark:text-zinc-500 max-w-sm text-sm leading-relaxed">Selecione uma receita ao lado ou clique em "Nova Calculadora" para iniciar um fluxo de cálculo em tempo real.</p>
           </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 xl:min-h-[700px] overflow-hidden flex flex-col">
              
              {/* Header da Calculadora */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-800 dark:to-brand-900 p-6 text-white flex justify-between items-center">
                <div className="flex-1 mr-4">
                  <label className="text-brand-100 text-xs uppercase tracking-wider font-semibold mb-1 block">Nome do Produto</label>
                  <input type="text" name="name" value={calcForm.name} onChange={handleChange} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white w-full max-w-md focus:outline-none focus:ring-2 focus:ring-white/50 font-semibold text-lg" placeholder="Ex: Bolo de Cenoura com Cobertura..."/>
                </div>
                <div className="w-32">
                  <label className="text-brand-100 text-xs uppercase tracking-wider font-semibold mb-1 block">Rendimento</label>
                  <input type="number" name="yield" value={calcForm.yield} onChange={handleChange} min="1" className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/50 text-center font-bold text-lg"/>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                
                {/* Lado Esquerdo: Inputs de Custo */}
                <div className="space-y-8">
                  {/* Seção de Ingredientes */}
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                       <ShoppingCart size={16} className="text-brand-500"/> Ingredientes
                    </h4>
                    
                    <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-xl p-4 border border-gray-100 dark:border-zinc-800/50 mb-4">
                      
                      {recipeIngredients.length > 0 ? (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                          {recipeIngredients.map(ing => {
                            const itemCost = parseFloat(ing.quantity) * parseFloat(ing.cost_per_unit);
                            return (
                              <div key={ing.relation_id} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm group">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{ing.name}</p>
                                  <p className="text-xs text-gray-500">{ing.quantity} {ing.unit} @ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ing.cost_per_unit)}/{ing.unit}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-bold text-brand-700 dark:text-brand-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemCost)}</p>
                                  <button onClick={() => handleRemoveItem(ing.relation_id)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-transparent p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14}/>
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-center text-gray-400 italic py-4">Nenhum ingrediente adicionado ainda.</p>
                      )}

                      <form onSubmit={handAddItem} className="mt-4 flex gap-2 pt-4 border-t border-gray-200 dark:border-zinc-700">
                        <select required className="input-field flex-1 text-sm py-2" value={itemForm.ingredient_id} onChange={(e) => setItemForm({...itemForm, ingredient_id: e.target.value})}>
                          <option value="">+ Add Ingrediente</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                        <input type="number" step="0.001" required className="input-field w-20 text-sm py-2" placeholder="Qtd." value={itemForm.quantity} onChange={(e) => setItemForm({...itemForm, quantity: e.target.value})}/>
                        <button type="submit" className="bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800 px-3 rounded-lg font-bold"><Plus size={16}/></button>
                      </form>
                    </div>
                  </section>

                  {/* Seção Mão de Obra */}
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                       <Clock size={16} className="text-blue-500"/> Mão de Obra
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Tempo Produção (Horas)</label>
                        <input type="number" step="0.1" name="labor_time" value={calcForm.labor_time} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30 font-semibold" placeholder="Ex: 1.5"/>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Valor da Hora (R$)</label>
                        <input type="number" step="0.5" name="labor_rate" value={calcForm.labor_rate} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30 font-semibold" placeholder="Ex: 15.00"/>
                      </div>
                    </div>
                  </section>

                  {/* Extras */}
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                       <Package size={16} className="text-orange-500"/> Custos Indiretos
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1">Overhead (%) <Info size={12} title="Água, Luz, Gás, etc."/></label>
                        <input type="number" step="1" name="overhead_percent" value={calcForm.overhead_percent} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30 font-semibold" placeholder="Ex: 20"/>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Embalagem Fixa (R$)</label>
                        <input type="number" step="0.1" name="packaging_cost" value={calcForm.packaging_cost} onChange={handleChange} className="input-field bg-gray-50 dark:bg-zinc-800/30 font-semibold" placeholder="Ex: 3.50"/>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Lado Direito: Dashboard de Resultados (Real-Time) */}
                <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-zinc-800/50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider mb-6">
                       <TrendingUp size={16} className="text-green-500"/> Resumo de Custos
                    </h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">Total Ingredientes</span>
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIngredientsCost)}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">Total Mão de Obra</span>
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(laborCost)}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">Total Indireto + Embal.</span>
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overheadCost + packagingCost)}</span>
                      </div>
                      <div className="flex justify-between items-end bg-brand-50 dark:bg-brand-500/10 p-3 rounded-lg mt-4">
                         <span className="font-bold text-gray-800 dark:text-brand-100">CUSTO TOTAL</span>
                         <span className="font-black text-lg text-brand-700 dark:text-brand-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalCost)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 mb-4">
                       <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">Definir Lucratividade</label>
                       <div className="flex gap-2">
                          <input type="number" step="0.1" name="profit_margin" value={calcForm.profit_margin} onChange={handleChange} className="input-field text-lg font-bold w-32" placeholder="Ex: 3"/>
                          <div className="text-xs text-gray-400 self-center">
                            Digite ex: <b>3</b> para Multiplicador de 3x ou <b>150</b> para 150%
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="bg-white dark:bg-zinc-900 border-2 border-green-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500/10 w-24 h-24 rounded-full blur-2xl"></div>
                       <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-bold mb-1">Preço Sugerido (Total)</p>
                       <p className="text-3xl font-black text-gray-900 dark:text-white">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedPrice)}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Custo Unidade</p>
                          <p className="text-lg font-bold text-gray-700 dark:text-zinc-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(costPerServing)}</p>
                       </div>
                       <div className="bg-white dark:bg-zinc-900 border border-brand-200 dark:border-brand-500/30 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-widest font-bold mb-1">Venda Unidade</p>
                          <p className="text-lg font-bold text-brand-700 dark:text-brand-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricePerServing)}</p>
                       </div>
                    </div>

                    <button onClick={handleSaveCalculator} className="btn-primary w-full py-4 mt-4 shadow-lg flex justify-center items-center gap-2 text-lg">
                      <Save size={20}/> Salvar Configurações
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
