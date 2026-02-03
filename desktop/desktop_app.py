import sys
import json
from datetime import datetime

import requests
import matplotlib
matplotlib.use('Qt5Agg')
from PyQt5.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QPushButton,
    QLabel,
    QFileDialog,
    QTableWidget,
    QTableWidgetItem,
    QTabWidget,
    QHBoxLayout,
    QHeaderView,
    QMessageBox,
    QListWidget,
    QListWidgetItem,
    QSizePolicy,
    QScrollArea,
    QLineEdit,
    QComboBox,
    QGroupBox,
    QGridLayout,
)
from PyQt5.QtCore import Qt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
import matplotlib.pyplot as plt

API_URL = "http://127.0.0.1:8000/api"

THEMES = {
    "dark": {
        "bg": "#0f172a",
        "panel": "#0b1220",
        "panel_alt": "#1e293b",
        "text": "#e2e8f0",
        "muted": "#94a3b8",
        "border": "#1f2937",
        "accent": "#2563eb",
        "accent_soft": "#38bdf8",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "danger": "#ef4444",
        "chart_bg": "#0f172a",
        "chart_text": "#e2e8f0",
    },
    "light": {
        "bg": "#f8fafc",
        "panel": "#ffffff",
        "panel_alt": "#f1f5f9",
        "text": "#0f172a",
        "muted": "#64748b",
        "border": "#e2e8f0",
        "accent": "#2563eb",
        "accent_soft": "#0ea5e9",
        "success": "#16a34a",
        "warning": "#d97706",
        "danger": "#dc2626",
        "chart_bg": "#ffffff",
        "chart_text": "#0f172a",
    },
}

CHART_COLORS = ["#2563eb", "#3b82f6", "#0ea5e9", "#38bdf8", "#22d3ee"]

