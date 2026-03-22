import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Database } from 'lucide-react';
import api from '../api';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState({ name: '', unit: '', cost_per_unit: '' });
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
      setFormData({ name: '', unit: '', cost_per_unit: '' });
      fetchIngredients();
    } catch (error) {
      console.error('Erro ao salvar ingrediente', error);
    }
  };

  const handleEdit = (ing) => {
    setFormData({ name: ing.name, unit: ing.unit, cost_per_unit: ing.cost_per_unit });
    setEditingId(ing.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/ingredients/${id}`);
        fetchIngredients();
      } catch (error) {
        console.error('Erro ao excluir ingrediente', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="text-brand-600" />
            Ingredientes
          </h2>
          <p className="text-gray-400 dark:text-zinc-500 mt-1">Gerencie a matéria-prima e seus custos</p>
        </div>
      </div>

      <div className="card border-brand-100 dark:border-brand-500/20 shadow-sm border">
        <h3 className="text-lg font-semibold mb-5 text-gray-800 dark:text-zinc-200">
          {editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800/50">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Nome</label>
            <input 
              type="text" 
              required 
              className="input-field shadow-sm" 
              placeholder="Ex: Farinha de Trigo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Unidade <span className="text-[10px] font-normal lowercase">(g, ml, un)</span></label>
            <select
              required
              className="input-field shadow-sm bg-white dark:bg-zinc-900/50 cursor-pointer"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            >
              <option value="" disabled>Selecione</option>
              <option value="g">Gramas (g)</option>
              <option value="kg">Quilogramas (kg)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="l">Litros (l)</option>
              <option value="un">Unidade (un)</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Custo por Un. (R$)</label>
            <input 
              type="number" 
              step="any" 
              required 
              className="input-field shadow-sm" 
              placeholder="Ex: 3.75"
              value={formData.cost_per_unit}
              onChange={(e) => setFormData({...formData, cost_per_unit: e.target.value})}
            />
          </div>
          <div className="md:col-span-1 flex gap-2">
            <button type="submit" className="btn-primary w-full h-[42px]">
              {editingId ? 'Atualizar' : <><Plus size={18} /> Adicionar</>}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn-secondary h-[42px]"
                onClick={() => { setEditingId(null); setFormData({name: '', unit: '', cost_per_unit: ''}) }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Nome do Ingrediente</th>
                <th className="table-header">Unidade</th>
                <th className="table-header">Custo p/ Unidade</th>
                <th className="table-header text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(ing => (
                <tr key={ing.id} className="hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors group">
                  <td className="table-cell font-medium text-gray-900 dark:text-zinc-100">{ing.name}</td>
                  <td className="table-cell"><span className="bg-gray-100 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 px-2.5 py-1 rounded text-xs font-semibold border border-gray-200 dark:border-zinc-700/50">{ing.unit}</span></td>
                  <td className="table-cell font-medium text-brand-800 dark:text-brand-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(ing.cost_per_unit)}</td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(ing)} className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:border-blue-500/20" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(ing.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:border-red-500/20" title="Deletar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ingredients.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database className="text-gray-300 dark:text-zinc-700 h-8 w-8" />
                      <p>Nenhum ingrediente cadastrado ainda.</p>
                      <p className="text-sm">Comece adicionando acima.</p>
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
