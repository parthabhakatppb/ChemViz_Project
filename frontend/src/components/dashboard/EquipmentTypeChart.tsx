import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#2563eb", "#3b82f6", "#0ea5e9", "#38bdf8", "#22d3ee"];

const EquipmentTypeChart = ({ data }: { data: Record<string, number> }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <div className="chart-container h-[300px]">
      <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Equipment Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#e2e8f0" }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default EquipmentTypeChart;
