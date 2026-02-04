import json
import csv
from io import StringIO, BytesIO
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Dataset
import logging
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

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


class ReportPDFView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            df = pd.read_csv(dataset.file.path)
            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            row_count = int(len(df))
            column_count = int(len(df.columns))

            # Data quality
            total_cells = row_count * column_count
            missing_cells = int(df.isnull().sum().sum())
            missing_pct = (missing_cells / total_cells * 100) if total_cells else 0
            duplicate_rows = int(df.duplicated().sum())

            # Stats (top 5 numeric columns)
            stats_rows = []
            for col in numeric_cols[:5]:
                col_data = df[col].dropna()
                if len(col_data) == 0:
                    continue
                stats_rows.append([
                    col,
                    f"{col_data.mean():.2f}",
                    f"{col_data.median():.2f}",
                    f"{col_data.std():.2f}",
                    f"{col_data.min():.2f}",
                    f"{col_data.max():.2f}",
                ])

            # Correlations (top 5)
            corr_rows = []
            if len(numeric_cols) > 1:
                corr_matrix = df[numeric_cols].corr()
                corr_pairs = []
                for i, col1 in enumerate(numeric_cols):
                    for col2 in numeric_cols[i+1:]:
                        corr_pairs.append((col1, col2, float(corr_matrix.loc[col1, col2])))
                corr_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
                for col1, col2, val in corr_pairs[:5]:
                    corr_rows.append([col1, col2, f"{val:.3f}"])

            # Outliers (top 5)
            outlier_rows = []
            outlier_items = []
            for col in numeric_cols:
                col_data = df[col].dropna()
                if len(col_data) == 0:
                    continue
                q1 = col_data.quantile(0.25)
                q3 = col_data.quantile(0.75)
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                outlier_count = int(((col_data < lower) | (col_data > upper)).sum())
                if outlier_count > 0:
                    outlier_items.append((col, outlier_count))
            outlier_items.sort(key=lambda x: x[1], reverse=True)
            for col, count in outlier_items[:5]:
                outlier_rows.append([col, str(count)])

            # Build charts
            chart_images = []
            chart_summaries = []

            # Data quality pie
            fig1, ax1 = plt.subplots(figsize=(3.5, 3))
            ax1.pie(
                [total_cells - missing_cells, missing_cells],
                labels=["Complete", "Missing"],
                autopct="%1.1f%%",
                colors=["#2563eb", "#ef4444"],
            )
            ax1.set_title("Data Quality")
            img1 = BytesIO()
            fig1.savefig(img1, format="png", bbox_inches="tight")
            plt.close(fig1)
            img1.seek(0)
            chart_images.append(("Data Quality Overview", img1))
            chart_summaries.append(
                "Completeness: {:.1f}% | Missing: {} cells | Duplicates: {} rows".format(
                    ((total_cells - missing_cells) / total_cells * 100) if total_cells else 0,
                    missing_cells,
                    duplicate_rows,
                )
            )

            # Correlation barh
            if corr_rows:
                labels = [f"{r[0]} vs {r[1]}" for r in corr_rows]
                values = [float(r[2]) for r in corr_rows]
                fig2, ax2 = plt.subplots(figsize=(4, 2.5))
                ax2.barh(labels, values, color="#0ea5e9")
                ax2.set_title("Top Correlations")
                img2 = BytesIO()
                fig2.savefig(img2, format="png", bbox_inches="tight")
                plt.close(fig2)
                img2.seek(0)
                chart_images.append(("Top Correlations", img2))
                top_corr = corr_rows[0]
                chart_summaries.append(
                    f"Strongest pair: {top_corr[0]} vs {top_corr[1]} (corr {top_corr[2]})"
                )

            # Outliers bar
            if outlier_rows:
                labels = [r[0] for r in outlier_rows]
                values = [int(r[1]) for r in outlier_rows]
                fig3, ax3 = plt.subplots(figsize=(4, 2.5))
                ax3.bar(labels, values, color="#f59e0b")
                ax3.set_title("Outliers (Top 5)")
                ax3.tick_params(axis='x', rotation=45)
                img3 = BytesIO()
                fig3.savefig(img3, format="png", bbox_inches="tight")
                plt.close(fig3)
                img3.seek(0)
                chart_images.append(("Outliers (Top 5)", img3))
                total_outliers = sum(int(r[1]) for r in outlier_rows)
                chart_summaries.append(
                    f"Total outliers in top variables: {total_outliers}"
                )

            # Trend analysis (min/avg/max)
            stats_items = []
            for col in numeric_cols[:5]:
                col_data = df[col].dropna()
                if len(col_data) == 0:
                    continue
                stats_items.append({
                    "name": col[:12],
                    "min": float(col_data.min()),
                    "mean": float(col_data.mean()),
                    "max": float(col_data.max()),
                    "std": float(col_data.std()) if len(col_data) > 1 else 0.0
                })
            if stats_items:
                fig4, ax4 = plt.subplots(figsize=(4.5, 2.8))
                labels = [s["name"] for s in stats_items]
                mins = [s["min"] for s in stats_items]
                means = [s["mean"] for s in stats_items]
                maxs = [s["max"] for s in stats_items]
                ax4.plot(labels, mins, marker="o", color="#ef4444", label="Min")
                ax4.plot(labels, means, marker="o", color="#3b82f6", label="Avg")
                ax4.plot(labels, maxs, marker="o", color="#10b981", label="Max")
                ax4.set_title("Trend Analysis (Min/Avg/Max)")
                ax4.tick_params(axis='x', rotation=45)
                ax4.legend()
                img4 = BytesIO()
                fig4.savefig(img4, format="png", bbox_inches="tight")
                plt.close(fig4)
                img4.seek(0)
                chart_images.append(("Trend Analysis", img4))
                chart_summaries.append(
                    "Trend lines show min/avg/max for top numeric columns."
                )

                # Variability (CV%)
                fig5, ax5 = plt.subplots(figsize=(4.5, 2.6))
                cvs = []
                for s in stats_items:
                    mean = abs(s["mean"]) if abs(s["mean"]) > 0 else 1.0
                    cvs.append((s["std"] / mean) * 100)
                ax5.bar(labels, cvs, color="#f59e0b")
                ax5.set_title("Variability (CV%)")
                ax5.tick_params(axis='x', rotation=45)
                img5 = BytesIO()
                fig5.savefig(img5, format="png", bbox_inches="tight")
                plt.close(fig5)
                img5.seek(0)
                chart_images.append(("Variability (CV%)", img5))
                avg_cv = sum(cvs) / len(cvs) if cvs else 0
                chart_summaries.append(f"Average CV across shown columns: {avg_cv:.2f}%")

            # Distribution (first numeric column)
            if numeric_cols:
                col = numeric_cols[0]
                col_data = df[col].dropna()
                if len(col_data) > 0:
                    fig6, ax6 = plt.subplots(figsize=(4.5, 2.6))
                    ax6.hist(col_data, bins=15, color="#2563eb", alpha=0.85)
                    ax6.set_title(f"Distribution: {col}")
                    img6 = BytesIO()
                    fig6.savefig(img6, format="png", bbox_inches="tight")
                    plt.close(fig6)
                    img6.seek(0)
                    chart_images.append(("Distribution", img6))
                    chart_summaries.append(
                        f"Distribution summary for {col}: mean {col_data.mean():.2f}, std {col_data.std():.2f}"
                    )

            # Build PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            styles.add(ParagraphStyle(name="Small", fontSize=9, leading=11))
            styles.add(ParagraphStyle(name="SectionTitle", fontSize=12, leading=14, spaceBefore=8, spaceAfter=6))
            elements = []

            def styled_table(data, col_widths=None):
                table = Table(data, colWidths=col_widths, hAlign="LEFT")
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5f5")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]))
                # Alternating rows
                for r in range(1, len(data)):
                    if r % 2 == 0:
                        table.setStyle(TableStyle([("BACKGROUND", (0, r), (-1, r), colors.HexColor("#f8fafc"))]))
                return table

            elements.append(Paragraph("ChemViz Summary Report", styles["Title"]))
            elements.append(Paragraph("Automated dataset overview and analytics summary", styles["Small"]))
            elements.append(Spacer(1, 10))

            # Dataset Summary
            elements.append(Paragraph("Dataset Summary", styles["SectionTitle"]))
            summary_data = [
                ["Filename", dataset.filename],
                ["Uploaded", str(dataset.uploaded_at)],
                ["Rows", f"{row_count}"],
                ["Columns", f"{column_count}"],
            ]
            elements.append(styled_table([["Field", "Value"]] + summary_data, col_widths=[120, 380]))
            elements.append(Spacer(1, 10))

            # Data Quality Summary
            elements.append(Paragraph("Data Quality Summary", styles["SectionTitle"]))
            quality_rows = [
                ["Total Cells", total_cells],
                ["Missing Cells", missing_cells],
                ["Missing %", f"{missing_pct:.2f}%"],
                ["Duplicate Rows", duplicate_rows],
            ]
            elements.append(styled_table([["Metric", "Value"]] + quality_rows, col_widths=[180, 320]))
            elements.append(Spacer(1, 10))

            # Key Statistics
            if stats_rows:
                elements.append(Paragraph("Key Statistics (Top 5 Numeric Columns)", styles["SectionTitle"]))
                elements.append(styled_table(
                    [["Variable", "Mean", "Median", "Std Dev", "Min", "Max"]] + stats_rows,
                    col_widths=[120, 60, 60, 60, 60, 60],
                ))
                elements.append(Spacer(1, 10))

            # Correlations
            if corr_rows:
                elements.append(Paragraph("Top Correlations", styles["SectionTitle"]))
                elements.append(styled_table(
                    [["Variable 1", "Variable 2", "Correlation"]] + corr_rows,
                    col_widths=[160, 160, 100],
                ))
                elements.append(Spacer(1, 10))

            # Outliers
            if outlier_rows:
                elements.append(Paragraph("Outliers (Top 5)", styles["SectionTitle"]))
                elements.append(styled_table(
                    [["Variable", "Outlier Count"]] + outlier_rows,
                    col_widths=[200, 120],
                ))
                elements.append(Spacer(1, 10))

            # Charts
            if chart_images:
                elements.append(Paragraph("Charts", styles["SectionTitle"]))
                for i, (title, img) in enumerate(chart_images):
                    elements.append(Paragraph(title, styles["Small"]))
                    elements.append(Image(img, width=420, height=260))
                    if i < len(chart_summaries):
                        elements.append(Paragraph(chart_summaries[i], styles["Small"]))
                    elements.append(Spacer(1, 8))

            doc.build(elements)
            buffer.seek(0)

            response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
            response['Content-Disposition'] = f'attachment; filename="{dataset.filename.replace(".csv", "")}-report.pdf"'
            return response

        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)
        except Exception as e:
            logger.error(f"Report error: {str(e)}")
            return Response({"error": str(e)}, status=500)
