import json
import csv
from io import StringIO, BytesIO
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Dataset
import logging

logger = logging.getLogger(__name__)

class ExportDataView(APIView):
    def get(self, request, pk, format=None):
        try:
            dataset = Dataset.objects.get(pk=pk)
            df = pd.read_csv(dataset.file.path)
            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
            
            if format == 'json':
                response = HttpResponse(
                    df.to_json(orient='records'),
                    content_type='application/json'
                )
                response['Content-Disposition'] = f'attachment; filename="{dataset.filename.replace(".csv", ".json")}"'
                return response
            
            elif format == 'excel':
                output = BytesIO()
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    df.to_excel(writer, sheet_name='Data', index=False)
                output.seek(0)
                response = HttpResponse(
                    output.getvalue(),
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="{dataset.filename.replace(".csv", ".xlsx")}"'
                return response
            
            elif format == 'csv':
                response = HttpResponse(
                    df.to_csv(index=False),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = f'attachment; filename="{dataset.filename}"'
                return response
            
            else:
                return Response({"error": "Invalid format"}, status=400)
                
        except Exception as e:
            logger.error(f"Export error: {str(e)}")
            return Response({"error": str(e)}, status=500)


class SearchDatasetsView(APIView):
    def get(self, request):
        try:
            query = request.query_params.get('q', '').lower()
            datasets = Dataset.objects.filter(filename__icontains=query).order_by('-uploaded_at')[:10]
            
            result = []
            for d in datasets:
                result.append({
                    'id': d.id,
                    'filename': d.filename,
                    'uploaded_at': d.uploaded_at,
                    'file_size': d.file.size if d.file else 0,
                })
            
            return Response(result)
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return Response({"error": str(e)}, status=500)
