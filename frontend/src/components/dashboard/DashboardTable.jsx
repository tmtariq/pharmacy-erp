export default function DashboardTable({
  title, columns, data = [], loading, emptyMessage = 'No records found', maxRows = 10
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-medium text-slate-200 mb-4">{title}</h3>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              {columns.map((col, i) => (
                <th key={col.key || i} className="pb-3 px-4 font-medium text-xs uppercase tracking-wider">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-500">{emptyMessage}</td>
              </tr>
            ) : (
              data.slice(0, maxRows).map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                  {columns.map((col, j) => (
                    <td key={col.key || j} className="py-3 px-4 text-slate-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
