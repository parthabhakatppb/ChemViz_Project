"""Advanced analytics and comparison utilities"""
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from scipy import stats
import json

class ComparisonAnalytics:
    """Compare and analyze multiple datasets"""
    
    @staticmethod
    def compare_datasets(df1, df2):
        """Compare two datasets and return similarity metrics"""
        try:
            # Get common and unique columns
            cols1 = set(df1.columns)
            cols2 = set(df2.columns)
            common = list(cols1 & cols2)
            unique1 = list(cols1 - cols2)
            unique2 = list(cols2 - cols1)
            
            # Calculate matching rows (for common columns)
            matching_rows = 0
            if common:
                matching_rows = len(pd.merge(df1[common], df2[common], how='inner'))
            
            # Calculate similarity score (0-100)
            column_similarity = len(common) / max(len(cols1), len(cols2)) * 50 if max(len(cols1), len(cols2)) > 0 else 0
            size_similarity = min(len(df1), len(df2)) / max(len(df1), len(df2)) * 50 if max(len(df1), len(df2)) > 0 else 0
            similarity_score = column_similarity + size_similarity
            
            return {
                'similarity_score': round(similarity_score, 2),
                'common_columns': common,
                'unique_columns_1': unique1,
                'unique_columns_2': unique2,
                'matching_rows': int(matching_rows),
            }
        except Exception as e:
            return {
                'similarity_score': 0,
                'common_columns': [],
                'unique_columns_1': list(df1.columns),
                'unique_columns_2': list(df2.columns),
                'matching_rows': 0,
                'error': str(e),
            }


class AdvancedStatistics:
    """Advanced statistical analysis beyond basic stats"""
    
    @staticmethod
    def hypothesis_testing_advanced(series):
        """Perform advanced hypothesis testing"""
        try:
            result = {
                'normality_test': {},
                'trend_analysis': {},
            }
            
            # Shapiro-Wilk test for normality
            if len(series) >= 3:
                stat, p_value = stats.shapiro(series.dropna())
                result['normality_test'] = {
                    'is_normal': p_value > 0.05,
                    'p_value': float(p_value),
                    'statistic': float(stat),
                }
            
            # Trend analysis using linear regression
            non_null_values = series.dropna()
            if len(non_null_values) > 2:
                x = np.arange(len(non_null_values))
                y = non_null_values.values
                slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
                result['trend_analysis'] = {
                    'slope': float(slope),
                    'r_squared': float(r_value**2),
                    'p_value': float(p_value),
                    'direction': 'increasing' if slope > 0 else 'decreasing',
                }
            
            return result
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def distribution_shape(series):
        """Analyze distribution shape"""
        try:
            series_clean = series.dropna()
            return {
                'skewness': float(stats.skew(series_clean)),
                'kurtosis': float(stats.kurtosis(series_clean)),
                'is_symmetric': abs(float(stats.skew(series_clean))) < 0.5,
            }
        except:
            return {}