class ChemVizDesktop(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChemViz - Industrial Visualizer")
        self.setGeometry(100, 100, 1200, 800)
        self.current_theme = "dark"
        
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        # Main layout split: sidebar + main area
        self.layout = QHBoxLayout(self.central_widget)
        self.layout.setContentsMargins(16, 16, 16, 16)
        self.layout.setSpacing(16)

        # Sidebar: recent files
        self.sidebar = QWidget()
        self.sidebar.setFixedWidth(260)
        self.sidebar.setObjectName("Sidebar")
        self.sidebar_layout = QVBoxLayout(self.sidebar)
        self.sidebar_layout.setContentsMargins(12, 12, 12, 12)
        self.sidebar_layout.setSpacing(10)
        self.recent_label = QLabel("Recent Files")
        self.recent_label.setObjectName("SectionLabel")
        self.sidebar_layout.addWidget(self.recent_label)
        self.list_widget = QListWidget()
        self.list_widget.setObjectName("SidebarList")
        self.list_widget.itemClicked.connect(lambda itm: self.load_from_item(itm))
        self.sidebar_layout.addWidget(self.list_widget)
        self.refresh_btn = QPushButton("Refresh")
        self.refresh_btn.setObjectName("SecondaryButton")
        self.refresh_btn.clicked.connect(self.fetch_history)
        self.sidebar_layout.addWidget(self.refresh_btn)

        self.layout.addWidget(self.sidebar)

        # Header
        self.header = QLabel("ChemViz Desktop Dashboard")
        self.header.setObjectName("HeaderTitle")
        # Right/main content container
        self.main_container = QWidget()
        self.main_layout = QVBoxLayout(self.main_container)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(12)
        self.layout.addWidget(self.main_container)

        header_row = QHBoxLayout()
        header_row.addWidget(self.header)
        header_row.addStretch()
        self.theme_toggle_btn = QPushButton("Light Mode")
        self.theme_toggle_btn.setObjectName("SecondaryButton")
        self.theme_toggle_btn.clicked.connect(self.toggle_theme)
        header_row.addWidget(self.theme_toggle_btn)
        self.main_layout.addLayout(header_row)

        # Controls
        control_layout = QHBoxLayout()
        control_layout.setSpacing(10)
        self.upload_btn = QPushButton("Upload CSV Dataset")
        self.upload_btn.setObjectName("PrimaryButton")
        self.upload_btn.clicked.connect(self.upload_file)
        control_layout.addWidget(self.upload_btn)
        
        self.export_btn = QPushButton("Export as CSV")
        self.export_btn.setObjectName("SuccessButton")
        self.export_btn.clicked.connect(self.export_data)
        control_layout.addWidget(self.export_btn)
        
        self.status_label = QLabel("System Ready. Connect to Django Backend.")
        self.status_label.setObjectName("StatusLabel")
        control_layout.addWidget(self.status_label)
        self.main_layout.addLayout(control_layout)

        # KPIs
        self.kpi_layout = QHBoxLayout()
        self.kpi_layout.setSpacing(12)
        self.temp_label = self.create_kpi("Avg Temp", "--")
        self.pres_label = self.create_kpi("Avg Pressure", "--")
        self.flow_label = self.create_kpi("Avg Flow", "--")
        self.main_layout.addLayout(self.kpi_layout)

        # Tabs
        self.tabs = QTabWidget()
        
        self.tab_dash = QWidget()
        self.tab_data = QWidget()
        self.tab_analytics = QWidget()
        self.tab_validation = QWidget()
        self.tab_favorites = QWidget()
        self.tabs.addTab(self.tab_dash, "Overview")
        self.tabs.addTab(self.tab_analytics, "Analytics")
        self.tabs.addTab(self.tab_data, "Raw Data")
        self.tabs.addTab(self.tab_validation, "Validation")
        self.tabs.addTab(self.tab_favorites, "Favorites")
        self.main_layout.addWidget(self.tabs)

        # Dashboard Tab
        self.dash_layout = QHBoxLayout(self.tab_dash)
        self.dash_layout.setContentsMargins(12, 12, 12, 12)
        self.figure, (self.ax1, self.ax2) = plt.subplots(1, 2, figsize=(10, 5), facecolor='#0f172a')
        self.canvas = FigureCanvas(self.figure)
        self.dash_layout.addWidget(self.canvas)

        # Data Tab
        self.data_layout = QVBoxLayout(self.tab_data)
        self.data_layout.setContentsMargins(12, 12, 12, 12)
        self.data_layout.setSpacing(10)

        data_controls = QHBoxLayout()
        data_controls.setSpacing(8)
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search across all columns...")
        self.search_input.textChanged.connect(self.apply_raw_filters)
        data_controls.addWidget(self.search_input)

        self.rows_combo = QComboBox()
        self.rows_combo.addItems(["5", "10", "25", "50", "100", "All"])
        self.rows_combo.currentIndexChanged.connect(self.apply_raw_filters)
        data_controls.addWidget(self.rows_combo)
        self.data_layout.addLayout(data_controls)

        columns_group = QGroupBox("Column Visibility")
        columns_group.setObjectName("SectionGroup")
        columns_layout = QVBoxLayout(columns_group)
        columns_layout.setContentsMargins(10, 10, 10, 10)
        columns_layout.setSpacing(6)
        self.columns_list = QListWidget()
        self.columns_list.itemChanged.connect(self.apply_raw_filters)
        columns_layout.addWidget(self.columns_list)
        self.data_layout.addWidget(columns_group)

        self.table = QTableWidget()
        self.table.setAlternatingRowColors(True)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setSelectionMode(QTableWidget.SingleSelection)
        self.table.cellDoubleClicked.connect(self.show_row_details)
        self.data_layout.addWidget(self.table)

        # Analytics Tab
        self.analytics_layout = QVBoxLayout(self.tab_analytics)
        self.analytics_layout.setContentsMargins(12, 12, 12, 12)
        self.analytics_scroll = QScrollArea()
        self.analytics_scroll.setWidgetResizable(True)
        self.analytics_widget = QWidget()
        self.analytics_content = QVBoxLayout(self.analytics_widget)
        self.analytics_content.setContentsMargins(0, 0, 0, 0)
        self.analytics_content.setSpacing(12)
        self.analytics_scroll.setWidget(self.analytics_widget)
        self.analytics_layout.addWidget(self.analytics_scroll)
        self.analytics_canvas = None
        self.analytics_fig = None
        self.analytics_charts = []

        # Validation Tab
        self.validation_layout = QVBoxLayout(self.tab_validation)
        self.validation_layout.setContentsMargins(12, 12, 12, 12)
        self.validation_layout.setSpacing(10)
        self.validation_label = QLabel("Data Quality Metrics")
        self.validation_label.setObjectName("SectionTitle")
        self.validation_layout.addWidget(self.validation_label)
        self.validation_table = QTableWidget()
        self.validation_layout.addWidget(self.validation_table)

        # Favorites Tab
        self.favorites_layout = QVBoxLayout(self.tab_favorites)
        self.favorites_layout.setContentsMargins(12, 12, 12, 12)
        self.favorites_layout.setSpacing(10)
        self.favorite_btn = QPushButton("Add to Favorites")
        self.favorite_btn.setObjectName("PrimaryButton")
        self.favorite_btn.clicked.connect(self.toggle_favorite)
        self.favorites_layout.addWidget(self.favorite_btn)
        self.favorites_list = QListWidget()
        self.favorites_list.setObjectName("PanelList")
        self.favorites_layout.addWidget(self.favorites_list)
        refresh_favs_btn = QPushButton("Refresh Favorites")
        refresh_favs_btn.setObjectName("SecondaryButton")
        refresh_favs_btn.clicked.connect(self.fetch_favorites)
        self.favorites_layout.addWidget(refresh_favs_btn)

        # Initial fetch of recent datasets
        self.fetch_history()
        self.current_dataset_id = None
        self.current_dataset = None
        self.raw_rows = []
        self.filtered_rows = []
        self.all_columns = []
        self.apply_theme()

    def create_kpi(self, title, val):
        lbl = QLabel(f"{title}\n{val}")
        lbl.setAlignment(Qt.AlignCenter)
        lbl.setObjectName("KpiCard")
        self.kpi_layout.addWidget(lbl)
        return lbl

    def create_info_card(self, title, value, subtitle=""):
        card = QWidget()
        card.setObjectName("KpiCard")
        layout = QVBoxLayout(card)
        layout.setContentsMargins(12, 10, 12, 10)
        layout.setSpacing(4)
        title_lbl = QLabel(title)
        title_lbl.setObjectName("CardTitle")
        value_lbl = QLabel(value)
        value_lbl.setObjectName("CardValue")
        value_lbl.setAlignment(Qt.AlignLeft)
        layout.addWidget(title_lbl)
        layout.addWidget(value_lbl)
        if subtitle:
            sub_lbl = QLabel(subtitle)
            sub_lbl.setObjectName("CardSub")
            layout.addWidget(sub_lbl)
        return card

    def create_section_title(self, text, subtitle=None):
        wrapper = QWidget()
        layout = QVBoxLayout(wrapper)
        layout.setContentsMargins(4, 2, 4, 2)
        layout.setSpacing(2)
        title = QLabel(text)
        title.setObjectName("SectionTitle")
        layout.addWidget(title)
        if subtitle:
            sub = QLabel(subtitle)
            sub.setObjectName("SectionSubtitle")
            layout.addWidget(sub)
        return wrapper

    def add_section(self, title, subtitle=None):
        section = QGroupBox(title)
        section.setObjectName("SectionGroup")
        layout = QVBoxLayout(section)
        layout.setContentsMargins(10, 16, 10, 10)
        layout.setSpacing(8)
        if subtitle:
            layout.addWidget(self.create_section_title("", subtitle))
        self.analytics_content.addWidget(section)
        return layout

    def add_table(self, headers, rows):
        table = QTableWidget()
        table.setColumnCount(len(headers))
        table.setHorizontalHeaderLabels(headers)
        table.setRowCount(len(rows))
        table.setAlternatingRowColors(True)
        table.setSelectionBehavior(QTableWidget.SelectRows)
        table.setSelectionMode(QTableWidget.SingleSelection)
        for i, row in enumerate(rows):
            for j, val in enumerate(row):
                table.setItem(i, j, QTableWidgetItem(str(val)))
        table.resizeColumnsToContents()
        return table

    def add_chart(self, fig, min_height=320):
        canvas = FigureCanvas(fig)
        canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        canvas.setMinimumHeight(min_height)
        self.analytics_charts.append((fig, canvas))
        return canvas

    def toggle_theme(self):
        self.current_theme = "light" if self.current_theme == "dark" else "dark"
        self.theme_toggle_btn.setText("Dark Mode" if self.current_theme == "light" else "Light Mode")
        self.apply_theme()

    def apply_theme(self):
        t = THEMES[self.current_theme]
        self.setStyleSheet(
            f"""
            QMainWindow {{ background-color: {t['bg']}; color: {t['text']}; font-family: "Inter", "Segoe UI", "Arial"; }}
            QWidget {{ color: {t['text']}; }}
            QLabel#HeaderTitle {{ font-size: 24px; font-weight: 700; color: {t['accent_soft']}; margin: 4px; }}
            QLabel#SectionLabel {{ color: {t['muted']}; font-weight: 600; margin-bottom: 6px; }}
            QLabel#SectionTitle {{ font-size: 16px; font-weight: 700; color: {t['text']}; }}
            QLabel#SectionSubtitle {{ font-size: 12px; color: {t['muted']}; }}
            QLabel#CardTitle {{ font-size: 11px; letter-spacing: 0.4px; text-transform: uppercase; color: {t['muted']}; }}
            QLabel#CardValue {{ font-size: 18px; font-weight: 700; color: {t['text']}; }}
            QLabel#CardSub {{ font-size: 11px; color: {t['muted']}; }}
            QLabel#StatusLabel {{ color: {t['muted']}; font-size: 12px; }}
            QWidget#Sidebar {{ background-color: {t['panel']}; border-right: 1px solid {t['border']}; }}
            QListWidget#SidebarList {{ background-color: {t['panel_alt']}; border: 1px solid {t['border']}; padding: 4px; }}
            QListWidget#PanelList {{ background-color: {t['panel_alt']}; border: 1px solid {t['border']}; padding: 4px; }}
            QListWidget::item {{ padding: 6px 8px; border-radius: 6px; }}
            QListWidget::item:selected {{ background-color: {t['accent']}; color: white; }}
            QTabWidget::pane {{ border: 1px solid {t['border']}; background: {t['panel']}; border-radius: 8px; }}
            QTabBar::tab {{ background: {t['panel_alt']}; padding: 8px 12px; margin-right: 6px; color: {t['text']}; border: 1px solid {t['border']}; border-radius: 8px; }}
            QTabBar::tab:selected {{ background: {t['accent']}; color: white; }}
            QTableWidget {{ background-color: {t['panel_alt']}; gridline-color: {t['border']}; selection-background-color: {t['accent']}; border: 1px solid {t['border']}; border-radius: 8px; }}
            QHeaderView::section {{ background-color: {t['panel']}; color: {t['text']}; border: 1px solid {t['border']}; padding: 8px; }}
            QLineEdit, QComboBox {{ background-color: {t['panel']}; border: 1px solid {t['border']}; padding: 8px; border-radius: 8px; }}
            QLineEdit::placeholder {{ color: {t['muted']}; }}
            QPushButton {{ background-color: {t['accent']}; color: white; border-radius: 8px; padding: 8px 14px; font-weight: 600; }}
            QPushButton:hover {{ filter: brightness(1.05); }}
            QPushButton#SecondaryButton {{ background-color: {t['panel_alt']}; color: {t['text']}; border: 1px solid {t['border']}; }}
            QPushButton#SecondaryButton:hover {{ background-color: {t['panel']}; }}
            QPushButton#SuccessButton {{ background-color: {t['success']}; }}
            QPushButton#PrimaryButton {{ background-color: {t['accent']}; }}
            QLabel#KpiCard, QWidget#KpiCard {{ border: 1px solid {t['border']}; border-left: 4px solid {t['accent']}; border-radius: 10px; background-color: {t['panel_alt']}; }}
            QGroupBox#SectionGroup {{ border: 1px solid {t['border']}; border-radius: 12px; margin-top: 6px; background: {t['panel']}; }}
            QGroupBox#SectionGroup::title {{ subcontrol-origin: margin; left: 12px; padding: 0 6px; color: {t['text']}; font-weight: 600; }}
            QScrollArea {{ border: none; }}
            QScrollBar:vertical {{ background: transparent; width: 10px; margin: 2px; }}
            QScrollBar::handle:vertical {{ background: {t['border']}; border-radius: 6px; min-height: 20px; }}
            """
        )
        self.update_chart_theme()

    def upload_file(self):
        fname, _ = QFileDialog.getOpenFileName(self, 'Open CSV', '.', "CSV Files (*.csv)")
        if fname:
            self.status_label.setText("Uploading...")
            files = {'file': open(fname, 'rb')}
            try:
                res = requests.post(f"{API_URL}/upload/", files=files)
                if res.status_code == 201:
                    data_id = res.json()['id']
                    # Refresh history and load uploaded dataset
                    self.fetch_history()
                    self.fetch_data(data_id)
                else:
                    self.status_label.setText(f"Upload Failed: {res.status_code}")
            except Exception as e:
                self.status_label.setText("Connection Error. Is Django running?")
                QMessageBox.critical(self, "Connection Error", f"Ensure Django is running on port 8000.\n\n{str(e)}")

    def fetch_data(self, pk):
        try:
            res = requests.get(f"{API_URL}/dashboard/{pk}/")
            if res.status_code == 200:
                data = res.json()
                self.current_dataset_id = pk
                self.current_dataset = data
                self.update_ui(data)
                self.status_label.setText(f"Loaded: {data.get('filename', 'Dataset')}")
                # switch to visualization tab
                self.tabs.setCurrentWidget(self.tab_dash)
                # mark selected in sidebar
                self.mark_selected(pk)
        except Exception:
            self.status_label.setText("Failed to load dataset from backend")

    def fetch_history(self):
        try:
            res = requests.get(f"{API_URL}/history/")
            if res.status_code == 200:
                items = res.json()
                self.list_widget.clear()
                for it in items:
                    label = it.get('filename') or f"Dataset {it.get('id')}"
                    display = f"{it.get('id')} — {label}"
                    lw = QListWidgetItem(display)
                    lw.setData(Qt.UserRole, it.get('id'))
                    self.list_widget.addItem(lw)
                self.status_label.setText("History refreshed")
        except Exception as e:
            self.status_label.setText("Could not fetch history")

    def load_from_item(self, item: QListWidgetItem):
        pk = item.data(Qt.UserRole)
        if pk:
            self.fetch_data(pk)

    def mark_selected(self, pk):
        for i in range(self.list_widget.count()):
            it = self.list_widget.item(i)
            if it.data(Qt.UserRole) == pk:
                self.list_widget.setCurrentItem(it)
                break

    def export_data(self):
        if not self.current_dataset_id:
            QMessageBox.warning(self, "No Dataset", "Please load a dataset first.")
            return
        fpath, _ = QFileDialog.getSaveFileName(self, 'Export CSV', 'export.csv', "CSV Files (*.csv)")
        if fpath:
            try:
                res = requests.get(f"{API_URL}/export/{self.current_dataset_id}/")
                if res.status_code == 200:
                    with open(fpath, 'wb') as f:
                        f.write(res.content)
                    self.status_label.setText(f"Exported to {fpath}")
                else:
                    QMessageBox.critical(self, "Export Failed", f"Status {res.status_code}")
            except Exception as e:
                QMessageBox.critical(self, "Export Error", str(e))

    def toggle_favorite(self):
        if not self.current_dataset_id:
            QMessageBox.warning(self, "No Dataset", "Please load a dataset first.")
            return
        try:
            res = requests.post(f"{API_URL}/favorite/{self.current_dataset_id}/")
            if res.status_code == 201:
                self.status_label.setText("Added to favorites")
                self.fetch_favorites()
            else:
                self.status_label.setText("Already favorited or error")
        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")

    def fetch_favorites(self):
        try:
            res = requests.get(f"{API_URL}/favorites/")
            if res.status_code == 200:
                favs = res.json()
                self.favorites_list.clear()
                for fav in favs:
                    ds = fav.get('dataset', {})
                    fname = ds.get('filename') or f"Dataset {ds.get('id')}"
                    item = QListWidgetItem(fname)
                    item.setData(Qt.UserRole, ds.get('id'))
                    self.favorites_list.addItem(item)
                self.status_label.setText(f"Loaded {len(favs)} favorites")
        except Exception:
            self.status_label.setText("Could not fetch favorites")

    def update_ui(self, data):
        # KPIs
        try:
            at = data.get('avg_temperature')
            ap = data.get('avg_pressure')
            af = data.get('avg_flowrate')
            self.temp_label.setText(f"Avg Temp\n{float(at):.2f} °C" if at is not None else "Avg Temp\nN/A")
            self.pres_label.setText(f"Avg Pressure\n{float(ap):.2f} bar" if ap is not None else "Avg Pressure\nN/A")
            self.flow_label.setText(f"Avg Flow\n{float(af):.2f} m³/h" if af is not None else "Avg Flow\nN/A")
        except Exception:
            self.temp_label.setText("Avg Temp\nN/A")
            self.pres_label.setText("Avg Pressure\nN/A")
            self.flow_label.setText("Avg Flow\nN/A")

        # Charts
        self.ax1.clear()
        self.ax2.clear()
        
        # Pie
        dist = data.get('type_distribution') or {}
        if dist:
            self.ax1.pie(
                list(dist.values()),
                labels=list(dist.keys()),
                autopct='%1.1f%%',
                colors=CHART_COLORS,
                textprops={'color': THEMES[self.current_theme]["chart_text"]},
            )
        else:
            self.ax1.text(0.5, 0.5, 'No distribution', color=THEMES[self.current_theme]["chart_text"], ha='center', va='center')
        self.ax1.set_title("Equipment Types", color=THEMES[self.current_theme]["chart_text"])

        # Bar
        eq_data = data.get('equipment_data', [])[:10]
        names = [d.get('equipment_name','') for d in eq_data]
        temps = [d.get('temperature', 0) for d in eq_data]
        self.ax2.bar(names, temps, color=CHART_COLORS[1])
        self.ax2.set_title("Top 10 Equipment Temp", color=THEMES[self.current_theme]["chart_text"])
        self.ax2.tick_params(axis='x', colors=THEMES[self.current_theme]["chart_text"], rotation=45)
        self.ax2.tick_params(axis='y', colors=THEMES[self.current_theme]["chart_text"])
        
        self.figure.tight_layout()
        self.canvas.draw()

        # Table (Raw Data tab)
        rows = data.get('equipment_data', [])
        self.raw_rows = rows
        self.all_columns = list(rows[0].keys()) if rows else []
        self.populate_column_list()
        self.apply_raw_filters()

        # Analytics Tab
        self.update_analytics_tab(data)
        
        # Validation Tab
        self.update_validation_tab(data)

    def update_analytics_tab(self, data):
        # Clear previous content
        while self.analytics_content.count():
            widget = self.analytics_content.takeAt(0).widget()
            if widget:
                widget.deleteLater()
        self.analytics_charts = []

        t = THEMES[self.current_theme]
        dq = data.get('data_quality', {})
        stat_data = data.get('statistical_analysis', {})
        dist_data = data.get('distribution_analysis', {})
        cat_data = data.get('categorical_analysis', {})

        # Dataset Overview
        overview = self.add_section("Dataset Overview", "Complete dataset statistics and composition")
        overview_cards = QWidget()
        overview_grid = QGridLayout(overview_cards)
        overview_grid.addWidget(self.create_info_card("Total Records", f"{data.get('row_count', 0)}"), 0, 0)
        overview_grid.addWidget(self.create_info_card("Total Features", f"{data.get('column_count', 0)}"), 0, 1)
        overview_grid.addWidget(self.create_info_card("Total Cells", f"{data.get('row_count', 0) * data.get('column_count', 0)}"), 0, 2)
        overview.addWidget(overview_cards)

        fig, ax = plt.subplots(figsize=(5, 3), facecolor=t["chart_bg"])
        ax.set_facecolor(t["chart_bg"])
        ax.tick_params(colors=t["chart_text"])
        for spine in ax.spines.values():
            spine.set_color(t["border"])
        ax.pie(
            [data.get('row_count', 0), data.get('column_count', 0)],
            labels=["Rows", "Columns"],
            autopct="%1.0f%%",
            colors=[CHART_COLORS[0], CHART_COLORS[2]],
            textprops={'color': t["chart_text"]},
        )
        ax.set_title("Rows vs Columns", color=t["chart_text"])
        overview.addWidget(self.add_chart(fig, 280))

        # Advanced Metrics
        advanced = self.add_section("Advanced Metrics", "Comprehensive data health indicators")
        advanced_cards = QWidget()
        advanced_grid = QGridLayout(advanced_cards)
        if dq:
            integrity = (1 - (dq.get('duplicate_rows', 0) / max(data.get('row_count', 1), 1))) * 100
            completeness = (1 - (dq.get('missing_cells', 0) / max(dq.get('total_cells', 1), 1))) * 100
            advanced_grid.addWidget(self.create_info_card("Data Integrity", f"{integrity:.1f}%"), 0, 0)
            advanced_grid.addWidget(self.create_info_card("Completeness", f"{completeness:.1f}%"), 0, 1)
        density = (data.get('row_count', 0) * data.get('column_count', 0)) / 1_000_000
        advanced_grid.addWidget(self.create_info_card("Data Density", f"{density:.2f}M"), 0, 2)
        advanced_grid.addWidget(self.create_info_card("Feature Count", f"{data.get('column_count', 0)}"), 0, 3)
        advanced.addWidget(advanced_cards)

        # Data Quality Metrics
        if dq:
            quality = self.add_section("Quality Score Card", "Data quality indicators")
            complete_pct = ((dq.get('total_cells', 0) - dq.get('missing_cells', 0)) / max(dq.get('total_cells', 1), 1)) * 100
            duplicate_pct = (dq.get('duplicate_rows', 0) / max(data.get('row_count', 1), 1)) * 100
            integrity_pct = (1 - (dq.get('duplicate_rows', 0) / max(data.get('row_count', 1), 1))) * 100
            quality_table = self.add_table(
                ["Metric", "Value"],
                [
                    ["Complete", f"{complete_pct:.1f}%"],
                    ["Duplicates", f"{duplicate_pct:.1f}%"],
                    ["Data Integrity", f"{integrity_pct:.1f}%"],
                ],
            )
            quality.addWidget(quality_table)

        # Data Completeness
        if dq:
            completeness = self.add_section("Data Completeness", "Overall data availability percentage")
            fig, ax = plt.subplots(figsize=(5, 3), facecolor=t["chart_bg"])
            ax.set_facecolor(t["chart_bg"])
            ax.tick_params(colors=t["chart_text"])
            for spine in ax.spines.values():
                spine.set_color(t["border"])
            total = dq.get('total_cells', 0)
            missing = dq.get('missing_cells', 0)
            complete = max(total - missing, 0)
            ax.pie(
                [complete, missing],
                labels=["Complete", "Missing"],
                autopct="%1.1f%%",
                colors=[THEMES[self.current_theme]["success"], THEMES[self.current_theme]["danger"]],
                textprops={'color': t["chart_text"]},
            )
            ax.set_title("Completeness", color=t["chart_text"])
            completeness.addWidget(self.add_chart(fig, 280))

        # Complexity Score
        if stat_data and dq:
            complexity = self.add_section("Dataset Complexity", "Data characteristics and composition")
            numeric_cols = len(stat_data)
            categorical_cols = len(cat_data) if cat_data else 0
            total_cols = max(data.get('column_count', 1), 1)
            missing_pct = (dq.get('missing_cells', 0) / max(dq.get('total_cells', 1), 1)) * 100
            outlier_cols = len([c for c in data.get('outliers', {}) if data.get('outliers', {}).get(c, {}).get('outlier_count', 0) > 0])
            rows = [
                ["Numeric Features", f"{(numeric_cols / total_cols) * 100:.1f}%"],
                ["Data Completeness", f"{100 - missing_pct:.1f}%"],
                ["Outlier Presence", f"{(1 - (outlier_cols / total_cols)) * 100:.1f}%"],
                ["Categorical Features", f"{(categorical_cols / total_cols) * 100:.1f}%"],
            ]
            complexity.addWidget(self.add_table(["Factor", "Score"], rows))

        # Range Analysis
        if stat_data:
            range_section = self.add_section("Range Analysis", "Value ranges and interquartile ranges")
            range_rows = []
            chart_data = []
            for col, stats in list(stat_data.items())[:8]:
                rng = (stats.get('max', 0) - stats.get('min', 0))
                iqr = stats.get('iqr', 0)
                range_rows.append([col, f"{rng:.3f}", f"{iqr:.3f}"])
                chart_data.append((col[:12], rng, iqr))
            range_section.addWidget(self.add_table(["Variable", "Range", "IQR"], range_rows))
            if chart_data:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                labels = [c[0] for c in chart_data]
                ranges = [c[1] for c in chart_data]
                iqrs = [c[2] for c in chart_data]
                ax.bar(labels, ranges, color="#6366f1", label="Range")
                ax.plot(labels, iqrs, color="#f59e0b", marker="o", label="IQR")
                ax.set_title("Range vs IQR", color=t["chart_text"])
                ax.tick_params(axis='x', rotation=45, colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                ax.legend()
                range_section.addWidget(self.add_chart(fig, 300))

        # Comparison Matrix
        if stat_data:
            comparison = self.add_section("Statistical Comparison", "Mean, Median, and Standard Deviation comparison")
            matrix_rows = []
            chart_data = []
            for col, stats in list(stat_data.items())[:6]:
                mean = stats.get('mean', 0)
                median = stats.get('median', 0)
                std_dev = stats.get('std_dev', 0)
                matrix_rows.append([col, f"{mean:.3f}", f"{median:.3f}", f"{std_dev:.3f}"])
                chart_data.append((col[:10], mean, median, std_dev))
            comparison.addWidget(self.add_table(["Variable", "Mean", "Median", "Std Dev"], matrix_rows))
            if chart_data:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                labels = [c[0] for c in chart_data]
                means = [c[1] for c in chart_data]
                medians = [c[2] for c in chart_data]
                stds = [c[3] for c in chart_data]
                x = range(len(labels))
                ax.bar([i - 0.2 for i in x], means, width=0.4, color="#3b82f6", label="Mean")
                ax.bar([i + 0.2 for i in x], medians, width=0.4, color="#8b5cf6", label="Median")
                ax.plot(x, stds, color="#ef4444", marker="o", label="Std Dev")
                ax.set_xticks(list(x))
                ax.set_xticklabels(labels, rotation=45)
                ax.tick_params(axis='y', colors=t["chart_text"])
                ax.tick_params(axis='x', colors=t["chart_text"])
                ax.set_title("Mean/Median/Std Dev", color=t["chart_text"])
                ax.legend()
                comparison.addWidget(self.add_chart(fig, 300))

        # Trend Analysis
        if stat_data:
            trend = self.add_section("Trend Analysis", "Min, Max, and Average values across columns")
            trend_rows = []
            chart_data = []
            for col, stats in list(stat_data.items())[:5]:
                min_v = stats.get('min', 0)
                max_v = stats.get('max', 0)
                avg_v = stats.get('mean', 0)
                trend_rows.append([col, f"{min_v:.3f}", f"{avg_v:.3f}", f"{max_v:.3f}"])
                chart_data.append((col[:15], min_v, avg_v, max_v))
            trend.addWidget(self.add_table(["Variable", "Min", "Avg", "Max"], trend_rows))
            if chart_data:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                labels = [c[0] for c in chart_data]
                mins = [c[1] for c in chart_data]
                avgs = [c[2] for c in chart_data]
                maxs = [c[3] for c in chart_data]
                ax.plot(labels, mins, color="#ef4444", marker="o", label="Min")
                ax.plot(labels, avgs, color="#3b82f6", marker="o", label="Avg")
                ax.plot(labels, maxs, color="#10b981", marker="o", label="Max")
                ax.set_title("Min/Avg/Max", color=t["chart_text"])
                ax.tick_params(axis='x', rotation=45, colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                ax.legend()
                trend.addWidget(self.add_chart(fig, 300))

        # Variability Analysis
        if stat_data:
            variability = self.add_section("Variability Analysis", "Coefficient of Variation (CV) for each column")
            var_rows = []
            chart_data = []
            for col, stats in list(stat_data.items())[:6]:
                mean = abs(stats.get('mean', 0)) or 1
                std_dev = stats.get('std_dev', 0)
                cv = (std_dev / mean) * 100
                var_rows.append([col, f"{cv:.2f}%"])
                chart_data.append((col[:12], cv))
            variability.addWidget(self.add_table(["Variable", "CV%"], var_rows))
            if chart_data:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                labels = [c[0] for c in chart_data]
                cvs = [c[1] for c in chart_data]
                ax.bar(labels, cvs, color="#f59e0b")
                ax.set_title("Coefficient of Variation", color=t["chart_text"])
                ax.tick_params(axis='x', rotation=45, colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                variability.addWidget(self.add_chart(fig, 300))

        # Distribution Comparison
        if stat_data:
            dist_comp = self.add_section("Value Distribution", "Value spread from low to high")
            rows = []
            chart_data = []
            for col, stats in list(stat_data.items())[:5]:
                low = stats.get('min', 0)
                mid = stats.get('mean', 0)
                high = stats.get('max', 0)
                rows.append([col, f"{low:.3f}", f"{mid:.3f}", f"{high:.3f}"])
                chart_data.append((col[:12], low, mid, high))
            dist_comp.addWidget(self.add_table(["Variable", "Low", "Mid", "High"], rows))
            if chart_data:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                labels = [c[0] for c in chart_data]
                lows = [c[1] for c in chart_data]
                mids = [c[2] for c in chart_data]
                highs = [c[3] for c in chart_data]
                ax.plot(labels, lows, color="#ef4444", marker="o", label="Low")
                ax.plot(labels, mids, color="#3b82f6", marker="o", label="Mid")
                ax.plot(labels, highs, color="#10b981", marker="o", label="High")
                ax.set_title("Value Spread", color=t["chart_text"])
                ax.tick_params(axis='x', rotation=45, colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                ax.legend()
                dist_comp.addWidget(self.add_chart(fig, 300))

        # Percentile Distribution
        if dist_data:
            percentile = self.add_section("Percentile Distribution", "Five-point summary for key variables")
            cols = list(dist_data.keys())[:2]
            for col in cols:
                dist = dist_data[col]
                rows = [
                    ["Min", dist.get('min', 0)],
                    ["P25", dist.get('percentiles', {}).get('p25', 0)],
                    ["P50", dist.get('percentiles', {}).get('p50', 0)],
                    ["P75", dist.get('percentiles', {}).get('p75', 0)],
                    ["Max", dist.get('max', 0)],
                ]
                percentile.addWidget(self.create_section_title(col))
                percentile.addWidget(self.add_table(["Percentile", "Value"], rows))
                fig, ax = plt.subplots(figsize=(6, 2.5), facecolor=t["chart_bg"])
                labels = [r[0] for r in rows]
                values = [r[1] for r in rows]
                ax.plot(labels, values, color=CHART_COLORS[0], marker="o")
                ax.set_title(f"{col} Percentiles", color=t["chart_text"])
                ax.tick_params(axis='x', colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                percentile.addWidget(self.add_chart(fig, 240))

        # Data Quality Overview
        if dq:
            overview_q = self.add_section("Data Quality Overview", "Completeness and data integrity metrics")
            missing_by_col = dq.get('missing_by_column', {})
            rows = [[k, v] for k, v in sorted(missing_by_col.items(), key=lambda kv: kv[1], reverse=True) if v > 0]
            if rows:
                overview_q.addWidget(self.add_table(["Column", "Missing"], rows))
            else:
                overview_q.addWidget(QLabel("No missing values detected."))

        # Statistical Analysis
        if stat_data:
            stats_section = self.add_section("Statistical Analysis", "Detailed statistical metrics for all columns")
            rows = []
            for col, stats in stat_data.items():
                rows.append([
                    col,
                    f"{stats.get('mean', 0):.2f}",
                    f"{stats.get('median', 0):.2f}",
                    f"{stats.get('std_dev', 0):.2f}",
                    f"{stats.get('min', 0):.2f}",
                    f"{stats.get('max', 0):.2f}",
                    f"{stats.get('iqr', 0):.2f}",
                ])
            stats_section.addWidget(self.add_table(["Variable", "Mean", "Median", "Std Dev", "Min", "Max", "IQR"], rows))

        # Feature Comparison
        if stat_data:
            feature = self.add_section("Statistical Properties", "Coefficient of Variation, Skewness, and Kurtosis")
            rows = []
            for col, stats in list(stat_data.items())[:8]:
                cv = (stats.get('std_dev', 0) / (abs(stats.get('mean', 0)) or 1)) * 100
                skew = dist_data.get(col, {}).get('skewness', 0)
                kurt = dist_data.get(col, {}).get('kurtosis', 0)
                rows.append([col, f"{cv:.2f}", f"{skew:.2f}", f"{kurt:.2f}"])
            feature.addWidget(self.add_table(["Variable", "CV%", "Skewness", "Kurtosis"], rows))

        # Correlation Analysis
        corr_data = data.get('correlation_analysis', [])
        if corr_data:
            corr_section = self.add_section("Correlation Analysis", "Relationships between numerical variables")
            rows = []
            for item in corr_data:
                rows.append([item.get('variable1', ''), item.get('variable2', ''), f"{item.get('correlation', 0):.3f}"])
            corr_section.addWidget(self.add_table(["Variable 1", "Variable 2", "Correlation"], rows))
            top = sorted(corr_data, key=lambda c: abs(c.get('correlation', 0)), reverse=True)[:8]
            fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
            labels = [f"{c.get('variable1','')[:8]} vs {c.get('variable2','')[:8]}" for c in top]
            values = [c.get('correlation', 0) for c in top]
            ax.barh(labels, values, color=CHART_COLORS[3])
            ax.set_title("Top Correlations", color=t["chart_text"])
            ax.tick_params(axis='x', colors=t["chart_text"])
            ax.tick_params(axis='y', colors=t["chart_text"])
            corr_section.addWidget(self.add_chart(fig, 300))

        # Outlier Analysis
        outliers = data.get('outliers', {})
        if outliers:
            out_section = self.add_section("Outlier Detection", "Anomalous data points and their distribution")
            rows = []
            items = sorted(outliers.items(), key=lambda kv: kv[1].get('outlier_count', 0), reverse=True)
            for col, stats in items:
                rows.append([col, stats.get('outlier_count', 0), f"{stats.get('outlier_percentage', 0):.2f}%"])
            out_section.addWidget(self.add_table(["Variable", "Outlier Count", "Outlier %"], rows))
            top = items[:10]
            if top:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                labels = [c[0][:12] for c in top]
                values = [c[1].get('outlier_count', 0) for c in top]
                ax.bar(labels, values, color=THEMES[self.current_theme]["danger"])
                ax.set_title("Outliers (Top 10)", color=t["chart_text"])
                ax.tick_params(axis='x', rotation=45, colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                out_section.addWidget(self.add_chart(fig, 300))

        # Distribution Analysis
        if dist_data:
            dist_section = self.add_section("Distribution Analysis", "Percentiles and distribution characteristics")
            for col in list(dist_data.keys())[:4]:
                dist = dist_data[col]
                rows = [
                    ["P10", dist.get('percentiles', {}).get('p10', 0)],
                    ["P25", dist.get('percentiles', {}).get('p25', 0)],
                    ["P50", dist.get('percentiles', {}).get('p50', 0)],
                    ["P75", dist.get('percentiles', {}).get('p75', 0)],
                    ["P90", dist.get('percentiles', {}).get('p90', 0)],
                    ["Skewness", dist.get('skewness', 0)],
                    ["Kurtosis", dist.get('kurtosis', 0)],
                ]
                dist_section.addWidget(self.create_section_title(col))
                dist_section.addWidget(self.add_table(["Metric", "Value"], rows))

        # Categorical Analysis
        if cat_data:
            cat_section = self.add_section("Categorical Analysis", "Distribution of categorical variables")
            for col, counts in cat_data.items():
                cat_section.addWidget(self.create_section_title(col))
                sorted_counts = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:8]
                cat_section.addWidget(self.add_table(["Category", "Count"], sorted_counts))

        # Feature Scatter Plot
        if stat_data:
            scatter = self.add_section("Mean vs Variability", "Relationship between central tendency and spread")
            scatter_data = []
            for col, stats in list(stat_data.items())[:20]:
                scatter_data.append((stats.get('mean', 0), stats.get('std_dev', 0)))
            if scatter_data:
                fig, ax = plt.subplots(figsize=(6, 3), facecolor=t["chart_bg"])
                xs = [d[0] for d in scatter_data]
                ys = [d[1] for d in scatter_data]
                ax.scatter(xs, ys, color="#8b5cf6", alpha=0.7)
                ax.set_title("Mean vs Std Dev", color=t["chart_text"])
                ax.set_xlabel("Mean", color=t["chart_text"])
                ax.set_ylabel("Std Dev", color=t["chart_text"])
                ax.tick_params(axis='x', colors=t["chart_text"])
                ax.tick_params(axis='y', colors=t["chart_text"])
                scatter.addWidget(self.add_chart(fig, 300))

        # Anomaly Detection
        anomalies = data.get('anomaly_detection', {})
        if anomalies:
            anom_section = self.add_section("Anomaly Detection", "Unusual patterns and suspicious data points")
            rows = []
            for col, stats in anomalies.items():
                rows.append([col, stats.get('anomalies_detected', 0), f"{stats.get('anomaly_percentage', 0):.2f}%"])
            anom_section.addWidget(self.add_table(["Variable", "Detected", "Percent"], rows))

        # Clustering Analysis
        clustering = data.get('clustering_analysis')
        if clustering:
            cluster_section = self.add_section("Clustering Analysis", "Natural grouping and segmentation patterns")
            cards = QWidget()
            grid = QGridLayout(cards)
            grid.addWidget(self.create_info_card("Clusters", str(len(clustering.get('clusters', [])))), 0, 0)
            grid.addWidget(self.create_info_card("Inertia", f"{clustering.get('inertia', 0):.2f}"), 0, 1)
            grid.addWidget(self.create_info_card("Silhouette", f"{clustering.get('silhouette_score', 0):.3f}"), 0, 2)
            cluster_section.addWidget(cards)
            centers = clustering.get('cluster_centers')
            if centers:
                centers_table = QTableWidget()
                centers_table.setColumnCount(len(centers[0]))
                centers_table.setRowCount(len(centers))
                centers_table.setHorizontalHeaderLabels([f"F{i+1}" for i in range(len(centers[0]))])
                for i, center in enumerate(centers):
                    for j, val in enumerate(center):
                        centers_table.setItem(i, j, QTableWidgetItem(f"{val:.3f}"))
                centers_table.resizeColumnsToContents()
                cluster_section.addWidget(centers_table)

        self.analytics_content.addStretch()

    def build_analytics_charts(self, data):
        if self.analytics_canvas:
            self.analytics_canvas.setParent(None)
            self.analytics_canvas.deleteLater()
            self.analytics_canvas = None
            self.analytics_fig = None

        t = THEMES[self.current_theme]
        fig, axes = plt.subplots(2, 2, figsize=(10, 8), facecolor=t["chart_bg"])
        axes = axes.flatten()
        for ax in axes:
            ax.set_facecolor(t["chart_bg"])
            ax.tick_params(colors=t["chart_text"])
            for spine in ax.spines.values():
                spine.set_color(t["border"])

        # Chart 1: Data Quality Pie
        dq = data.get('data_quality', {})
        if dq:
            total = dq.get('total_cells', 0)
            missing = dq.get('missing_cells', 0)
            complete = max(total - missing, 0)
            axes[0].pie(
                [complete, missing],
                labels=["Complete", "Missing"],
                autopct='%1.1f%%',
                colors=[CHART_COLORS[1], THEMES[self.current_theme]["danger"]],
                textprops={'color': t["chart_text"]},
            )
            axes[0].set_title("Data Quality", color=t["chart_text"])
        else:
            axes[0].text(0.5, 0.5, "No data quality", color=t["chart_text"], ha='center', va='center')

        # Chart 2: Top Correlations
        corr_data = data.get('correlation_analysis', [])
        if corr_data:
            top = sorted(corr_data, key=lambda c: abs(c.get('correlation', 0)), reverse=True)[:8]
            labels = [f"{c.get('variable1','')} vs {c.get('variable2','')}" for c in top]
            values = [c.get('correlation', 0) for c in top]
            axes[1].barh(labels, values, color=CHART_COLORS[0])
            axes[1].set_title("Top Correlations", color=t["chart_text"])
            axes[1].invert_yaxis()
        else:
            axes[1].text(0.5, 0.5, "No correlations", color=t["chart_text"], ha='center', va='center')

        # Chart 3: Outliers by Column
        outliers = data.get('outliers', {})
        if outliers:
            items = sorted(outliers.items(), key=lambda kv: kv[1].get('outlier_count', 0), reverse=True)[:10]
            labels = [i[0] for i in items]
            values = [i[1].get('outlier_count', 0) for i in items]
            axes[2].bar(labels, values, color=THEMES[self.current_theme]["warning"])
            axes[2].set_title("Outliers (Top 10)", color=t["chart_text"])
            axes[2].tick_params(axis='x', rotation=45)
        else:
            axes[2].text(0.5, 0.5, "No outliers", color=t["chart_text"], ha='center', va='center')

        # Chart 4: Missing by Column
        missing_by_col = dq.get('missing_by_column', {}) if dq else {}
        if missing_by_col:
            items = sorted(missing_by_col.items(), key=lambda kv: kv[1], reverse=True)[:10]
            labels = [i[0] for i in items]
            values = [i[1] for i in items]
            axes[3].bar(labels, values, color=THEMES[self.current_theme]["danger"])
            axes[3].set_title("Missing by Column (Top 10)", color=t["chart_text"])
            axes[3].tick_params(axis='x', rotation=45)
        else:
            axes[3].text(0.5, 0.5, "No missing-by-column", color=t["chart_text"], ha='center', va='center')

        fig.tight_layout()
        canvas = FigureCanvas(fig)
        canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        canvas.setMinimumHeight(520)
        self.analytics_content.addWidget(canvas)
        self.analytics_fig = fig
        self.analytics_canvas = canvas

    def update_validation_tab(self, data):
        dq = data.get('data_quality', {})
        if not dq:
            return

        self.validation_table.setColumnCount(2)
        self.validation_table.setHorizontalHeaderLabels(["Metric", "Value"])
        
        metrics = [
            ("Total Cells", str(dq.get('total_cells', 0))),
            ("Missing Cells", str(dq.get('missing_cells', 0))),
            ("Missing %", f"{dq.get('missing_percentage', 0):.2f}%"),
            ("Duplicate Rows", str(dq.get('duplicate_rows', 0))),
        ]
        
        self.validation_table.setRowCount(len(metrics))
        for i, (metric, val) in enumerate(metrics):
            self.validation_table.setItem(i, 0, QTableWidgetItem(metric))
            self.validation_table.setItem(i, 1, QTableWidgetItem(val))
        
        self.validation_table.resizeColumnsToContents()

    def populate_column_list(self):
        self.columns_list.blockSignals(True)
        self.columns_list.clear()
        for col in self.all_columns:
            item = QListWidgetItem(col)
            item.setFlags(item.flags() | Qt.ItemIsUserCheckable)
            item.setCheckState(Qt.Checked)
            self.columns_list.addItem(item)
        self.columns_list.blockSignals(False)

    def get_visible_columns(self):
        visible = []
        for i in range(self.columns_list.count()):
            item = self.columns_list.item(i)
            if item.checkState() == Qt.Checked:
                visible.append(item.text())
        return visible

    def apply_raw_filters(self):
        if not self.raw_rows:
            self.table.setRowCount(0)
            self.table.setColumnCount(0)
            return

        query = self.search_input.text().lower().strip()
        visible_cols = self.get_visible_columns()
        if not visible_cols:
            self.table.setRowCount(0)
            self.table.setColumnCount(0)
            return

        rows = self.raw_rows
        if query:
            rows = [
                r for r in rows
                if any(query in str(r.get(col, "")).lower() for col in self.all_columns)
            ]

        limit_text = self.rows_combo.currentText()
        if limit_text != "All":
            limit = int(limit_text)
            rows = rows[:limit]

        self.filtered_rows = rows

        self.table.setRowCount(len(rows))
        self.table.setColumnCount(len(visible_cols))
        self.table.setHorizontalHeaderLabels(visible_cols)
        for i, row in enumerate(rows):
            for j, col in enumerate(visible_cols):
                val = row.get(col, "")
                self.table.setItem(i, j, QTableWidgetItem(str(val)))
        self.table.resizeColumnsToContents()

    def show_row_details(self, row, column):
        if row >= len(self.filtered_rows):
            return
        data = self.filtered_rows[row]
        pretty = json.dumps(data, indent=2)
        msg = QMessageBox(self)
        msg.setWindowTitle("Row Details")
        msg.setText("Full row data")
        msg.setDetailedText(pretty)
        msg.exec_()

    def update_chart_theme(self):
        t = THEMES[self.current_theme]
        self.figure.patch.set_facecolor(t["chart_bg"])
        for ax in [self.ax1, self.ax2]:
            ax.set_facecolor(t["chart_bg"])
            for spine in ax.spines.values():
                spine.set_color(t["border"])
            ax.tick_params(colors=t["chart_text"])
        self.canvas.draw()
        if self.analytics_fig and self.analytics_canvas:
            self.analytics_fig.patch.set_facecolor(t["chart_bg"])
            for ax in self.analytics_fig.axes:
                ax.set_facecolor(t["chart_bg"])
                ax.tick_params(colors=t["chart_text"])
                for spine in ax.spines.values():
                    spine.set_color(t["border"])
            self.analytics_canvas.draw()
        for fig, canvas in self.analytics_charts:
            fig.patch.set_facecolor(t["chart_bg"])
            for ax in fig.axes:
                ax.set_facecolor(t["chart_bg"])
                ax.tick_params(colors=t["chart_text"])
                for spine in ax.spines.values():
                    spine.set_color(t["border"])
            canvas.draw()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = ChemVizDesktop()
    window.show()
    sys.exit(app.exec_())
