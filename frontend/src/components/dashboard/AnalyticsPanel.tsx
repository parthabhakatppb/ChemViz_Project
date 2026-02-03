import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, ComposedChart, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface AnalyticsPanelProps {
  data: any;
}

// Unified Color Palette with High Contrast
const COLORS = ['#2563eb', '#3b82f6', '#0ea5e9', '#38bdf8', '#22d3ee', '#1d4ed8', '#60a5fa', '#0891b2', '#0284c7', '#7dd3fc'];
const THEME = {
  light: {
    bg: 'bg-white',
    bgAlt: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-900',
    textMuted: 'text-slate-600',
    textLight: 'text-slate-500',
    shadow: 'shadow-md hover:shadow-lg',
  },
  dark: {
    bg: 'dark:bg-slate-800',
    bgAlt: 'dark:bg-slate-700',
    border: 'dark:border-slate-600',
    text: 'dark:text-white',
    textMuted: 'dark:text-slate-300',
    textLight: 'dark:text-slate-400',
    shadow: 'dark:shadow-lg',
  }
};

// High Contrast Color Cards
const CARD_COLORS = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/40', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-900 dark:text-blue-100', accent: 'text-blue-700 dark:text-blue-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/40', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-900 dark:text-purple-100', accent: 'text-purple-700 dark:text-purple-300' },
  green: { bg: 'bg-green-50 dark:bg-green-900/40', border: 'border-green-200 dark:border-green-700', text: 'text-green-900 dark:text-green-100', accent: 'text-green-700 dark:text-green-300' },
  red: { bg: 'bg-red-50 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-700', text: 'text-red-900 dark:text-red-100', accent: 'text-red-700 dark:text-red-300' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/40', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-900 dark:text-yellow-100', accent: 'text-yellow-700 dark:text-yellow-300' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/40', border: 'border-cyan-200 dark:border-cyan-700', text: 'text-cyan-900 dark:text-cyan-100', accent: 'text-cyan-700 dark:text-cyan-300' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/40', border: 'border-indigo-200 dark:border-indigo-700', text: 'text-indigo-900 dark:text-indigo-100', accent: 'text-indigo-700 dark:text-indigo-300' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/40', border: 'border-pink-200 dark:border-pink-700', text: 'text-pink-900 dark:text-pink-100', accent: 'text-pink-700 dark:text-pink-300' },
};

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data }) => {
  if (!data) return null;

  const renderDataVolumeChart = () => {
    const volumeData = [
      { name: 'Rows', value: data.row_count },
      { name: 'Columns', value: data.column_count },
    ];

    return (
      <div className={`${THEME.light.bg} ${THEME.dark.bg} rounded-xl p-6 mb-6 border ${THEME.light.border} ${THEME.dark.border} ${THEME.light.shadow} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${THEME.light.text} ${THEME.dark.text}`}>📊 Dataset Overview</h3>
            <p className={`text-sm ${THEME.light.textMuted} ${THEME.dark.textMuted} mt-1`}>Complete dataset statistics and composition</p>
          </div>
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${THEME.light.bgAlt} ${THEME.dark.bgAlt} rounded-lg p-4 border ${THEME.light.border} ${THEME.dark.border}`}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2563eb', '#0ea5e9'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className={`${CARD_COLORS.blue.bg} border-l-4 border-l-blue-600 ${CARD_COLORS.blue.border} rounded-lg p-4 hover:shadow-md transition-all duration-300`}>
              <div className={`text-sm font-semibold ${CARD_COLORS.blue.accent}`}>Total Records</div>
              <div className={`text-4xl font-bold text-blue-700 dark:text-blue-300 mt-1`}>{data.row_count.toLocaleString()}</div>
              <div className={`text-xs ${CARD_COLORS.blue.accent} mt-2`}>rows of data</div>
            </div>
            <div className={`${CARD_COLORS.purple.bg} border-l-4 border-l-purple-600 ${CARD_COLORS.purple.border} rounded-lg p-4 hover:shadow-md transition-all duration-300`}>
              <div className={`text-sm font-semibold ${CARD_COLORS.purple.accent}`}>Total Features</div>
              <div className={`text-4xl font-bold text-purple-700 dark:text-purple-300 mt-1`}>{data.column_count}</div>
              <div className={`text-xs ${CARD_COLORS.purple.accent} mt-2`}>columns/attributes</div>
            </div>
            <div className={`${CARD_COLORS.green.bg} border-l-4 border-l-green-600 ${CARD_COLORS.green.border} rounded-lg p-4 hover:shadow-md transition-all duration-300`}>
              <div className={`text-sm font-semibold ${CARD_COLORS.green.accent}`}>Total Cells</div>
              <div className={`text-4xl font-bold text-green-700 dark:text-green-300 mt-1`}>{(data.row_count * data.column_count).toLocaleString()}</div>
              <div className={`text-xs ${CARD_COLORS.green.accent} mt-2`}>data points</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDataQualityOverview = () => {
    if (!data.data_quality) return null;
    const dq = data.data_quality;
    
    const qualityData = [
      { name: 'Complete', value: dq.total_cells - dq.missing_cells },
      { name: 'Missing', value: dq.missing_cells }
    ];

    const completenessScore = ((dq.total_cells - dq.missing_cells) / dq.total_cells) * 100;

    return (
      <div className={`${THEME.light.bg} ${THEME.dark.bg} rounded-xl p-6 mb-6 border ${THEME.light.border} ${THEME.dark.border} ${THEME.light.shadow} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${THEME.light.text} ${THEME.dark.text}`}>✓ Data Quality Overview</h3>
            <p className={`text-sm ${THEME.light.textMuted} ${THEME.dark.textMuted} mt-1`}>Completeness and data integrity metrics</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={qualityData} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444'][index % 2]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="text-xs font-semibold text-blue-700 uppercase">Total Cells</div>
              <div className="text-2xl font-bold text-blue-600">{(dq.total_cells).toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="text-xs font-semibold text-green-700 uppercase">Complete</div>
              <div className="text-2xl font-bold text-green-500">{(dq.total_cells - dq.missing_cells).toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="text-xs font-semibold text-red-700 uppercase">Missing</div>
              <div className="text-2xl font-bold text-red-500">{dq.missing_cells}</div>
              <div className="text-xs text-red-500 mt-1">{dq.missing_percentage?.toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="text-xs font-semibold text-yellow-700 uppercase">Duplicates</div>
              <div className="text-2xl font-bold text-yellow-500">{dq.duplicate_rows}</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Missing by Column
            </h4>
            <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(dq.missing_by_column || {})
                .filter(([_, count]: [string, any]) => count > 0)
                .sort((a, b) => (b[1] as any) - (a[1] as any))
                .map(([col, count]: [string, any]) => (
                <div key={col} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded transition-all">
                  <span className="truncate text-slate-700 font-medium">{col}</span>
                  <span className="text-red-500 font-bold ml-2 text-lg">{count}</span>
                </div>
              ))}
              {Object.values(dq.missing_by_column || {}).every((v: any) => v === 0) && (
                <div className="text-center py-4 text-green-600 font-semibold">✓ No missing values</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatisticalAnalysis = () => {
    if (!data.statistical_analysis) return null;
    
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">📈 Statistical Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">Detailed statistical metrics for all columns</p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.statistical_analysis).map(([col, stats]: [string, any]) => (
            <div key={col} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-purple-300">
              <h4 className="font-bold text-slate-800 mb-3 truncate">{col}</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600">Mean:</span>
                  <span className="font-mono font-bold text-blue-600">{stats.mean?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600">Median:</span>
                  <span className="font-mono font-bold text-purple-600">{stats.median?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600">Std Dev:</span>
                  <span className="font-mono font-bold text-orange-600">{stats.std_dev?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600">Min:</span>
                  <span className="font-mono font-bold text-red-600">{stats.min?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600">Max:</span>
                  <span className="font-mono font-bold text-green-600">{stats.max?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="text-slate-600">IQR:</span>
                  <span className="font-mono font-bold text-indigo-600">{stats.iqr?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCorrelationAnalysis = () => {
    if (!data.correlation_analysis || data.correlation_analysis.length === 0) return null;
    
    const topCorr = data.correlation_analysis.slice(0, 8);
    const chartData = topCorr.map((item: any, idx: number) => ({
      name: `${idx + 1}`,
      correlation: item.correlation,
      pair: `${item.variable1.substring(0, 8)} vs ${item.variable2.substring(0, 8)}`,
    }));

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">🔗 Correlation Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">Relationships between numerical variables</p>
          </div>
          <Zap className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Top Correlations Chart</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="pair" type="category" width={120} tick={{fontSize: 10}} />
                <Tooltip />
                <Bar dataKey="correlation" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Detailed Correlations</h4>
            {topCorr.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all">
                <div className="text-sm font-semibold text-slate-800 mb-2">{idx + 1}. {item.variable1} ↔ {item.variable2}</div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      item.correlation > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-2 flex justify-between">
                  <span>Correlation:</span>
                  <span className="font-bold text-slate-800">{item.correlation?.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOutlierAnalysis = () => {
    if (!data.outliers || Object.keys(data.outliers).length === 0) return null;
    
    const outlierData = Object.entries(data.outliers)
      .map(([col, stats]: [string, any]) => ({
        name: col.substring(0, 12),
        outliers: stats.outlier_count,
        percentage: stats.outlier_percentage,
      }))
      .sort((a, b) => b.outliers - a.outliers);

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">⚠️ Outlier Detection</h3>
            <p className="text-sm text-slate-500 mt-1">Anomalous data points and their distribution</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={outlierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="outliers" fill="#ef4444" name="Count" />
                <Bar yAxisId="right" dataKey="percentage" fill="#f59e0b" name="%" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Object.entries(data.outliers)
              .sort((a: any, b: any) => b[1].outlier_count - a[1].outlier_count)
              .map(([col, stats]: [string, any]) => (
              <div key={col} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all hover:border-orange-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800 text-sm">{col}</span>
                  <span className="text-red-500 font-bold text-lg bg-red-50 px-2 py-1 rounded">{stats.outlier_count}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>% Outliers:</span>
                    <span className="font-bold text-orange-600">{stats.outlier_percentage?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Range:</span>
                    <span className="font-mono text-slate-700">[{stats.lower_bound?.toFixed(2)}, {stats.upper_bound?.toFixed(2)}]</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDistributionAnalysis = () => {
    if (!data.distribution_analysis) return null;
    
    const distCols = Object.keys(data.distribution_analysis);
    if (distCols.length === 0) return null;

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">📊 Distribution Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">Percentiles and distribution characteristics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {distCols.slice(0, 4).map(col => {
            const dist = data.distribution_analysis[col];
            const percentileData = [
              { name: 'P10', value: dist.percentiles?.p10 || 0 },
              { name: 'P25', value: dist.percentiles?.p25 || 0 },
              { name: 'P50', value: dist.percentiles?.p50 || 0 },
              { name: 'P75', value: dist.percentiles?.p75 || 0 },
              { name: 'P90', value: dist.percentiles?.p90 || 0 },
            ];

            return (
              <div key={col} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                <h4 className="font-bold text-slate-800 mb-3">{col}</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={percentileData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-xs text-slate-600 mt-3 space-y-1 bg-slate-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Skewness:</span>
                    <span className="font-bold text-slate-800">{dist.skewness?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kurtosis:</span>
                    <span className="font-bold text-slate-800">{dist.kurtosis?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCategoricalAnalysis = () => {
    if (!data.categorical_analysis) return null;
    
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">🏷️ Categorical Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">Distribution of categorical variables</p>
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(data.categorical_analysis).map(([col, counts]: [string, any], idx: number) => {
            const chartData = Object.entries(counts)
              .map(([key, value]: [string, any]) => ({
                name: String(key).slice(0, 20),
                value: value,
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 8);

            const pieData = chartData.slice(0, 5);

            return (
              <div key={col} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                <h4 className="font-bold text-slate-800 mb-3">{col}</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{fontSize: 10}} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS[idx % COLORS.length]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnomalyDetection = () => {
    if (!data.anomaly_detection) return null;

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">🔍 Anomaly Detection</h3>
            <p className="text-sm text-slate-500 mt-1">Unusual patterns and suspicious data points</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data.anomaly_detection).map(([col, anomaly]: [string, any]) => (
            <div key={col} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-orange-300">
              <h4 className="font-bold text-slate-800 mb-3">{col}</h4>
              <div className="text-sm space-y-3">
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="text-slate-600">Detected:</span>
                  <span className="font-bold text-orange-600 text-lg">{anomaly.anomalies_detected}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span className="text-slate-600">Percentage:</span>
                  <span className="font-bold text-amber-600">{anomaly.anomaly_percentage?.toFixed(2)}%</span>
                </div>
                {anomaly.anomaly_indices && anomaly.anomaly_indices.length > 0 && (
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-xs text-slate-600">Indices: </span>
                    <span className="text-xs font-mono text-slate-800">[{anomaly.anomaly_indices.slice(0, 3).join(', ')}...]</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRangeAnalysis = () => {
    if (!data.statistical_analysis) return null;

    const rangeData = Object.entries(data.statistical_analysis)
      .slice(0, 8)
      .map(([col, stats]: [string, any]) => ({
        name: col.substring(0, 12),
        range: (stats.max || 0) - (stats.min || 0),
        iqr: stats.iqr || 0,
      }));

    if (rangeData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">📏 Range Analysis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Value ranges and interquartile ranges</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={rangeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="range" fill="#6366f1" radius={[8, 8, 0, 0]} name="Full Range" />
            <Line yAxisId="right" type="monotone" dataKey="iqr" stroke="#f59e0b" strokeWidth={2} name="IQR" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderComparisonMatrix = () => {
    if (!data.statistical_analysis) return null;

    const stats = Object.entries(data.statistical_analysis).slice(0, 6);
    const matrixData = stats.map(([col, s]: [string, any]) => ({
      name: col.substring(0, 10),
      mean: s.mean || 0,
      median: s.median || 0,
      stdDev: s.std_dev || 0,
    }));

    if (matrixData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🎯 Statistical Comparison</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Mean, Median, and Standard Deviation comparison</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={matrixData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="mean" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Mean" />
            <Bar dataKey="median" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Median" />
            <Line type="monotone" dataKey="stdDev" stroke="#ef4444" strokeWidth={2} name="Std Dev" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderPercentileDistribution = () => {
    if (!data.distribution_analysis) return null;

    const distCols = Object.keys(data.distribution_analysis);
    if (distCols.length === 0) return null;

    const percentileCharts = distCols.slice(0, 2).map(col => {
      const dist = data.distribution_analysis[col];
      return {
        name: col,
        data: [
          { name: 'Min', value: dist.min || 0 },
          { name: 'P25', value: dist.percentiles?.p25 || 0 },
          { name: 'P50', value: dist.percentiles?.p50 || 0 },
          { name: 'P75', value: dist.percentiles?.p75 || 0 },
          { name: 'Max', value: dist.max || 0 },
        ]
      };
    });

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">📊 Percentile Distribution</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Five-point summary for key variables</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {percentileCharts.map((chart, idx) => (
            <div key={chart.name} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <h4 className="font-bold text-slate-800 dark:text-white mb-4">{chart.name}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={COLORS[idx]} strokeWidth={3} dot={{ fill: COLORS[idx], r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataQualityMetrics = () => {
    if (!data.data_quality) return null;
    const dq = data.data_quality;

    const qualityMetrics = [
      { name: 'Complete', value: ((dq.total_cells - dq.missing_cells) / dq.total_cells * 100), color: '#10b981' },
      { name: 'Duplicates', value: ((dq.duplicate_rows / data.row_count) * 100), color: '#ef4444' },
      { name: 'Data Integrity', value: ((1 - (dq.duplicate_rows / data.row_count)) * 100), color: '#3b82f6' },
    ];

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🔍 Quality Score Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Data quality indicators</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {qualityMetrics.map((metric, idx) => (
            <div key={metric.name} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="mb-3">
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">{metric.name}</h4>
                <div className="text-3xl font-bold" style={{color: metric.color}}>{metric.value.toFixed(1)}%</div>
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-2 rounded-full transition-all" 
                  style={{width: `${metric.value}%`, backgroundColor: metric.color}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDistributionComparison = () => {
    if (!data.statistical_analysis) return null;

    const distData = Object.entries(data.statistical_analysis)
      .filter(([_, stats]: [string, any]) => stats.min !== undefined && stats.max !== undefined)
      .slice(0, 5)
      .map(([col, stats]: [string, any]) => ({
        name: col.substring(0, 12),
        'Low': stats.min || 0,
        'Mid-Low': ((stats.min || 0) + (stats.mean || 0)) / 2,
        'Mid': stats.mean || 0,
        'Mid-High': ((stats.mean || 0) + (stats.max || 0)) / 2,
        'High': stats.max || 0,
      }));

    if (distData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🌈 Value Distribution</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Value spread from low to high</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={distData}>
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="Low" stackId="1" stroke="#ef4444" fill="url(#colorLow)" />
            <Area type="monotone" dataKey="Mid-Low" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Area type="monotone" dataKey="Mid" stackId="1" stroke="#3b82f6" fill="url(#colorMid)" />
            <Area type="monotone" dataKey="Mid-High" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="High" stackId="1" stroke="#10b981" fill="url(#colorHigh)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderFeatureScatterPlot = () => {
    if (!data.statistical_analysis) return null;

    const scatterData = Object.entries(data.statistical_analysis)
      .slice(0, 20)
      .map(([col, stats]: [string, any]) => ({
        name: col,
        mean: stats.mean || 0,
        stdDev: stats.std_dev || 0,
        size: (stats.max - stats.min) || 1,
      }));

    if (scatterData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🔷 Mean vs Variability</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Relationship between central tendency and spread</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="mean" name="Mean" />
            <YAxis type="number" dataKey="stdDev" name="Std Dev" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Features" data={scatterData} fill="#8b5cf6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderFeatureComparison = () => {
    if (!data.statistical_analysis) return null;

    const featureStats = Object.entries(data.statistical_analysis)
      .slice(0, 8)
      .map(([col, stats]: [string, any], idx) => ({
        name: col.substring(0, 10),
        'CV%': Math.abs(stats.mean) > 0 ? ((stats.std_dev / Math.abs(stats.mean)) * 100) : 0,
        'Skewness': data.distribution_analysis?.[col]?.skewness || 0,
        'Kurtosis': data.distribution_analysis?.[col]?.kurtosis || 0,
      }));

    if (featureStats.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">📈 Statistical Properties</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Coefficient of Variation, Skewness, and Kurtosis</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="CV%" fill="#3b82f6" name="Coefficient of Variation %" radius={[8, 8, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="Skewness" stroke="#f59e0b" strokeWidth={2} name="Skewness" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderComplexityScore = () => {
    if (!data.statistical_analysis || !data.data_quality) return null;

    const numericCols = Object.keys(data.statistical_analysis).length;
    const categoricalCols = Object.keys(data.categorical_analysis || {}).length;
    const totalCols = data.column_count;
    const missingPct = (data.data_quality.missing_cells / data.data_quality.total_cells) * 100;
    const outlierCols = Object.keys(data.outliers || {}).filter(col => (data.outliers[col].outlier_count > 0)).length;

    const complexityFactors = [
      { name: 'Numeric Features', value: Math.min((numericCols / totalCols) * 100, 100) },
      { name: 'Data Completeness', value: 100 - missingPct },
      { name: 'Outlier Presence', value: Math.min(((totalCols - outlierCols) / totalCols) * 100, 100) },
    ];

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">⚙️ Dataset Complexity</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Data characteristics and composition</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={complexityFactors}>
            <CartesianGrid strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderClusteringAnalysis = () => {
    if (!data.clustering_analysis) return null;
    const clustering = data.clustering_analysis;

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">🎯 Clustering Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">Natural grouping and segmentation patterns</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="text-xs font-semibold text-blue-700 uppercase">Clusters</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{clustering.clusters?.length || 0}</div>
            <div className="text-xs text-blue-500 mt-2">identified</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="text-xs font-semibold text-purple-700 uppercase">Inertia</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">{clustering.inertia?.toFixed(2)}</div>
            <div className="text-xs text-purple-500 mt-2">within-cluster sum</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="text-xs font-semibold text-green-700 uppercase">Silhouette</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{clustering.silhouette_score?.toFixed(3)}</div>
            <div className="text-xs text-green-500 mt-2">cohesion score</div>
          </div>
        </div>
        {clustering.cluster_centers && (
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-bold text-slate-800 mb-3">Cluster Centers</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {clustering.cluster_centers.map((center: number[], idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded hover:bg-slate-100 transition-all">
                  <span className="font-bold text-slate-800">Cluster {idx}:</span>
                  <span className="font-mono text-xs text-slate-600">[{center.map((v: number) => v.toFixed(2)).join(', ')}]</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedMetrics = () => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">⚡ Advanced Metrics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Comprehensive data health indicators</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.data_quality && (
            <>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase">Data Integrity</div>
                <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                  {((1 - (data.data_quality.duplicate_rows / data.row_count)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">non-duplicate rows</div>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-cyan-900 dark:text-cyan-300 uppercase">Completeness</div>
                <div className="text-3xl font-bold text-cyan-700 dark:text-cyan-400 mt-1">
                  {((1 - (data.data_quality.missing_cells / data.data_quality.total_cells)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-cyan-600 dark:text-cyan-300 mt-2">filled data cells</div>
              </div>
            </>
          )}
          <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="text-xs font-semibold text-rose-900 dark:text-rose-300 uppercase">Data Density</div>
            <div className="text-3xl font-bold text-rose-700 dark:text-rose-400 mt-1">
              {((data.row_count * data.column_count) / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-300 mt-2">million cells</div>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="text-xs font-semibold text-teal-900 dark:text-teal-300 uppercase">Feature Count</div>
            <div className="text-3xl font-bold text-teal-700 dark:text-teal-400 mt-1">{data.column_count}</div>
            <div className="text-xs text-teal-600 dark:text-teal-300 mt-2">dimensions</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendAnalysis = () => {
    if (!data.statistical_analysis) return null;

    const trendData = Object.entries(data.statistical_analysis)
      .slice(0, 5)
      .map(([col, stats]: [string, any]) => ({
        name: col.substring(0, 15),
        min: stats.min || 0,
        max: stats.max || 0,
        avg: stats.mean || 0,
      }));

    if (trendData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">📊 Trend Analysis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Min, Max, and Average values across columns</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="min" stroke="#ef4444" fillOpacity={1} fill="url(#colorMin)" name="Minimum" />
            <Area type="monotone" dataKey="avg" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAvg)" name="Average" />
            <Area type="monotone" dataKey="max" stroke="#10b981" fillOpacity={1} fill="url(#colorMax)" name="Maximum" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderVariabilityAnalysis = () => {
    if (!data.statistical_analysis) return null;

    const varData = Object.entries(data.statistical_analysis)
      .filter(([_, stats]: [string, any]) => stats.std_dev !== undefined)
      .slice(0, 6)
      .map(([col, stats]: [string, any]) => ({
        name: col.substring(0, 12),
        stdDev: stats.std_dev,
        mean: Math.abs(stats.mean) || 1,
      }))
      .map(item => ({
        ...item,
        cv: ((item.stdDev / item.mean) * 100).toFixed(2)
      }));

    if (varData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">📉 Variability Analysis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Coefficient of Variation (CV) for each column</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={varData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any) => `${value}%`} />
            <Bar dataKey="cv" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Coefficient of Variation (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDataCompleteness = () => {
    if (!data.data_quality) return null;
    const dq = data.data_quality;
    
    const completenessData = [
      { name: 'Complete', value: ((dq.total_cells - dq.missing_cells) / dq.total_cells) * 100, fill: '#10b981' },
      { name: 'Missing', value: (dq.missing_cells / dq.total_cells) * 100, fill: '#ef4444' },
    ];

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-300 dark:border-slate-600 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">✓ Data Completeness</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Overall data availability percentage</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completenessData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {completenessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-l-green-600 rounded-lg p-4">
              <div className="text-sm font-semibold text-green-900 dark:text-green-300">Completeness Score</div>
              <div className="text-4xl font-bold text-green-700 dark:text-green-400 mt-2">
                {((dq.total_cells - dq.missing_cells) / dq.total_cells * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-green-600 dark:text-green-300 mt-2">
                {dq.total_cells - dq.missing_cells} of {dq.total_cells} cells filled
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-l-red-600 rounded-lg p-4">
              <div className="text-sm font-semibold text-red-900 dark:text-red-300">Missing Data</div>
              <div className="text-4xl font-bold text-red-700 dark:text-red-400 mt-2">
                {(dq.missing_cells / dq.total_cells * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-red-600 dark:text-red-300 mt-2">
                {dq.missing_cells} cells with missing values
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderDataVolumeChart()}
      {renderAdvancedMetrics()}
      {renderDataQualityMetrics()}
      {renderDataCompleteness()}
      {renderComplexityScore()}
      {renderRangeAnalysis()}
      {renderComparisonMatrix()}
      {renderTrendAnalysis()}
      {renderVariabilityAnalysis()}
      {renderDistributionComparison()}
      {renderPercentileDistribution()}
      {renderDataQualityOverview()}
      {renderStatisticalAnalysis()}
      {renderFeatureComparison()}
      {renderCorrelationAnalysis()}
      {renderOutlierAnalysis()}
      {renderDistributionAnalysis()}
      {renderCategoricalAnalysis()}
      {renderFeatureScatterPlot()}
      {renderAnomalyDetection()}
      {renderClusteringAnalysis()}
    </div>
  );
};
