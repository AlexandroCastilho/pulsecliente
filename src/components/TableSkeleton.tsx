"use client"

interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
        <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-8 py-4">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-8 py-5">
                    <div className={`h-4 bg-gray-100 rounded-lg animate-pulse ${
                      colIndex === 0 ? 'w-32' : 'w-24 mx-auto'
                    }`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
