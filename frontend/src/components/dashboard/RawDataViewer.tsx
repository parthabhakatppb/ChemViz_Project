import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, Search, Copy, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/utils/api";

interface RawDataViewerProps {
  datasetId: number;
  filename: string;
}

export const RawDataViewer: React.FC<RawDataViewerProps> = ({ datasetId, filename }) => {
  const [rawData, setRawData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsToShow, setRowsToShow] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchRawData();
  }, [datasetId]);

  const fetchRawData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/raw-data/${datasetId}/`);
      if (!res.ok) throw new Error(`Failed to fetch data: HTTP ${res.status}`);
      
      const data = await res.json();
      setRawData(data.data || []);
      setColumns(data.columns || []);
      
      // Initially show all columns
      setVisibleColumns(new Set(data.columns || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching raw data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = rawData.filter((row) =>
    columns.some(col =>
      String(row[col]).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const displayedData = filteredData.slice(0, rowsToShow);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCell(text);
    setTimeout(() => setCopiedCell(null), 2000);
  };

  const toggleColumnVisibility = (column: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column);
    } else {
      newVisibleColumns.add(column);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const downloadCSV = () => {
    const visibleCols = Array.from(visibleColumns);
    const headers = visibleCols.join(",");
    const rows = displayedData
      .map(row =>
        visibleCols
          .map(col => {
            const val = row[col];
            const escaped = String(val).includes(",") ? `"${val}"` : val;
            return escaped;
          })
          .join(",")
      )
      .join("\n");
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raw-data-${filename}-rows-${rowsToShow}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-600 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading raw data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
        <h3 className="text-red-900 dark:text-red-100 font-bold mb-2">Error Loading Data</h3>
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (rawData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-600 text-center">
        <p className="text-slate-600 dark:text-slate-300">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">📋 Raw Data Viewer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Showing {displayedData.length} of {filteredData.length} rows
            </p>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none"
          />
        </div>

        {/* Column Visibility Toggles */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Column Visibility:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {columns.map(col => (
              <button
                key={col}
                onClick={() => toggleColumnVisibility(col)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  visibleColumns.has(col)
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600"
                }`}
              >
                {visibleColumns.has(col) ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                {col.substring(0, 15)}
              </button>
            ))}
          </div>
        </div>

        {/* Rows Display Control */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rows to display:</label>
          <select
            value={rowsToShow}
            onChange={(e) => setRowsToShow(Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 overflow-x-auto shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 w-12">#</th>
              {Array.from(visibleColumns).map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 min-w-[150px] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{idx + 1}</td>
                  {Array.from(visibleColumns).map(col => (
                    <td
                      key={`${idx}-${col}`}
                      className="px-4 py-3 text-slate-900 dark:text-slate-200 max-w-xs truncate hover:text-clip cursor-help relative group"
                      title={String(row[col])}
                    >
                      <span className="font-mono text-xs">{String(row[col]).substring(0, 50)}</span>
                      {String(row[col]).length > 50 && <span className="text-blue-600 dark:text-blue-400">...</span>}
                      
                      {/* Tooltip on hover */}
                      <div className="absolute left-0 top-full hidden group-hover:block z-50 bg-slate-900 dark:bg-slate-950 text-white dark:text-slate-100 px-3 py-2 rounded-lg text-xs max-w-xs break-words whitespace-normal mt-1 pointer-events-none">
                        {String(row[col]).substring(0, 200)}
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={expandedRow === idx ? "Collapse" : "Expand"}
                    >
                      {expandedRow === idx ? (
                        <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded Row View */}
                {expandedRow === idx && (
                  <tr className="bg-blue-50 dark:bg-blue-900/10 border-b border-slate-200 dark:border-slate-600">
                    <td colSpan={Array.from(visibleColumns).length + 2} className="px-4 py-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Row {idx + 1} Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from(visibleColumns).map(col => (
                            <div
                              key={`detail-${col}`}
                              className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600"
                            >
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                {col}
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-sm text-slate-900 dark:text-slate-200 break-all">
                                  {String(row[col])}
                                </p>
                                <button
                                  onClick={() => handleCopy(String(row[col]))}
                                  className={`p-1 rounded transition-colors flex-shrink-0 ${
                                    copiedCell === String(row[col])
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Total Rows</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{rawData.length}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Total Columns</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{columns.length}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Visible Columns</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{visibleColumns.size}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Displayed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{displayedData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default RawDataViewer;
