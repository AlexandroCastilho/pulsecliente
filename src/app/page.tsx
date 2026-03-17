import { MetricCard } from '@/components/MetricCard';
import { SurveyList } from '@/components/SurveyList';
import { Activity, BarChart2, Mail, Users } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Acompanhe as métricas e campanhas ativas.</p>
        </div>
        <Link href="/editor" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm inline-flex items-center gap-2">
          Nova Pesquisa
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="NPS Atual" value="72" trend="+5%" trendUp icon={<Activity className="text-indigo-600 w-5 h-5"/>} />
        <MetricCard title="Taxa de Resposta" value="34.2%" trend="-1.2%" trendUp={false} icon={<BarChart2 className="text-emerald-600 w-5 h-5"/>} />
        <MetricCard title="Total de Envios" value="12.450" trend="+12%" trendUp icon={<Mail className="text-blue-600 w-5 h-5"/>} />
        <MetricCard title="Clientes Ativos" value="3.102" trend="+8%" trendUp icon={<Users className="text-purple-600 w-5 h-5"/>} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-5 tracking-tight">Pesquisas Recentes</h2>
        <SurveyList />
      </div>
    </div>
  );
}
