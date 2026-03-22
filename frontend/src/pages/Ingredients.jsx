import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Database, Info } from 'lucide-react';
import api from '../api';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState({ name: '', unit: '', purchase_quantity: '', purchase_price: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (error) {
      console.error('Erro ao buscar ingredientes', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/ingredients/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post('/ingredients', formData);
      }
      setFormData({ name: '', unit: '', purchase_quantity: '', purchase_price: '' });
      fetchIngredients();
    } catch (error) {
      console.error('Erro ao salvar ingrediente', error);
      alert('Erro ao salvar o ingrediente.');
    }
  };

  const handleEdit = (ing) => {
    setFormData({ 
      name: ing.name, 
      unit: ing.unit, 
      purchase_quantity: ing.purchase_quantity || 1, 
      purchase_price: ing.purchase_price || ing.cost_per_unit || 0 
    });
    setEditingId(ing.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir? Isso removerá este ingrediente de todas as receitas vinculadas!')) {
      try {
        await api.delete(`/ingredients/${id}`);
        fetchIngredients();
      } catch (error) {
        console.error('Erro ao excluir ingrediente', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null); 
    setFormData({name: '', unit: '', purchase_quantity: '', purchase_price: ''});
  };

  // Preview the calculated cost per unit live as they type
  const currentQuantity = parseFloat(formData.purchase_quantity) || 1;
  const currentPrice = parseFloat(formData.purchase_price) || 0;
  const liveCostPerUnit = currentPrice / currentQuantity;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="text-brand-600" />
            Lista de Ingredientes (Inventário)
          </h2>
          <p className="text-gray-400 dark:text-zinc-500 mt-1">Insira os pacotes comprados e o sistema calculará o preço da grama/ml para você.</p>
        </div>
      </div>

      <div className="card border-brand-100 dark:border-brand-500/20 shadow-sm border p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-800 dark:to-brand-900 p-5 p-x-6 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {editingId ? <Edit2 size={18}/> : <Plus size={18}/>}
            {editingId ? 'Editar Compra do Ingrediente' : 'Lançar Compra de Ingrediente'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Nome da Matéria Prima</label>
              <input 
                type="text" required className="input-field shadow-sm font-semibold" 
                placeholder="Ex: Leite Integral"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Quant. do Pacote <Info className="inline mb-1" size={12} title="Ex: Se comprou 1 caixa de leite, digite 1 e selecione Litros. Se comprou pacote de farinha, digite 1 e selecione kg."/></label>
              <div className="flex gap-2">
                <input 
                  type="number" step="any" required min="0.0001" className="input-field shadow-sm w-full font-semibold text-center" 
                  placeholder="Ex: 1"
                  value={formData.purchase_quantity} onChange={(e) => setFormData({...formData, purchase_quantity: e.target.value})}
                />
                <select
                  required className="input-field shadow-sm bg-white dark:bg-zinc-900/50 cursor-pointer w-24 shrink-0 font-bold"
                  value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="" disabled>--</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">Litros</option>
                  <option value="un">und</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Preço Total Pago (R$)</label>
              <input 
                type="number" step="0.01" required className="input-field shadow-sm text-green-600 dark:text-green-400 font-bold" 
                placeholder="Ex: 5.50"
                value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
              />
              <div className="text-[10px] mt-2 font-semibold text-brand-600 dark:text-brand-400 flex justify-end">
                Custo estimado da unidade: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 4 }).format(liveCostPerUnit)}
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-2 mt-5">
              <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                {editingId ? 'Atualizar Estoque' : 'Adicionar ao Estoque'}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary py-2" onClick={cancelEdit}>Cancelar</button>
              )}
            </div>

          </div>
        </form>
      </div>

      <div className="card overflow-hidden !p-0 shadow-sm border border-gray-100 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <th className="table-header py-4 text-left px-6">Nome do Ingrediente</th>
                <th className="table-header py-4 text-center">Peso/Quant.</th>
                <th className="table-header py-4 text-right">Preço de Mercado</th>
                <th className="table-header py-4 text-right">Custo na Receita (Fração)</th>
                <th className="table-header py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {ingredients.map(ing => (
                <tr key={ing.id} className="hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors group">
                  <td className="table-cell font-bold text-gray-900 dark:text-zinc-100 px-6">{ing.name}</td>
                  <td className="table-cell text-center">
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">
                        {parseFloat(ing.purchase_quantity || 1).toString()} {ing.unit}
                    </span>
                  </td>
                  <td className="table-cell text-right font-medium text-gray-600 dark:text-zinc-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ing.purchase_price || ing.cost_per_unit || 0)}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-brand-700 dark:text-brand-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(ing.cost_per_unit)}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">por {ing.unit}</span>
                    </div>
                  </td>
                  <td className="table-cell px-6">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(ing)} className="p-1.5 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:border-blue-500/20" title="Editar Compra">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(ing.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:border-red-500/20" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ingredients.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-900/30">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Database className="text-gray-300 dark:text-zinc-700 h-10 w-10 opacity-50" />
                      <p className="font-medium text-gray-600 dark:text-zinc-400">Seu estoque está vazio.</p>
                      <p className="text-sm max-w-sm">Adicione os produtos que você comprou acima. O custo flacionado será calculado magicamente para usar nas calculadoras de receita.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
