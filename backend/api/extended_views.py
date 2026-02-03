"""Extended API views with advanced analytics and data management features"""
import pandas as pd
import logging
import json
from django.utils import timezone
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import (Dataset, DatasetFavorite, DatasetVersion, ValidationRule, 
                     AuditLog, ComparisonResult)
from .serializers import (DatasetSerializer, DatasetDetailSerializer, DatasetFavoriteSerializer,
                          DatasetVersionSerializer, ValidationRuleSerializer, 
                          AuditLogSerializer, ComparisonResultSerializer)
from .ml_models import MLAnalytics
from .analysis_utils import (ComparisonAnalytics, AdvancedStatistics, DataQualityScoring,
                             DimensionalityAnalysis, TimeSeriesInsights, FeatureEngineering)

logger = logging.getLogger(__name__)


class FavoriteDatasetView(APIView):
    """Add/remove datasets from favorites"""
    
    def post(self, request, pk):
        """Add dataset to favorites"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            favorite, created = DatasetFavorite.objects.get_or_create(dataset=dataset)
            
            # Log action
            AuditLog.objects.create(
                dataset=dataset,
                action='favorite',
                description=f'Dataset added to favorites',
                ip_address=self.get_client_ip(request),
            )
            
            serializer = DatasetFavoriteSerializer(favorite)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        """Remove dataset from favorites"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            dataset.favorite.delete()
            
            # Log action
            AuditLog.objects.create(
                dataset=dataset,
                action='unfavorite',
                description=f'Dataset removed from favorites',
                ip_address=self.get_client_ip(request),
            )
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class GetFavoritesView(APIView):
    """Retrieve all favorite datasets"""
    
    def get(self, request):
        favorites = DatasetFavorite.objects.all().select_related('dataset')
        serializer = DatasetFavoriteSerializer(favorites, many=True)
        return Response(serializer.data)


class DatasetVersionView(APIView):
    """Manage dataset versions"""
    
    def get(self, request, pk):
        """Get all versions of a dataset"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            versions = dataset.versions.all()
            serializer = DatasetVersionSerializer(versions, many=True)
            return Response(serializer.data)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, pk):
        """Create a new version of a dataset"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            
            # Create version
            version_number = dataset.versions.count() + 1
            version = DatasetVersion.objects.create(
                dataset=dataset,
                version_number=version_number,
                file=dataset.file,
                description=request.data.get('description', ''),
            )
            
            # Log action
            AuditLog.objects.create(
                dataset=dataset,
                action='version',
                description=f'Version {version_number} created',
                ip_address=FavoriteDatasetView.get_client_ip(request),
            )
            
            serializer = DatasetVersionSerializer(version)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)


class ValidationRuleView(APIView):
    """Manage data validation rules"""
    
    def get(self, request, pk):
        """Get validation rules for a dataset"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            rules = dataset.validation_rules.all()
            serializer = ValidationRuleSerializer(rules, many=True)
            return Response(serializer.data)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, pk):
        """Create a validation rule"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            serializer = ValidationRuleSerializer(data=request.data)
            if serializer.is_valid():
                rule = serializer.save(dataset=dataset)
                
                # Log action
                AuditLog.objects.create(
                    dataset=dataset,
                    action='validate',
                    description=f'Validation rule created for {rule.column_name}',
                    ip_address=FavoriteDatasetView.get_client_ip(request),
                )
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)


