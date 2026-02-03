from django.db import models
import os
from django.utils import timezone

class Dataset(models.Model):
    file = models.FileField(upload_to='csv_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255, blank=True)
    file_size = models.BigIntegerField(default=0)  # in bytes
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.filename = os.path.basename(self.file.name)
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return self.filename


class DatasetFavorite(models.Model):
    """Track user favorites/bookmarks"""
    dataset = models.OneToOneField(Dataset, on_delete=models.CASCADE, related_name='favorite')
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Favorite: {self.dataset.filename}"


class DatasetVersion(models.Model):
    """Track dataset versions/history"""
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField(default=1)
    file = models.FileField(upload_to='csv_versions/')
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.dataset.filename} v{self.version_number}"


class ValidationRule(models.Model):
    """Store data validation rules"""
    RULE_TYPES = [
        ('required', 'Required Field'),
        ('numeric', 'Numeric Values'),
        ('text', 'Text Values'),
        ('range', 'Value Range'),
        ('format', 'Format Pattern'),
        ('unique', 'Unique Values'),
        ('custom', 'Custom Rule'),
    ]
    
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='validation_rules')
    column_name = models.CharField(max_length=255)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    rule_value = models.JSONField(default=dict)  # stores rule parameters
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.column_name} - {self.rule_type}"


class AuditLog(models.Model):
    """Track all dataset operations"""
    ACTION_TYPES = [
        ('upload', 'Upload'),
        ('view', 'View'),
        ('export', 'Export'),
        ('analyze', 'Analyze'),
        ('delete', 'Delete'),
        ('validate', 'Validate'),
        ('share', 'Share'),
    ]
    
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField(blank=True)
    details = models.JSONField(default=dict)  # metadata about the action
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.dataset.filename} - {self.action}"


class ComparisonResult(models.Model):
    """Store comparison results between datasets"""
    dataset1 = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='comparisons_as_first')
    dataset2 = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='comparisons_as_second')
    similarity_score = models.FloatField(default=0.0)  # 0-100
    common_columns = models.JSONField(default=list)
    unique_columns_1 = models.JSONField(default=list)
    unique_columns_2 = models.JSONField(default=list)
    matching_rows = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('dataset1', 'dataset2')
    
    def __str__(self):
        return f"Comparison: {self.dataset1.filename} vs {self.dataset2.filename}"
