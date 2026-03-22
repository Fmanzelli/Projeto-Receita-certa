import { X, CheckCircle2, BookOpen } from 'lucide-react';

const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 p-2 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Como usar o Receita Certa</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Guia rápido para dominar a gestão da JeyFoods</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 hide-scrollbar">
          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</span>
              Cadastrar Ingredientes
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              O primeiro passo é sempre no menu <strong>Ingredientes</strong>. Cadastre a unidade exata de compra.
              <br/><span className="text-xs mt-1 block bg-gray-50 dark:bg-zinc-900/50 p-2 rounded border border-gray-100 dark:border-zinc-800/80"><strong>💡 Dica:</strong> Se 1kg (1000g) de Farinha custa R$ 5,00, o custo de 1 grama é <span className="text-gray-800 dark:text-zinc-300 font-bold">5 / 1000 = 0.005</span>. Se preferir trabalhar com KG direto, insira 5.00 e o sistema cuidará do resto!</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
              Criar Ficha Técnica (Receita)
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              No menu <strong>Receitas</strong>, crie a base do seu produto informando o Nome, Mão de Obra, a taxa % de <strong>Overhead</strong> (custos invisíveis como luz e gás) e a <strong>Margem de Lucro</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</span>
              Pesar os Ingredientes
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              Clique na Ficha Técnica recém criada e vá inserindo os ingredientes e suas quantidades necessárias. 
              <br/><span className="text-xs mt-1 block italic text-gray-500 dark:text-zinc-500">Ex: Se a Farinha foi cadastrada em Kg, para usar 250 gramas digite 0.25</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">4</span>
              Analisar a Mágica
            </h3>
            <div className="pl-10 text-gray-600 dark:text-zinc-400">
              <p className="mb-3">Na mesma tela, os 4 blocos coloridos farão a matemática do empreendedorismo sozinha:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <strong className="text-blue-600 dark:text-blue-400 block text-xs uppercase mb-1">Custo Ingr.</strong>
                  <span className="text-xs">Valor material puro da receita.</span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <strong className="text-purple-600 dark:text-purple-400 block text-xs uppercase mb-1">Overhead</strong>
                  <span className="text-xs">Porcentagem (Custo invisível).</span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <strong className="text-orange-600 dark:text-orange-400 block text-xs uppercase mb-1">Custo Total</strong>
                  <span className="text-xs">O quanto você gasta para fabricar.</span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <strong className="text-green-600 dark:text-green-400 block text-xs uppercase mb-1">Sugestão de Venda</strong>
                  <span className="text-xs">O preço para sua tabela / Goomer.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <button onClick={onClose} className="btn-primary flex items-center gap-2 py-2.5 px-6">
            <CheckCircle2 size={18} /> Entendido!
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default TutorialModal;
