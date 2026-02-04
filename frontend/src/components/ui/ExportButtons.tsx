import React from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import { apiFetch } from '@/utils/api';

interface ExportButtonsProps {
  datasetId: number;
  filename: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ datasetId, filename }) => {
  const handleExport = async (format: 'csv' | 'json' | 'excel' | 'pdf') => {
    try {
      const response =
        format === 'pdf'
          ? await apiFetch(`/report/${datasetId}/`)
          : await apiFetch(`/export/${datasetId}/${format}/`);
      const blob = await response.blob();
      
      const extension = format === 'excel' ? 'xlsx' : format;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'pdf' ? `${filename}-report.pdf` : `${filename}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        title="Download as CSV"
      >
        <Download className="w-4 h-4" />
        CSV
      </button>

      <button
        onClick={() => handleExport('json')}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        title="Download as JSON"
      >
        <FileJson className="w-4 h-4" />
        JSON
      </button>

      <button
        onClick={() => handleExport('excel')}
        className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
        title="Download as Excel"
      >
        <FileText className="w-4 h-4" />
        Excel
      </button>

      <button
        onClick={() => handleExport('pdf')}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm"
        title="Download PDF Report"
      >
        <FileText className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
};