class DataQualityScoring:
    """Advanced data quality assessment"""
    
    @staticmethod
    def calculate_quality_score(df):
        """Calculate overall data quality score (0-100)"""
        try:
            scores = []
            
            # Completeness score
            completeness = (1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
            scores.append(completeness * 0.3)  # 30% weight
            
            # Uniqueness score (avoid duplicates)
            duplication_ratio = 1 - (len(df.drop_duplicates()) / len(df))
            uniqueness = (1 - duplication_ratio) * 100
            scores.append(uniqueness * 0.3)  # 30% weight
            
            # Consistency score (numeric columns only)
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                consistency = 100
                for col in numeric_cols:
                    outliers = df[col].apply(lambda x: abs(x - df[col].mean()) > 3 * df[col].std() if pd.notna(x) else False).sum()
                    outlier_ratio = outliers / len(df)
                    consistency *= (1 - outlier_ratio)
                scores.append(consistency * 0.4)  # 40% weight
            else:
                scores.append(100 * 0.4)
            
            return round(sum(scores) / 0.3 / 3 if len(numeric_cols) > 0 else sum(scores) / 0.6, 2)
        except:
            return 0
    
    @staticmethod
    def get_data_quality_report(df):
        """Generate comprehensive data quality report"""
        try:
            total_cells = len(df) * len(df.columns)
            empty_cells = df.isnull().sum().sum()
            
            report = {
                'total_cells': int(total_cells),
                'empty_cells': int(empty_cells),
                'completeness_percent': round((1 - empty_cells / total_cells) * 100, 2),
                'duplicate_rows': len(df) - len(df.drop_duplicates()),
                'duplicate_percent': round((1 - len(df.drop_duplicates()) / len(df)) * 100, 2),
                'numeric_columns': len(df.select_dtypes(include=[np.number]).columns),
                'text_columns': len(df.select_dtypes(include=['object']).columns),
                'quality_score': DataQualityScoring.calculate_quality_score(df),
                'columns_with_issues': {}
            }
            
            # Identify problematic columns
            for col in df.columns:
                missing_percent = (df[col].isnull().sum() / len(df)) * 100
                if missing_percent > 10:
                    report['columns_with_issues'][col] = f'{missing_percent:.1f}% missing'
            
            return report
        except Exception as e:
            return {'error': str(e)}


class DimensionalityAnalysis:
    """PCA and dimensionality insights"""
    
    @staticmethod
    def pca_analysis(df, n_components=2):
        """Perform PCA analysis on numeric data"""
        try:
            # Select only numeric columns
            numeric_df = df.select_dtypes(include=[np.number]).dropna()
            
            if numeric_df.empty or len(numeric_df) < n_components:
                return {'error': 'Insufficient numeric data'}
            
            # Standardize data
            mean = numeric_df.mean()
            std = numeric_df.std()
            normalized = (numeric_df - mean) / std
            
            # Apply PCA
            pca = PCA(n_components=min(n_components, len(normalized.columns)))
            pca.fit(normalized)
            
            return {
                'explained_variance': [float(x) for x in pca.explained_variance_ratio_],
                'cumulative_variance': [float(x) for x in np.cumsum(pca.explained_variance_ratio_)],
                'total_variance_explained': round(float(np.sum(pca.explained_variance_ratio_[:n_components])), 2),
                'n_components': int(pca.n_components_),
            }
        except Exception as e:
            return {'error': str(e)}


class TimeSeriesInsights:
    """Time series analysis utilities"""
    
    @staticmethod
    def detect_seasonality(series, period=12):
        """Detect seasonality in time series data"""
        try:
            if len(series) < period * 2:
                return {'detectable': False}
            
            # Simple seasonality detection using autocorrelation
            from pandas.plotting import autocorrelation_plot
            acf_values = []
            for lag in range(1, min(period + 1, len(series))):
                series_lagged = series.shift(lag).dropna()
                correlation = series.corr(series_lagged)
                acf_values.append(correlation)
            
            # Check if there's significant correlation at seasonal lag
            seasonal_correlation = acf_values[period-1] if period-1 < len(acf_values) else 0
            
            return {
                'detectable': seasonal_correlation > 0.3,
                'seasonal_strength': float(seasonal_correlation),
                'estimated_period': int(period),
            }
        except Exception as e:
            return {'error': str(e)}


class FeatureEngineering:
    """Feature engineering utilities"""
    
    @staticmethod
    def suggest_transformations(df):
        """Suggest data transformations"""
        suggestions = []
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            series = df[col].dropna()
            if len(series) == 0:
                continue
            
            # Check for log transformation
            if (series > 0).all() and series.max() / series.min() > 10:
                suggestions.append({
                    'column': col,
                    'transformation': 'log',
                    'reason': 'Wide range of values (high ratio of max/min)',
                })
            
            # Check for standardization
            if series.std() > 0:
                cv = series.std() / series.mean()
                if cv > 1:
                    suggestions.append({
                        'column': col,
                        'transformation': 'standardize',
                        'reason': f'High coefficient of variation ({cv:.2f})',
                    })
            
            # Check for outliers
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((series < Q1 - 1.5*IQR) | (series > Q3 + 1.5*IQR)).sum()
            if outliers > len(series) * 0.05:
                suggestions.append({
                    'column': col,
                    'transformation': 'robust_scale',
                    'reason': f'{outliers} outliers detected ({outliers/len(series)*100:.1f}%)',
                })
        
        return suggestions
