const DataTable = ({ data }: { data?: any[] }) => {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-2">Raw Data</h3>
        <div className="text-sm text-muted mt-2">No raw data available to preview.</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 overflow-auto">
      <h3 className="font-semibold mb-4">Raw Data</h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2 text-right">Flow</th>
            <th className="p-2 text-right">Press</th>
            <th className="p-2 text-right">Temp</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
              <td className="p-2">{row.equipment_name}</td>
              <td className="p-2">{row.type}</td>
              <td className="p-2 text-right">{row.flowrate}</td>
              <td className="p-2 text-right">{row.pressure}</td>
              <td className="p-2 text-right">{row.temperature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DataTable;
