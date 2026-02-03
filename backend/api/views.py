import pandas as pd
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Dataset
from .serializers import DatasetSerializer
from .ml_models import MLAnalytics

logger = logging.getLogger(__name__)

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"Upload request received. Files: {request.FILES.keys()}")
            file_serializer = DatasetSerializer(data=request.data)
            if file_serializer.is_valid():
                try:
                    dataset = file_serializer.save()
                    logger.info(f"File saved successfully: {dataset.filename}")
                    return Response(file_serializer.data, status=201)
                except Exception as e:
                    logger.error(f"Failed to save file: {str(e)}")
                    return Response({"error": f"Failed to save file: {str(e)}"}, status=400)
            logger.error(f"Serializer errors: {file_serializer.errors}")
            return Response(file_serializer.errors, status=400)
        except Exception as e:
            logger.error(f"Upload view error: {str(e)}")
            return Response({"error": f"Upload failed: {str(e)}"}, status=500)

class DashboardDataView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            df = pd.read_csv(dataset.file.path)
            
            # Normalize column names
            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
            
            # Identify numeric columns
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            
            # Basic Stats
            stats = {
                "id": dataset.id,
                "filename": dataset.filename,
                "created_at": dataset.uploaded_at,
                "row_count": int(len(df)),
                "column_count": len(df.columns),
                "columns": list(df.columns),
            }
            
            # Statistical Analysis for numeric columns
            if numeric_cols:
                stats["statistical_analysis"] = {}
                for col in numeric_cols:
                    col_data = df[col].dropna()
                    if len(col_data) > 0:
                        stats["statistical_analysis"][col] = {
                            "mean": float(col_data.mean()),
                            "median": float(col_data.median()),
                            "std_dev": float(col_data.std()),
                            "variance": float(col_data.var()),
                            "min": float(col_data.min()),
                            "max": float(col_data.max()),
                            "q1": float(col_data.quantile(0.25)),
                            "q3": float(col_data.quantile(0.75)),
                            "iqr": float(col_data.quantile(0.75) - col_data.quantile(0.25)),
                        }
            
            # Data Quality Metrics
            stats["data_quality"] = {
                "total_cells": int(len(df) * len(df.columns)),
                "missing_cells": int(df.isnull().sum().sum()),
                "missing_percentage": float((df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100),
                "missing_by_column": df.isnull().sum().to_dict(),
                "duplicate_rows": int(df.duplicated().sum()),
            }
            
            # Distribution Analysis
            if numeric_cols:
                stats["distribution_analysis"] = {}
                for col in numeric_cols:
                    col_data = df[col].dropna()
                    if len(col_data) > 0:
                        stats["distribution_analysis"][col] = {
                            "skewness": float(col_data.skew()),
                            "kurtosis": float(col_data.kurtosis()),
                            "percentiles": {
                                "p10": float(col_data.quantile(0.10)),
                                "p25": float(col_data.quantile(0.25)),
                                "p50": float(col_data.quantile(0.50)),
                                "p75": float(col_data.quantile(0.75)),
                                "p90": float(col_data.quantile(0.90)),
                            }
                        }
            
            # Correlation Analysis
            if len(numeric_cols) > 1:
                corr_matrix = df[numeric_cols].corr()
                # Get top correlations (excluding self-correlation)
                corr_pairs = []
                for i, col1 in enumerate(numeric_cols):
                    for col2 in numeric_cols[i+1:]:
                        corr_pairs.append({
                            "variable1": col1,
                            "variable2": col2,
                            "correlation": float(corr_matrix.loc[col1, col2])
                        })
                corr_pairs.sort(key=lambda x: abs(x['correlation']), reverse=True)
                stats["correlation_analysis"] = corr_pairs[:10]  # Top 10 correlations
            
            # Outlier Detection (using IQR method)
            stats["outliers"] = {}
            if numeric_cols:
                for col in numeric_cols:
                    col_data = df[col].dropna()
                    if len(col_data) > 0:
                        Q1 = col_data.quantile(0.25)
                        Q3 = col_data.quantile(0.75)
                        IQR = Q3 - Q1
                        lower_bound = Q1 - 1.5 * IQR
                        upper_bound = Q3 + 1.5 * IQR
                        outlier_count = ((col_data < lower_bound) | (col_data > upper_bound)).sum()
                        stats["outliers"][col] = {
                            "outlier_count": int(outlier_count),
                            "outlier_percentage": float((outlier_count / len(col_data)) * 100),
                            "lower_bound": float(lower_bound),
                            "upper_bound": float(upper_bound),
                        }
            
            # Type/Category Distribution
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            if categorical_cols:
                stats["categorical_analysis"] = {}
                for col in categorical_cols[:5]:  # Limit to first 5 categorical columns
                    stats["categorical_analysis"][col] = df[col].value_counts().to_dict()
            
            # ML INSIGHTS
            # Anomaly Detection
            anomalies = MLAnalytics.anomaly_detection(df, numeric_cols)
            if anomalies:
                stats["anomaly_detection"] = anomalies
            
            # Clustering Analysis
            if len(numeric_cols) >= 2:
                clusters = MLAnalytics.clustering_analysis(df, numeric_cols)
                if clusters:
                    stats["clustering_analysis"] = clusters
            
            # Duplicate Detection
            duplicates = MLAnalytics.duplicate_detection(df)
            if duplicates:
                stats["duplicate_detection"] = duplicates
            
            # Feature Importance
            feature_imp = MLAnalytics.feature_importance(df, numeric_cols)
            if feature_imp:
                stats["feature_importance"] = feature_imp
            
            # Time Series Forecast (for first numeric column with enough data)
            if numeric_cols:
                forecast = MLAnalytics.time_series_forecast(df[numeric_cols[0]], periods=10)
                if forecast:
                    stats["time_series_forecast"] = forecast
            
            # Summary Statistics for specific equipment columns
            for col in ['flowrate', 'pressure', 'temperature', 'type']:
                if col in df.columns:
                    if col == 'type' or col in categorical_cols:
                        stats[f"{col}_distribution"] = df[col].value_counts().to_dict() if col in df.columns else {}
                    else:
                        col_data = df[col].dropna()
                        if len(col_data) > 0:
                            stats[f"avg_{col}"] = float(col_data.mean())
                            stats[f"max_{col}"] = float(col_data.max())
                            stats[f"min_{col}"] = float(col_data.min())
            
            # Equipment data for table
            stats["equipment_data"] = df.head(100).fillna('').to_dict(orient='records')
            
            return Response(stats)
        except Exception as e:
            logger.error(f"Dashboard view error: {str(e)}")
            return Response({"error": str(e)}, status=500)

class RawDataView(APIView):
    """API view to return raw dataset data in JSON format"""
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            df = pd.read_csv(dataset.file.path)
            
            # Normalize column names
            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
            
            # Return raw data and columns
            data = {
                "id": dataset.id,
                "filename": dataset.filename,
                "columns": list(df.columns),
                "data": df.fillna('').to_dict(orient='records'),
                "row_count": len(df),
                "column_count": len(df.columns),
            }
            
            return Response(data)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)
        except Exception as e:
            logger.error(f"Raw data view error: {str(e)}")
            return Response({"error": str(e)}, status=500)

class HistoryView(APIView):
    def get(self, request):
        datasets = Dataset.objects.order_by('-uploaded_at')[:5]
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)

