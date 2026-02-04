import React, { useState, useEffect } from 'react';
import { GitCompare, BarChart3, Database, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/utils/api';

interface ComparisonResult {
  id: number;
  dataset1: number;
  dataset2: number;
  dataset1_name: string;
  dataset2_name: string;
  similarity_score: number;
  common_columns: string[];
  unique_columns_1: string[];
  unique_columns_2: string[];
  matching_rows: number;
}

interface Dataset {
  id: number;
  filename: string;
}

interface DatasetComparisonProps {
  datasets: Dataset[];
}

export const DatasetComparison: React.FC<DatasetComparisonProps> = ({ datasets }) => {
  const [dataset1, setDataset1] = useState<number | null>(null);
  const [dataset2, setDataset2] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!dataset1 || !dataset2) {
      alert('Please select two datasets to compare');
      return;
    }

    if (dataset1 === dataset2) {
      alert('Please select two different datasets');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/compare/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset1_id: dataset1, dataset2_id: dataset2 }),
      });
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    if (score >= 40) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-rose-600';
  };

  const getSimilarityBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getSimilarityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-8 h-8 text-green-600" />;
    if (score >= 60) return <Zap className="w-8 h-8 text-yellow-600" />;
    return <AlertCircle className="w-8 h-8 text-red-600" />;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg p-8 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
            <GitCompare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Dataset Comparison</h3>
            <p className="text-sm text-slate-500">Analyze similarities and differences</p>
          </div>
        </div>
      </div>

      {/* Selection */}
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dataset 1 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              First Dataset
            </label>
            <select
              value={dataset1 || ''}
              onChange={(e) => setDataset1(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-slate-400 transition-all appearance-none cursor-pointer font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">
                {datasets.length === 0 ? 'No datasets available' : 'Choose dataset...'}
              </option>
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  📁 {ds.filename}
                </option>
              ))}
            </select>
            {dataset1 && (
              <p className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="text-green-600">✓</span> Selected: {datasets.find(d => d.id === dataset1)?.filename}
              </p>
            )}
          </div>

          {/* Dataset 2 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-pink-600" />
              Second Dataset
            </label>
            <select
              value={dataset2 || ''}
              onChange={(e) => setDataset2(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white hover:border-slate-400 transition-all appearance-none cursor-pointer font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">
                {datasets.length === 0 ? 'No datasets available' : 'Choose dataset...'}
              </option>
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  📁 {ds.filename}
                </option>
              ))}
            </select>
            {dataset2 && (
              <p className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="text-green-600">✓</span> Selected: {datasets.find(d => d.id === dataset2)?.filename}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !dataset1 || !dataset2}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Comparing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Compare Datasets
            </span>
          )}
        </button>
      </div>

      {/* Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Similarity Score */}
          <div className={`p-8 rounded-xl border ${getSimilarityBg(comparison.similarity_score)} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Overall Similarity Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold bg-gradient-to-r ${getSimilarityColor(comparison.similarity_score)} bg-clip-text text-transparent">
                    {comparison.similarity_score.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500">match</p>
                </div>
              </div>
              <div className="flex items-center justify-center w-16 h-16">
                {getSimilarityIcon(comparison.similarity_score)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getSimilarityColor(comparison.similarity_score)}`}
                style={{ width: `${comparison.similarity_score}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Common Columns</p>
                  <p className="text-3xl font-bold text-slate-800">{comparison.common_columns.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Matching Rows</p>
                  <p className="text-3xl font-bold text-slate-800">{comparison.matching_rows}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Unique Columns</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {comparison.unique_columns_1.length + comparison.unique_columns_2.length}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Common Columns Section */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Common Columns ({comparison.common_columns.length})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {comparison.common_columns.length > 0 ? (
                comparison.common_columns.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700 border border-blue-200"
                  >
                    ✓ {col}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No common columns</p>
              )}
            </div>
          </div>

          {/* Unique Columns - Dataset 1 */}
          {comparison.unique_columns_1.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Unique to {comparison.dataset1_name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {comparison.unique_columns_1.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center bg-white px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 border border-blue-300 hover:shadow-md transition-all"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unique Columns - Dataset 2 */}
          {comparison.unique_columns_2.length > 0 && (
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200 shadow-sm">
              <h4 className="font-bold text-pink-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-pink-600" />
                Unique to {comparison.dataset2_name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {comparison.unique_columns_2.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center bg-white px-3 py-2 rounded-lg text-xs font-semibold text-pink-700 border border-pink-300 hover:shadow-md transition-all"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary Info */}
          {comparison.unique_columns_1.length === 0 && comparison.unique_columns_2.length === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Perfect Match</p>
                  <p className="text-sm text-green-600">Both datasets have identical column structures.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
