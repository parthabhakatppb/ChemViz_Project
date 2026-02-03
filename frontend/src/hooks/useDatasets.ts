import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://127.0.0.1:8000/api";

export const useDatasets = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/history/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Map Django keys to React expected keys
      const formatted = data.map((d: any) => ({
        id: d.id,
        original_file_name: d.filename || `Dataset ${d.id}`,
        filename: d.filename,
        created_at: d.uploaded_at
      }));
      setDatasets(formatted);
      setIsInitialized(true);
    } catch (error) {
      console.error("Fetch error", error);
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch datasets on component mount
  useEffect(() => {
    if (!isInitialized) {
      fetchDatasets();
    }
  }, [isInitialized, fetchDatasets]);

  const uploadDataset = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await fetch(`${API_URL}/upload/`, { method: "POST", body: formData });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.detail || "Upload failed";
        throw new Error(errorMsg);
      }
      
      const result = await res.json();
      
      // Fetch stats immediately
      const statsRes = await fetch(`${API_URL}/dashboard/${result.id}/`);
      const statsData = await statsRes.json();

      const avgTemp = statsData?.avg_temperature;
      toast({
        title: "Success",
        description: `Analyzed ${file.name}. Avg Temp: ${avgTemp !== undefined && avgTemp !== null ? avgTemp.toFixed(2) : 'N/A'}`,
      });

      // Update selection in parent component via fetchDatasets or returning data
      await fetchDatasets();
      // Return the full stats object for the dashboard to display
      return {
          id: result.id,
          original_file_name: result.filename,
          row_count: statsData.row_count,
          statistics: statsData,
          equipment_data: statsData.equipment_data
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Upload error:", errorMsg);
      toast({ title: "Error", description: errorMsg });
    } finally {
        setUploading(false);
    }
  }, [fetchDatasets, toast]);

  const deleteDataset = async () => console.log("Delete not impl in demo");

  return { datasets, loading, uploading, fetchDatasets, uploadDataset, deleteDataset };
};