class ValidateDatasetView(APIView):
    """Validate dataset against rules"""
    
    def get(self, request, pk):
        """Run validation against stored rules"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            df = pd.read_csv(dataset.file.path)
            rules = dataset.validation_rules.filter(is_active=True)
            
            validation_results = {
                'dataset_id': dataset.id,
                'filename': dataset.filename,
                'total_rows': len(df),
                'validation_issues': [],
                'summary': {
                    'total_issues': 0,
                    'affected_rows': set(),
                }
            }
            
            for rule in rules:
                col = rule.column_name
                if col not in df.columns:
                    validation_results['validation_issues'].append({
                        'column': col,
                        'type': rule.rule_type,
                        'issue': 'Column not found',
                    })
                    continue
                
                # Check rule type
                if rule.rule_type == 'required':
                    missing = df[col].isnull().sum()
                    if missing > 0:
                        validation_results['validation_issues'].append({
                            'column': col,
                            'type': 'required',
                            'missing_count': int(missing),
                            'missing_percent': round(missing/len(df)*100, 2),
                        })
                        validation_results['summary']['total_issues'] += missing
                
                elif rule.rule_type == 'numeric':
                    non_numeric = df[col].apply(lambda x: not isinstance(x, (int, float)) and pd.notna(x)).sum()
                    if non_numeric > 0:
                        validation_results['validation_issues'].append({
                            'column': col,
                            'type': 'numeric',
                            'non_numeric_count': int(non_numeric),
                        })
                        validation_results['summary']['total_issues'] += non_numeric
            
            validation_results['summary']['affected_rows'] = len(validation_results['summary']['affected_rows'])
            
            return Response(validation_results)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)


class ComparisonView(APIView):
    """Compare multiple datasets"""
    
    def post(self, request):
        """Compare two datasets"""
        try:
            dataset1_id = request.data.get('dataset1_id')
            dataset2_id = request.data.get('dataset2_id')
            
            dataset1 = Dataset.objects.get(pk=dataset1_id)
            dataset2 = Dataset.objects.get(pk=dataset2_id)
            
            df1 = pd.read_csv(dataset1.file.path)
            df2 = pd.read_csv(dataset2.file.path)
            
            # Get comparison results
            comparison_data = ComparisonAnalytics.compare_datasets(df1, df2)
            
            # Save to database
            comparison_result, created = ComparisonResult.objects.get_or_create(
                dataset1=dataset1,
                dataset2=dataset2,
                defaults={
                    'similarity_score': comparison_data['similarity_score'],
                    'common_columns': comparison_data['common_columns'],
                    'unique_columns_1': comparison_data['unique_columns_1'],
                    'unique_columns_2': comparison_data['unique_columns_2'],
                    'matching_rows': comparison_data['matching_rows'],
                }
            )
            
            # Log action
            for dataset in [dataset1, dataset2]:
                AuditLog.objects.create(
                    dataset=dataset,
                    action='compare',
                    description=f'Dataset compared with {dataset2.filename if dataset == dataset1 else dataset1.filename}',
                    ip_address=FavoriteDatasetView.get_client_ip(request),
                )
            
            serializer = ComparisonResultSerializer(comparison_result)
            return Response(serializer.data)
        except Dataset.DoesNotExist:
            return Response({'error': 'One or both datasets not found'}, status=status.HTTP_404_NOT_FOUND)


class AdvancedAnalyticsView(APIView):
    """Comprehensive advanced analytics"""
    
    def get(self, request, pk):
        """Get advanced analytics for a dataset"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            df = pd.read_csv(dataset.file.path)
            
            # Normalize column names
            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
            
            analytics = {
                'dataset_id': dataset.id,
                'filename': dataset.filename,
            }
            
            # Data quality scoring
            analytics['data_quality'] = DataQualityScoring.get_data_quality_report(df)
            
            # Advanced statistics
            numeric_cols = df.select_dtypes(include=['number']).columns
            analytics['advanced_statistics'] = {}
            for col in numeric_cols:
                analytics['advanced_statistics'][col] = AdvancedStatistics.hypothesis_testing_advanced(df[col])
            
            # PCA analysis
            analytics['dimensionality'] = DimensionalityAnalysis.pca_analysis(df)
            
            # Time series insights
            if len(df) > 20 and numeric_cols.any():
                analytics['time_series'] = TimeSeriesInsights.detect_seasonality(df[numeric_cols[0]])
            
            # Feature engineering suggestions
            analytics['suggested_transformations'] = FeatureEngineering.suggest_transformations(df)
            
            return Response(analytics)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)


class AuditLogView(APIView):
    """View audit logs"""
    
    def get(self, request, pk=None):
        """Get audit logs for a dataset or all logs"""
        if pk:
            try:
                dataset = Dataset.objects.get(pk=pk)
                logs = dataset.audit_logs.all()
            except Dataset.DoesNotExist:
                return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            logs = AuditLog.objects.all()
        
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)
