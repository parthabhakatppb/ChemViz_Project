import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Plus, Shield, TrendingUp, Filter } from 'lucide-react';
import { apiFetch } from '@/utils/api';

interface ValidationIssue {
  column: string;
  type: string;
  issue?: string;
  missing_count?: number;
  missing_percent?: number;
  non_numeric_count?: number;
}

interface ValidationResults {
  dataset_id: number;
  filename: string;
  total_rows: number;
  validation_issues: ValidationIssue[];
  summary: {
    total_issues: number;
    affected_rows: number;
  };
}

interface DataValidationProps {
  datasetId: number;
  columns: string[];
}

export const DataValidation: React.FC<DataValidationProps> = ({ datasetId, columns }) => {
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({ column: '', type: 'required' });

  const ruleTypes = [
    { value: 'required', label: 'Required Field', icon: '📋' },
    { value: 'numeric', label: 'Numeric Values', icon: '🔢' },
    { value: 'text', label: 'Text Values', icon: '📝' },
    { value: 'unique', label: 'Unique Values', icon: '🔑' },
  ];

  const handleValidate = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/validate/${datasetId}/`);
      const data = await response.json();
      setValidationResults(data);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.column) {
      alert('Please select a column');
      return;
    }

    try {
      await apiFetch(`/validation-rules/${datasetId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_name: newRule.column,
          rule_type: newRule.type,
          rule_value: {},
        }),
      });

      setNewRule({ column: '', type: 'required' });
      handleValidate();
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const getIssueColor = (index: number) => {
    const colors = [
      'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white',
      'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white',
      'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg p-8 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Data Validation</h3>
            <p className="text-sm text-slate-500">Ensure data quality and integrity</p>
          </div>
        </div>
      </div>

      {/* Add Rule Form */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Create Validation Rule</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Select Column</label>
            <select
              value={newRule.column}
              onChange={(e) => setNewRule({ ...newRule, column: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-slate-400 transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">
                {columns.length === 0 ? 'No columns available' : 'Choose a column...'}
              </option>
              {columns && columns.length > 0 ? (
                columns.map((col) => (
                  <option key={col} value={col}>
                    📊 {col}
                  </option>
                ))
              ) : (
                <option disabled>No columns found</option>
              )}
            </select>
            {columns.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">ℹ️ Please load a dataset first</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Validation Type</label>
            <select
              value={newRule.type}
              onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-slate-400 transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              {ruleTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.icon} {rt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleCreateRule}
              disabled={!newRule.column}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Validate Button */}
      <button
        onClick={handleValidate}
        disabled={loading}
        className="w-full mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Validating...
          </span>
        ) : (
          'Run Validation'
        )}
      </button>

      {/* Results */}
      {validationResults && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total Rows</p>
                  <p className="text-4xl font-bold text-slate-800">{validationResults.total_rows}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-all ${
              validationResults.summary.total_issues === 0
                ? 'border-green-200'
                : 'border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${validationResults.summary.total_issues === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Total Issues
                  </p>
                  <p className={`text-4xl font-bold ${validationResults.summary.total_issues === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResults.summary.total_issues}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${validationResults.summary.total_issues === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {validationResults.summary.total_issues === 0 ? (
                    <CheckCircle2 className={`w-8 h-8 ${validationResults.summary.total_issues === 0 ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Issues Section */}
          {validationResults.validation_issues.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h4 className="font-bold text-slate-800">Issues Found ({validationResults.validation_issues.length})</h4>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {validationResults.validation_issues.map((issue, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${getIssueColor(idx)} transition-all hover:shadow-md`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{issue.column}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                            {issue.type}
                          </span>
                        </p>
                      </div>
                      {issue.missing_count !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">
                            {issue.missing_count} rows
                          </p>
                          <p className="text-xs text-slate-500">
                            ({issue.missing_percent}%)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {validationResults.validation_issues.length === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">All validations passed!</p>
                  <p className="text-sm text-green-600">Your data meets all quality standards.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
