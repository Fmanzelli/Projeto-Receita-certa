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
              Estoque de Ingredientes Inteligente
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              No menu <strong>Ingredientes</strong>, não precisa mais calcular preço fracionado de cabeça! Basta inserir o <strong>tamanho do pacote</strong> que você comprou e o <strong>preço total pago</strong>.
              <br/><span className="text-xs mt-1 block bg-gray-50 dark:bg-zinc-900/50 p-2 rounded border border-gray-100 dark:border-zinc-800/80"><strong>💡 Exemplo:</strong> Comprou um pacote de 5kg de Farinha por R$ 20,00? Digite "5", unidade "kg" e valor "20". O sistema vai calcular automaticamente que custou R$ 4,00 o quilo para usar nas receitas!</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
              Criar Nova Calculadora (Receita)
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              No menu <strong>Fichas Técnicas</strong>, clique em <strong>Nova Calculadora</strong>. Insira o nome do produto e o <strong>Rendimento</strong> (ex: quantas fatias ou unidades rende uma fornada). Em seguida, vá adicionando os ingredientes.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</span>
              Mão de Obra e Custos Invisíveis
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              Preencha quanto tempo você gastou na receita e qual o <strong>Valor da sua Hora</strong>. Adicione também a taxa de <strong>Overhead %</strong> (luz, água, aluguel) e os custos fixos com <strong>Embalagem</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-3 text-lg">
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">4</span>
              Análise em Tempo Real
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed pl-10">
              O painel <strong>Resumo de Custos</strong> na lateral direita faz toda a matemática sozinha de forma instantânea. Altere a <strong>Margem de Lucratividade</strong> (ex: digite 3 para Multiplicar 3x) e veja o <strong>Preço Sugerido de Venda</strong> piscar e atualizar na hora! 
              <br/><span className="text-xs mt-1 block italic text-brand-600 dark:text-brand-400">Não esqueça de clicar em "Salvar Configurações" no final para guardar essa Ficha.</span>
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
