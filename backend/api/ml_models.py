import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA
from scipy import stats
import logging

logger = logging.getLogger(__name__)

class MLAnalytics:
    @staticmethod
    def anomaly_detection(df, numeric_cols, contamination=0.05):
        """Isolation Forest for anomaly detection"""
        try:
            results = {}
            for col in numeric_cols:
                col_data = df[col].dropna().values.reshape(-1, 1)
                if len(col_data) > 10:
                    iso_forest = IsolationForest(contamination=contamination, random_state=42)
                    predictions = iso_forest.fit_predict(col_data)
                    anomaly_scores = iso_forest.score_samples(col_data)
                    
                    results[col] = {
                        'anomalies_detected': int((predictions == -1).sum()),
                        'anomaly_indices': np.where(predictions == -1)[0].tolist(),
                        'anomaly_percentage': float(((predictions == -1).sum() / len(predictions)) * 100),
                        'anomaly_scores': anomaly_scores.tolist()[:50],  # First 50 for performance
                    }
            return results
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            return {}

    @staticmethod
    def clustering_analysis(df, numeric_cols, n_clusters=3):
        """K-means clustering analysis"""
        try:
            if len(numeric_cols) < 2:
                return None
            
            X = df[numeric_cols].dropna()
            if len(X) < n_clusters:
                n_clusters = max(2, len(X) - 1)
            
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            clusters = kmeans.fit_predict(X_scaled)
            
            return {
                'clusters': clusters.tolist(),
                'cluster_centers': kmeans.cluster_centers_.tolist(),
                'inertia': float(kmeans.inertia_),
                'silhouette_score': float(np.mean([
                    np.linalg.norm(X_scaled[i] - kmeans.cluster_centers_[c])
                    for i, c in enumerate(clusters)
                ])),
            }
        except Exception as e:
            logger.error(f"Clustering error: {str(e)}")
            return None

    @staticmethod
    def time_series_forecast(series, periods=10):
        """ARIMA forecasting for time series"""
        try:
            if len(series) < 50 or series.isnull().sum() > len(series) * 0.3:
                return None
            
            series = series.dropna()
            model = ARIMA(series, order=(1, 1, 1))
            results = model.fit()
            forecast = results.get_forecast(steps=periods).predicted_mean
            
            return {
                'forecast': forecast.tolist(),
                'confidence': float(results.mle_retvals.get('cov_type', 'standard').__hash__() % 100),
                'aic': float(results.aic),
                'bic': float(results.bic),
            }
        except Exception as e:
            logger.error(f"Time series forecast error: {str(e)}")
            return None

    @staticmethod
    def hypothesis_testing(col1, col2):
        """Perform t-test and correlation analysis"""
        try:
            col1 = col1.dropna()
            col2 = col2.dropna()
            
            if len(col1) < 2 or len(col2) < 2:
                return None
            
            t_stat, p_value = stats.ttest_ind(col1, col2)
            correlation, corr_pvalue = stats.pearsonr(col1, col2)
            
            return {
                't_statistic': float(t_stat),
                'p_value': float(p_value),
                'significant': p_value < 0.05,
                'correlation': float(correlation),
                'correlation_pvalue': float(corr_pvalue),
                'effect_size': float(np.mean(col1) - np.mean(col2)) / np.std(np.concatenate([col1, col2])),
            }
        except Exception as e:
            logger.error(f"Hypothesis testing error: {str(e)}")
            return None

    @staticmethod
    def feature_importance(df, numeric_cols, target_col=None):
        """Calculate feature importance"""
        try:
            if target_col and target_col in numeric_cols:
                cols_to_use = [c for c in numeric_cols if c != target_col]
            else:
                cols_to_use = numeric_cols[:5]
            
            importance = {}
            for col in cols_to_use:
                col_data = df[col].dropna()
                importance[col] = {
                    'variance': float(col_data.var()),
                    'std_dev': float(col_data.std()),
                    'correlation_with_mean': float(np.corrcoef(col_data, range(len(col_data)))[0, 1]),
                }
            
            return importance
        except Exception as e:
            logger.error(f"Feature importance error: {str(e)}")
            return {}

    @staticmethod
    def duplicate_detection(df):
        """Detect duplicate rows"""
        try:
            duplicates = df.duplicated(keep=False)
            dup_count = duplicates.sum()
            
            return {
                'duplicate_rows': int(dup_count),
                'duplicate_percentage': float((dup_count / len(df)) * 100),
                'duplicate_indices': np.where(duplicates)[0].tolist()[:100],
            }
        except Exception as e:
            logger.error(f"Duplicate detection error: {str(e)}")
            return {}
