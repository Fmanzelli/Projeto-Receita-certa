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
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Guia rápido para usar sua nova Calculadora Inteligente</p>
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
              Estoque de Ingredientes Básicos
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              No menu <strong>Ingredientes</strong>, informe coisas brutas que você compra mercado. Diga o tamanho do pacote e o preço total que o sistema cuidará do fracionamento.
              <br/><span className="text-xs mt-1 block bg-gray-50 dark:bg-zinc-900/50 p-2 rounded border border-gray-100 dark:border-zinc-800/80"><strong>💡 Exemplo:</strong> Comprou um saco de 5kg de Farinha por R$ 20,00? O sistema vai guardar que a farinha custa R$ 4,00 o quilo para usar futuramente!</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
              Criar "Bases" e Estipular o Rendimento Bruto
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              No menu <strong>Ficha Técnica (Montagem)</strong>, você precisa fornecer um <strong>Rendimento Bruto</strong>. Por exemplo, se criar uma "Massa de Empadão", avise que aquela panela rende <strong>1000 Gramas (G)</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</span>
              Super Montagem: Pré-Preparos e Conversores
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              Na caixa de adicionar Itens à sua ficha, você verá os <strong>Ingredientes Crus</strong> misturados com outras Fichas Prontas 📦 (Pré-preparos)! 
              <br/><span className="text-xs mt-1 block bg-brand-50 dark:bg-brand-500/10 p-2 rounded border border-brand-100/30 text-brand-800 dark:text-brand-300"><strong>⚖️ Conversão Mágica:</strong> Se sua farinha foi cadastrada em quilos, mas você quiser adicionar <strong>500 gramas</strong> na receita, basta digitar 500 e selecionar o selo <strong>"g"</strong> que o motor divide o peso invisivelmente.</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">4</span>
              Análise em Tempo Real (Cascata)
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              O painel <strong>Dashboard Lateral</strong> compila sua mão de obra com os ingredientes e reage ao instantâneo a cada alteração. Altere a <strong>Margem de Lucro</strong> (ex: digite 3 para Ganhar 3x) e veja o <strong>Preço Sugerido de Venda</strong> da Mão, do Pacote Único e do Rendimento piscarem em tempo real! 
            </p>
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
