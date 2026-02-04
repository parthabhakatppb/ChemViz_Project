from django.urls import path
from .views import FileUploadView, DashboardDataView, RawDataView, HistoryView, SignupView
from .export_views import ExportDataView, SearchDatasetsView, ReportPDFView
from .extended_views import (
    FavoriteDatasetView, GetFavoritesView, DatasetVersionView,
    ValidationRuleView, ValidateDatasetView, ComparisonView,
    AdvancedAnalyticsView, AuditLogView
)

urlpatterns = [
    # Core endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('dashboard/<int:pk>/', DashboardDataView.as_view(), name='dashboard-data'),
    path('raw-data/<int:pk>/', RawDataView.as_view(), name='raw-data'),
    path('history/', HistoryView.as_view(), name='history'),
    path('export/<int:pk>/<str:format>/', ExportDataView.as_view(), name='export-data'),
    path('report/<int:pk>/', ReportPDFView.as_view(), name='report-pdf'),
    path('search/', SearchDatasetsView.as_view(), name='search-datasets'),
    
    # Favorites
    path('favorites/', GetFavoritesView.as_view(), name='get-favorites'),
    path('favorite/<int:pk>/', FavoriteDatasetView.as_view(), name='toggle-favorite'),
    
    # Versioning
    path('versions/<int:pk>/', DatasetVersionView.as_view(), name='dataset-versions'),
    
    # Validation
    path('validation-rules/<int:pk>/', ValidationRuleView.as_view(), name='validation-rules'),
    path('validate/<int:pk>/', ValidateDatasetView.as_view(), name='validate-dataset'),
    
    # Comparison
    path('compare/', ComparisonView.as_view(), name='compare-datasets'),
    
    # Advanced Analytics
    path('advanced-analytics/<int:pk>/', AdvancedAnalyticsView.as_view(), name='advanced-analytics'),
    
    # Audit Logs
    path('audit-logs/', AuditLogView.as_view(), name='audit-logs'),
    path('audit-logs/<int:pk>/', AuditLogView.as_view(), name='audit-logs-dataset'),
]
