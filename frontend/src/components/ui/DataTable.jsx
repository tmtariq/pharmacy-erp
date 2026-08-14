import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import Skeleton from './Skeleton';

export const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  pagination = true,
  pageSize: initialPageSize = 10,
  emptyMessage = 'No matching records found',
  loading = false,
  onRowClick,
  mobileCardRender,
  renderExpandedRow,
  className = '',
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter data based on search term across all columns
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : col.key ? row[col.key] : null;
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {/* Header Controls: Search Filter & Page Info */}
      {searchable && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white p-3.5 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="w-full sm:w-72">
            <Input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              leftIcon={Search}
              size="sm"
            />
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">{filteredData.length}</span> entries
          </div>
        </div>
      )}

      {/* Main Table View (Desktop & Tablet) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white shadow-lg">
        {loading ? (
          <div className="p-6">
            <Skeleton.Table rows={5} columns={columns.length || 4} />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="w-full overflow-x-auto block">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-600">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={col.key || col.accessor || idx} className={`p-4 whitespace-nowrap ${col.className || ''}`}>
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-200 text-sm">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, rowIndex) => {
                      const expandedContent = renderExpandedRow ? renderExpandedRow(row, rowIndex) : null;
                      return (
                        <React.Fragment key={row._id || row.id || rowIndex}>
                          <tr
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`data-row transition-colors duration-150 ${
                              onRowClick ? 'cursor-pointer' : ''
                            } hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 ${
                              rowIndex % 2 === 1
                                ? 'bg-slate-950/20 dark:bg-slate-950/20 light:bg-slate-50/50'
                                : ''
                            }`}
                          >
                            {columns.map((col, colIndex) => {
                              const value = col.accessor ? row[col.accessor] : null;
                              return (
                                <td
                                  key={col.key || col.accessor || colIndex}
                                  className={`p-4 text-slate-200 dark:text-slate-200 light:text-slate-800 ${
                                    col.className || ''
                                  }`}
                                >
                                  {col.render ? col.render(row, rowIndex) : value}
                                </td>
                              );
                            })}
                          </tr>
                          {expandedContent && (
                            <tr className="bg-slate-950/80">
                              <td colSpan={columns.length || 1} className="p-0 border-l-4 border-blue-500">
                                {expandedContent}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length || 1} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                          <Inbox className="w-8 h-8 text-slate-500" />
                          <p className="text-sm font-medium">{emptyMessage}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards Fallback */}
            <div className="md:hidden divide-y divide-slate-800 dark:divide-slate-800 light:divide-slate-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) =>
                  mobileCardRender ? (
                    <div key={row._id || row.id || rowIndex} className="p-4">
                      {mobileCardRender(row, rowIndex)}
                    </div>
                  ) : (
                    <div
                      key={row._id || row.id || rowIndex}
                      onClick={() => onRowClick && onRowClick(row)}
                      className="p-4 space-y-2 hover:bg-slate-800/40"
                    >
                      {columns.map((col, colIndex) => (
                        <div
                          key={col.key || col.accessor || colIndex}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="font-semibold text-slate-400">{col.header}:</span>
                          <span className="text-slate-200">
                            {col.render
                              ? col.render(row, rowIndex)
                              : col.accessor
                              ? row[col.accessor]
                              : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">{emptyMessage}</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white p-3 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 rounded-lg px-2 py-1 border border-slate-700 outline-none cursor-pointer"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">
              Page <span className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">{currentPage}</span> of {totalPages}
            </span>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
