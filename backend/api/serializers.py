from rest_framework import serializers
from .models import Dataset, DatasetFavorite, DatasetVersion, ValidationRule, AuditLog, ComparisonResult

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'file', 'filename', 'uploaded_at', 'file_size', 'row_count', 'column_count', 'description']
        read_only_fields = ['filename', 'uploaded_at', 'id', 'file_size', 'row_count', 'column_count']


class DatasetDetailSerializer(serializers.ModelSerializer):
    """Detailed dataset info with related objects"""
    is_favorite = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()
    rule_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Dataset
        fields = ['id', 'file', 'filename', 'uploaded_at', 'file_size', 'row_count', 'column_count', 
                  'description', 'is_favorite', 'version_count', 'rule_count']
        read_only_fields = ['id', 'uploaded_at', 'file_size', 'row_count', 'column_count']
    
    def get_is_favorite(self, obj):
        return hasattr(obj, 'favorite')
    
    def get_version_count(self, obj):
        return obj.versions.count()
    
    def get_rule_count(self, obj):
        return obj.validation_rules.filter(is_active=True).count()


class DatasetFavoriteSerializer(serializers.ModelSerializer):
    dataset = DatasetSerializer(read_only=True)
    
    class Meta:
        model = DatasetFavorite
        fields = ['id', 'dataset', 'added_at']
        read_only_fields = ['added_at', 'id']


class DatasetVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetVersion
        fields = ['id', 'version_number', 'file', 'created_at', 'description']
        read_only_fields = ['id', 'version_number', 'created_at']


class ValidationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationRule
        fields = ['id', 'column_name', 'rule_type', 'rule_value', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'description', 'details', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']


class ComparisonResultSerializer(serializers.ModelSerializer):
    dataset1_name = serializers.CharField(source='dataset1.filename', read_only=True)
    dataset2_name = serializers.CharField(source='dataset2.filename', read_only=True)
    
    class Meta:
        model = ComparisonResult
        fields = ['id', 'dataset1', 'dataset2', 'dataset1_name', 'dataset2_name', 'similarity_score',
                  'common_columns', 'unique_columns_1', 'unique_columns_2', 'matching_rows', 'created_at']
        read_only_fields = ['id', 'similarity_score', 'common_columns', 'unique_columns_1', 
                          'unique_columns_2', 'matching_rows', 'created_at']
