import React from 'react';
import { AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

interface DataQualityProps {
  dataQuality: {
    total_cells: number;
    empty_cells: number;
    completeness_percent: number;
    duplicate_rows: number;
    duplicate_percent: number;
    numeric_columns: number;
    text_columns: number;
    quality_score: number;
    columns_with_issues: Record<string, string>;
  };
}

export const DataQualityReport: React.FC<DataQualityProps> = ({ dataQuality }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold">Data Quality Report</h3>
      </div>

      {/* Quality Score */}
      <div className={`${getScoreBgColor(dataQuality.quality_score)} p-4 rounded-lg mb-6`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Overall Quality Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(dataQuality.quality_score)}`}>
            {dataQuality.quality_score.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Completeness</p>
          <p className="text-2xl font-bold text-blue-600">{dataQuality.completeness_percent.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">{dataQuality.empty_cells} empty cells</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Duplicates</p>
          <p className="text-2xl font-bold text-orange-600">{dataQuality.duplicate_percent.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">{dataQuality.duplicate_rows} duplicate rows</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Numeric Columns</p>
          <p className="text-2xl font-bold">{dataQuality.numeric_columns}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Text Columns</p>
          <p className="text-2xl font-bold">{dataQuality.text_columns}</p>
        </div>
      </div>

      {/* Issues */}
      {Object.keys(dataQuality.columns_with_issues).length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold">Columns with Issues</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(dataQuality.columns_with_issues).map(([column, issue]) => (
              <div key={column} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm font-medium">{column}</span>
                <span className="text-xs text-red-600">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(dataQuality.columns_with_issues).length === 0 && (
        <div className="border-t pt-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600">No data quality issues detected!</p>
        </div>
      )}
    </div>
  );
};
