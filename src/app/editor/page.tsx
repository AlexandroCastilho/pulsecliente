import { Plus, GripVertical, Settings2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SurveyEditor() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Construtor de Pesquisa</h1>
          <p className="text-slate-500 mt-1">Crie e gerencie as perguntas da sua pesquisa.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </Link>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            Salvar Pesquisa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <input 
            type="text" 
            placeholder="Título da Pesquisa..." 
            className="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 bg-transparent border-none outline-none focus:ring-0 px-0"
            defaultValue="Pesquisa de Satisfação Q4"
          />
          <input 
            type="text" 
            placeholder="Descrição opcional..." 
            className="w-full text-slate-500 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0 px-0 mt-2"
            defaultValue="Por favor, avalie sua experiência com nosso produto."
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Bloco de Pergunta */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 group hover:border-indigo-200 transition-colors flex gap-4">
          <div className="flex flex-col items-center gap-2 pt-2 text-slate-300">
            <button className="hover:text-slate-500 cursor-grab"><GripVertical className="w-5 h-5" /></button>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <input 
                type="text" 
                defaultValue="Qual a probabilidade de você nos recomendar para um amigo?" 
                className="text-lg font-semibold text-slate-800 bg-transparent border-none outline-none w-full"
              />
              <select className="ml-4 bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium">
                <option>NPS (0-10)</option>
                <option>Texto Curto</option>
                <option>Texto Longo</option>
                <option>Múltipla Escolha</option>
              </select>
            </div>
            
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-slate-500 font-medium text-sm mt-4">
              <span>0 - Muito Improvável</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <div key={n} className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-semibold text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer">{n}</div>
                ))}
              </div>
              <span>10 - Muito Provável</span>
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-slate-400 text-sm font-medium flex items-center gap-1 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"><Settings2 className="w-4 h-4" /> Configurações</button>
              <button className="text-slate-400 text-sm font-medium flex items-center gap-1 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /> Excluir</button>
            </div>
          </div>
        </div>

        <button className="w-full py-5 border-2 border-dashed border-gray-200 rounded-2xl text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 shadow-sm">
          <Plus className="w-5 h-5" />
          Adicionar Nova Pergunta
        </button>
      </div>
    </div>
  );
}
