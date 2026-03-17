import { MoreHorizontal, PlayCircle } from 'lucide-react';

export function SurveyList() {
  const surveys = [
    { id: 1, title: 'NPS Trimestral Q3', status: 'Ativa', responses: 452, date: '12 Out 2026', type: 'NPS' },
    { id: 2, title: 'Feedback de Onboarding', status: 'Ativa', responses: 128, date: '10 Out 2026', type: 'Múltipla' },
    { id: 3, title: 'Pesquisa de Churn', status: 'Rascunho', responses: 0, date: '08 Out 2026', type: 'Texto' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Pesquisa</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Respostas</th>
              <th className="px-6 py-4">Criada em</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {surveys.map((survey) => (
              <tr key={survey.id} className="hover:bg-gray-50/70 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{survey.title}</span>
                    <span className="text-sm text-slate-400 mt-0.5 font-medium">{survey.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                    survey.status === 'Ativa' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {survey.status === 'Ativa' && <PlayCircle className="w-3.5 h-3.5 mr-1" />}
                    {survey.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 font-semibold">
                  {survey.responses}
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                  {survey.date}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white border hover:border-gray-200 border-transparent rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm hover:shadow">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
