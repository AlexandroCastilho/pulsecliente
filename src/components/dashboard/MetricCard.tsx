import { AlertCircle } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: string
  subtext?: string
  icon?: React.ReactNode
  color?: string
  tooltip?: string
}

export function MetricCard({ label, value, trend, subtext, icon, color, tooltip }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${color ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
          {label}
          {tooltip && (
            <div className="group/tip relative inline-block">
              <AlertCircle size={14} className="text-red-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-xs rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 font-medium text-center shadow-xl normal-case tracking-normal">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          )}
        </h4>
        <div className={`text-3xl font-bold tracking-tight ${color || 'text-gray-900'}`}>{value}</div>
        <p className="mt-2 text-xs font-medium text-gray-600 italic">{subtext}</p>
      </div>
    </div>
  )
}
