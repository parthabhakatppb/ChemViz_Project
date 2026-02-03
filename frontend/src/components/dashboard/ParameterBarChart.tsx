import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ParameterBarChart = ({ data }: { data: any[] }) => {
  const chartData = data.slice(0, 10);
  return (
    <div className="chart-container h-[300px]">
      <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Top 10 Equipment Params</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="equipment_name" hide />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#e2e8f0" }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#e2e8f0" }}
            cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
          />
          <Legend />
          <Bar dataKey="temperature" fill="#2563eb" name="Temp" />
          <Bar dataKey="pressure" fill="#0ea5e9" name="Pressure" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default ParameterBarChart;
