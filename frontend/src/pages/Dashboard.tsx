import { useState, useEffect } from "react";
import { useDatasets } from "@/hooks/useDatasets";
import { motion } from "framer-motion";
import { Beaker, Upload, Thermometer, Wind, Gauge, Heart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/dashboard/KPICard";
import EquipmentTypeChart from "@/components/dashboard/EquipmentTypeChart";
import ParameterBarChart from "@/components/dashboard/ParameterBarChart";
import DataTable from "@/components/dashboard/DataTable";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { FavoritesPanel } from "@/components/dashboard/FavoritesPanel";
import { DataQualityReport } from "@/components/dashboard/DataQualityReport";
import { DatasetComparison } from "@/components/dashboard/DatasetComparison";
import { DataValidation } from "@/components/dashboard/DataValidation";
import { RawDataViewer } from "@/components/dashboard/RawDataViewer";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { useTheme } from "@/hooks/useTheme";
import { apiFetch, API_URL } from "@/utils/api";
import { getStoredBasicAuth, setStoredBasicAuth, clearStoredBasicAuth } from "@/utils/api";

const Dashboard = () => {
    const [authReady, setAuthReady] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [authUser, setAuthUser] = useState<string>(import.meta.env.VITE_BASIC_AUTH_USER || "");
    const [authPass, setAuthPass] = useState<string>(import.meta.env.VITE_BASIC_AUTH_PASS || "");
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSignup, setIsSignup] = useState(false);
    const [authEmail, setAuthEmail] = useState("");
    const { datasets, fetchDatasets, uploadDataset, uploading } = useDatasets(!!authToken);
    const [selectedData, setSelectedData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'validation' | 'comparison' | 'favorites' | 'raw-data'>('overview');
    const { theme, toggleTheme } = useTheme();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingDataset, setIsLoadingDataset] = useState(false);

    useEffect(() => {
        clearStoredBasicAuth();
        setAuthToken(null);
        setAuthReady(true);
    }, []);

    useEffect(() => {
        const onLogout = () => setAuthToken(null);
        window.addEventListener("auth:logout", onLogout);
        return () => window.removeEventListener("auth:logout", onLogout);
    }, []);

    useEffect(() => { 
        if (authToken) {
            fetchDatasets();
        }
    }, [authToken, fetchDatasets]);

    const handleLogin = async () => {
        if (!authUser || !authPass) {
            setAuthError("Enter username and password");
            return;
        }
        const token = setStoredBasicAuth(authUser, authPass);
        setAuthToken(token);
        setAuthError(null);

        // Validate credentials
        const res = await apiFetch(`/history/`);
        if (res.status === 401) {
            clearStoredBasicAuth();
            setAuthToken(null);
            setAuthError("Invalid credentials");
        }
    };

    const handleSignup = async () => {
        if (!authUser || !authPass) {
            setAuthError("Enter username and password");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/signup/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: authUser, password: authPass, email: authEmail }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setAuthError(err.error || "Signup failed");
                return;
            }
            setAuthError(null);
            const token = setStoredBasicAuth(authUser, authPass);
            setAuthToken(token);
        } catch (e) {
            setAuthError("Signup failed");
        }
    };

    const handleLogout = () => {
        clearStoredBasicAuth();
        setAuthToken(null);
    };

    if (!authReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    if (!authToken) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
                <div className={`w-full max-w-md p-8 rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <h1 className="text-2xl font-bold mb-2">ChemViz {isSignup ? "Sign Up" : "Login"}</h1>
                    <p className="text-sm text-slate-500 mb-6">Enter your API credentials to continue.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                            <input
                                value={authUser}
                                onChange={(e) => setAuthUser(e.target.value)}
                                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                placeholder="Username"
                            />
                        </div>
                        {isSignup && (
                            <div>
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email (optional)</label>
                                <input
                                    value={authEmail}
                                    onChange={(e) => setAuthEmail(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                    placeholder="Email"
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                            <input
                                type="password"
                                value={authPass}
                                onChange={(e) => setAuthPass(e.target.value)}
                                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                placeholder="Password"
                            />
                        </div>
                        {authError && <div className="text-sm text-red-500">{authError}</div>}
                        {!isSignup ? (
                            <button
                                onClick={handleLogin}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Sign In
                            </button>
                        ) : (
                            <button
                                onClick={handleSignup}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Create Account
                            </button>
                        )}
                        <button
                            onClick={() => { setIsSignup(!isSignup); setAuthError(null); }}
                            className="w-full text-sm text-slate-500 hover:text-slate-700"
                        >
                            {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

        const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if(e.target.files?.[0]) {
                const result = await uploadDataset(e.target.files[0]);
                if(result) {
                setSelectedData(result);
                // Show analytics immediately after upload
                setActiveTab('analytics');
                }
            }
        };

    const loadDataset = async (id: number) => {
            setIsLoadingDataset(true);
            try {
                // Fetch specific dataset details
                const res = await apiFetch(`/dashboard/${id}/`);
                if (!res.ok) {
                    throw new Error(`Failed to load dataset: HTTP ${res.status}`);
                }
                const data = await res.json();
                setSelectedData({
                        id: id,
                        original_file_name: data.filename,
                        statistics: data,
                        equipment_data: data.equipment_data,
                        columns: data.columns,
                });
                setActiveTab('overview');
          
                // Check if favorite
                checkIfFavorite(id);
            } catch (error) {
                console.error('Failed to load dataset:', error);
            } finally {
                setIsLoadingDataset(false);
            }
    };

    const checkIfFavorite = async (datasetId: number) => {
        try {
            const res = await apiFetch(`/favorites/`);
            const favorites = await res.json();
            setIsFavorite(favorites.some((f: any) => f.dataset.id === datasetId));
        } catch (error) {
            console.error('Failed to check favorites:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!selectedData?.id) return;
    
        try {
            const method = isFavorite ? 'DELETE' : 'POST';
            await apiFetch(`/favorite/${selectedData.id}/`, { method });
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    return (
        <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            {/* Sidebar */}
            <div className={`w-64 border-r ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 hidden md:block overflow-y-auto`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2 text-blue-600">
                        <Beaker /> ChemViz
                    </h2>
                    <button onClick={toggleTheme} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Navigation Tabs */}
                {selectedData && (
                    <div className="mb-6 space-y-2">
                        <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                            📊 Overview
                        </button>
                        <button onClick={() => setActiveTab('analytics')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                            📈 Analytics
                        </button>
                        <button onClick={() => setActiveTab('raw-data')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab === 'raw-data' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                            📋 Raw Data
                        </button>
                        <button onClick={() => setActiveTab('validation')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab === 'validation' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                            ✓ Validation
                        </button>
                        <button onClick={() => setActiveTab('comparison')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab === 'comparison' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                            🔀 Compare
                        </button>
                        <button onClick={() => setActiveTab('favorites')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab === 'favorites' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                            ❤️ Favorites
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase opacity-60">Recent Files</h3>
                    {isLoadingDataset && (
                        <div className="text-xs text-gray-500 p-2">Loading...</div>
                    )}
                    {datasets.length === 0 ? (
                        <div className="text-xs text-gray-500 p-2">No datasets yet</div>
                    ) : (
                        datasets.slice(0, 10).map((d: any) => (
                            <button 
                                key={d.id} 
                                onClick={() => loadDataset(d.id)}
                                disabled={isLoadingDataset}
                                className={`w-full text-left text-sm p-2 rounded truncate transition ${
                                    selectedData?.id === d.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'hover:bg-blue-500 hover:text-white'
                                } ${isLoadingDataset ? 'opacity-60 cursor-not-allowed' : ''}`}
                                title={d.original_file_name || d.filename}
                            >
                                {d.original_file_name || d.filename || `Dataset ${d.id}`}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-6 overflow-auto ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">ChemViz Analytics Dashboard</h1>
                        <div className="flex gap-2">
                            {selectedData && (
                                <>
                                    <button onClick={toggleFavorite} className={`p-2 rounded-lg ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}>
                                        <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                                    </button>
                                    <ExportButtons datasetId={selectedData.id} filename={selectedData.original_file_name} />
                                </>
                            )}
                            <button onClick={handleLogout} className="p-2 rounded-lg text-slate-500 hover:text-slate-700">
                                <LogOut className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                    <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv"/>
                                    <Button disabled={uploading} className="flex gap-2">
                                            <Upload className="h-4 w-4" /> 
                                            {uploading ? "Analyzing..." : "Upload CSV"}
                                    </Button>
                            </div>
                        </div>
                </div>

                {selectedData && selectedData.statistics ? (
                        <div className="space-y-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <KPICard title="Total Rows" value={selectedData.statistics.row_count} unit="rows" icon={Thermometer} />
                                            <KPICard title="Total Columns" value={selectedData.statistics.column_count} unit="cols" icon={Gauge} />
                                            <KPICard title="File Size" value={selectedData.statistics.file_size ? (selectedData.statistics.file_size / 1024).toFixed(2) : 'N/A'} unit="KB" icon={Wind} />
                                    </div>
                                    {selectedData.statistics.type_distribution && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <EquipmentTypeChart data={selectedData.statistics.type_distribution} />
                                            {selectedData.equipment_data && <ParameterBarChart data={selectedData.equipment_data} />}
                                        </div>
                                    )}
                                    {selectedData.equipment_data && <DataTable data={selectedData.equipment_data} />}
                                    {selectedData.statistics.data_quality && (
                                        <DataQualityReport dataQuality={selectedData.statistics.data_quality} />
                                    )}
                                </>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === 'analytics' && (
                                <AnalyticsPanel data={selectedData.statistics} />
                            )}

                            {/* Raw Data Tab */}
                            {activeTab === 'raw-data' && (
                                <RawDataViewer datasetId={selectedData.id} filename={selectedData.original_file_name} />
                            )}

                            {/* Validation Tab */}
                            {activeTab === 'validation' && (
                                <DataValidation datasetId={selectedData.id} columns={selectedData.columns || []} />
                            )}

                            {/* Comparison Tab */}
                            {activeTab === 'comparison' && (
                                <DatasetComparison datasets={datasets.map((d: any) => ({ id: d.id, filename: d.filename }))} />
                            )}

                            {/* Favorites Tab */}
                            {activeTab === 'favorites' && (
                                <FavoritesPanel />
                            )}
                        </div>
                ) : (
                        <div className="text-center mt-20 opacity-60">
                                <Upload className="mx-auto h-16 w-16 mb-4" />
                                <p>Upload a CSV file to view analytics</p>
                        </div>
                )}
            </div>
        </div>
    );
};
export default Dashboard;
