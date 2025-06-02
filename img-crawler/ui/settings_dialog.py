"""
설정 다이얼로그 - 앱 전역 설정 관리
"""

from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QTabWidget,
                             QGroupBox, QLabel, QSpinBox, QCheckBox, 
                             QPushButton, QLineEdit, QComboBox, QSlider,
                             QFormLayout, QDialogButtonBox, QMessageBox)
from PyQt5.QtCore import Qt, QSettings


class SettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.settings = QSettings()
        self.init_ui()
        self.load_settings()
        
    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle("설정")
        self.setFixedSize(500, 400)
        
        layout = QVBoxLayout(self)
        
        # 탭 위젯
        tab_widget = QTabWidget()
        layout.addWidget(tab_widget)
        
        # 네트워크 설정 탭
        network_tab = self.create_network_tab()
        tab_widget.addTab(network_tab, "🌐 네트워크")
        
        # 다운로드 설정 탭
        download_tab = self.create_download_tab()
        tab_widget.addTab(download_tab, "📥 다운로드")
        
        # UI 설정 탭
        ui_tab = self.create_ui_tab()
        tab_widget.addTab(ui_tab, "🎨 인터페이스")
        
        # 버튼박스
        button_box = QDialogButtonBox(
            QDialogButtonBox.Ok | 
            QDialogButtonBox.Cancel |
            QDialogButtonBox.RestoreDefaults
        )
        button_box.accepted.connect(self.accept_settings)
        button_box.rejected.connect(self.reject)
        button_box.button(QDialogButtonBox.RestoreDefaults).clicked.connect(self.restore_defaults)
        
        layout.addWidget(button_box)
        
    def create_network_tab(self):
        """네트워크 설정 탭"""
        widget = QTabWidget()
        layout = QVBoxLayout(widget)
        
        # 연결 설정 그룹
        connection_group = QGroupBox("연결 설정")
        conn_layout = QFormLayout(connection_group)
        
        # 요청 타임아웃
        self.timeout_spin = QSpinBox()
        self.timeout_spin.setRange(5, 300)
        self.timeout_spin.setValue(30)
        self.timeout_spin.setSuffix(" 초")
        conn_layout.addRow("요청 타임아웃:", self.timeout_spin)
        
        # 재시도 횟수
        self.retry_spin = QSpinBox()
        self.retry_spin.setRange(0, 10)
        self.retry_spin.setValue(3)
        conn_layout.addRow("재시도 횟수:", self.retry_spin)
        
        # 동시 연결 수
        self.max_concurrent_spin = QSpinBox()
        self.max_concurrent_spin.setRange(1, 20)
        self.max_concurrent_spin.setValue(5)
        conn_layout.addRow("최대 동시 연결:", self.max_concurrent_spin)
        
        layout.addWidget(connection_group)
        
        # User Agent 설정 그룹
        ua_group = QGroupBox("User Agent 설정")
        ua_layout = QVBoxLayout(ua_group)
        
        self.user_agent_combo = QComboBox()
        self.user_agent_combo.addItems([
            "기본 (Python Requests)",
            "Chrome (Windows)",
            "Chrome (macOS)",
            "Firefox (Windows)",
            "Safari (macOS)",
            "사용자 정의"
        ])
        ua_layout.addWidget(self.user_agent_combo)
        
        # 사용자 정의 User Agent
        self.custom_ua_input = QLineEdit()
        self.custom_ua_input.setPlaceholderText("사용자 정의 User Agent 문자열")
        self.custom_ua_input.setEnabled(False)
        ua_layout.addWidget(self.custom_ua_input)
        
        self.user_agent_combo.currentTextChanged.connect(self.on_ua_changed)
        
        layout.addWidget(ua_group)
        
        layout.addStretch()
        return widget
        
    def create_download_tab(self):
        """다운로드 설정 탭"""
        widget = QTabWidget()
        layout = QVBoxLayout(widget)
        
        # 파일 설정 그룹
        file_group = QGroupBox("파일 설정")
        file_layout = QFormLayout(file_group)
        
        # 최대 파일 크기
        self.max_size_spin = QSpinBox()
        self.max_size_spin.setRange(1, 1000)
        self.max_size_spin.setValue(50)
        self.max_size_spin.setSuffix(" MB")
        file_layout.addRow("최대 파일 크기:", self.max_size_spin)
        
        # 파일명 패턴
        self.filename_pattern_combo = QComboBox()
        self.filename_pattern_combo.addItems([
            "원본 파일명 유지",
            "원본파일명_타임스탬프",
            "순번_원본파일명",
            "도메인_순번_원본파일명"
        ])
        file_layout.addRow("파일명 패턴:", self.filename_pattern_combo)
        
        layout.addWidget(file_group)
        
        # 필터 설정 그룹
        filter_group = QGroupBox("이미지 필터")
        filter_layout = QVBoxLayout(filter_group)
        
        # 최소 크기 필터
        size_filter_layout = QHBoxLayout()
        size_filter_layout.addWidget(QLabel("최소 이미지 크기:"))
        
        self.min_width_spin = QSpinBox()
        self.min_width_spin.setRange(1, 10000)
        self.min_width_spin.setValue(100)
        size_filter_layout.addWidget(self.min_width_spin)
        size_filter_layout.addWidget(QLabel("x"))
        
        self.min_height_spin = QSpinBox()
        self.min_height_spin.setRange(1, 10000)
        self.min_height_spin.setValue(100)
        size_filter_layout.addWidget(self.min_height_spin)
        size_filter_layout.addWidget(QLabel("픽셀"))
        
        filter_layout.addLayout(size_filter_layout)
        
        # 지원하는 형식
        self.supported_formats = QCheckBox("지원하는 형식만 다운로드 (jpg, png, gif, webp)")
        self.supported_formats.setChecked(True)
        filter_layout.addWidget(self.supported_formats)
        
        layout.addWidget(filter_group)
        
        layout.addStretch()
        return widget
        
    def create_ui_tab(self):
        """UI 설정 탭"""
        widget = QTabWidget()
        layout = QVBoxLayout(widget)
        
        # 인터페이스 설정 그룹
        ui_group = QGroupBox("인터페이스 설정")
        ui_layout = QFormLayout(ui_group)
        
        # 테마
        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["시스템 기본", "라이트", "다크"])
        ui_layout.addRow("테마:", self.theme_combo)
        
        # 언어
        self.language_combo = QComboBox()
        self.language_combo.addItems(["한국어", "English"])
        ui_layout.addRow("언어:", self.language_combo)
        
        layout.addWidget(ui_group)
        
        # 미리보기 설정 그룹
        preview_group = QGroupBox("미리보기 설정")
        preview_layout = QFormLayout(preview_group)
        
        # 썸네일 크기
        self.thumbnail_size_spin = QSpinBox()
        self.thumbnail_size_spin.setRange(100, 300)
        self.thumbnail_size_spin.setValue(150)
        self.thumbnail_size_spin.setSuffix(" px")
        preview_layout.addRow("썸네일 크기:", self.thumbnail_size_spin)
        
        # 한 행당 썸네일 수
        self.thumbnails_per_row_spin = QSpinBox()
        self.thumbnails_per_row_spin.setRange(2, 10)
        self.thumbnails_per_row_spin.setValue(4)
        preview_layout.addRow("한 행당 썸네일:", self.thumbnails_per_row_spin)
        
        layout.addWidget(preview_group)
        
        # 로그 설정 그룹
        log_group = QGroupBox("로그 설정")
        log_layout = QVBoxLayout(log_group)
        
        self.enable_debug_log = QCheckBox("디버그 로그 활성화")
        log_layout.addWidget(self.enable_debug_log)
        
        self.auto_save_log = QCheckBox("로그 자동 저장")
        log_layout.addWidget(self.auto_save_log)
        
        layout.addWidget(log_group)
        
        layout.addStretch()
        return widget
        
    def on_ua_changed(self, text):
        """User Agent 선택 변경"""
        is_custom = text == "사용자 정의"
        self.custom_ua_input.setEnabled(is_custom)
        
    def load_settings(self):
        """설정 로드"""
        # 네트워크 설정
        self.timeout_spin.setValue(self.settings.value("network/timeout", 30, type=int))
        self.retry_spin.setValue(self.settings.value("network/retry", 3, type=int))
        self.max_concurrent_spin.setValue(self.settings.value("network/max_concurrent", 5, type=int))
        
        ua_index = self.settings.value("network/user_agent_index", 0, type=int)
        self.user_agent_combo.setCurrentIndex(ua_index)
        self.custom_ua_input.setText(self.settings.value("network/custom_user_agent", ""))
        
        # 다운로드 설정
        self.max_size_spin.setValue(self.settings.value("download/max_size", 50, type=int))
        filename_pattern_index = self.settings.value("download/filename_pattern", 0, type=int)
        self.filename_pattern_combo.setCurrentIndex(filename_pattern_index)
        
        self.min_width_spin.setValue(self.settings.value("download/min_width", 100, type=int))
        self.min_height_spin.setValue(self.settings.value("download/min_height", 100, type=int))
        self.supported_formats.setChecked(self.settings.value("download/supported_formats", True, type=bool))
        
        # UI 설정
        theme_index = self.settings.value("ui/theme", 0, type=int)
        self.theme_combo.setCurrentIndex(theme_index)
        
        language_index = self.settings.value("ui/language", 0, type=int)
        self.language_combo.setCurrentIndex(language_index)
        
        self.thumbnail_size_spin.setValue(self.settings.value("ui/thumbnail_size", 150, type=int))
        self.thumbnails_per_row_spin.setValue(self.settings.value("ui/thumbnails_per_row", 4, type=int))
        
        self.enable_debug_log.setChecked(self.settings.value("ui/debug_log", False, type=bool))
        self.auto_save_log.setChecked(self.settings.value("ui/auto_save_log", False, type=bool))
        
    def save_settings(self):
        """설정 저장"""
        # 네트워크 설정
        self.settings.setValue("network/timeout", self.timeout_spin.value())
        self.settings.setValue("network/retry", self.retry_spin.value())
        self.settings.setValue("network/max_concurrent", self.max_concurrent_spin.value())
        self.settings.setValue("network/user_agent_index", self.user_agent_combo.currentIndex())
        self.settings.setValue("network/custom_user_agent", self.custom_ua_input.text())
        
        # 다운로드 설정
        self.settings.setValue("download/max_size", self.max_size_spin.value())
        self.settings.setValue("download/filename_pattern", self.filename_pattern_combo.currentIndex())
        self.settings.setValue("download/min_width", self.min_width_spin.value())
        self.settings.setValue("download/min_height", self.min_height_spin.value())
        self.settings.setValue("download/supported_formats", self.supported_formats.isChecked())
        
        # UI 설정
        self.settings.setValue("ui/theme", self.theme_combo.currentIndex())
        self.settings.setValue("ui/language", self.language_combo.currentIndex())
        self.settings.setValue("ui/thumbnail_size", self.thumbnail_size_spin.value())
        self.settings.setValue("ui/thumbnails_per_row", self.thumbnails_per_row_spin.value())
        self.settings.setValue("ui/debug_log", self.enable_debug_log.isChecked())
        self.settings.setValue("ui/auto_save_log", self.auto_save_log.isChecked())
        
    def accept_settings(self):
        """설정 적용"""
        self.save_settings()
        QMessageBox.information(self, "설정 저장", "설정이 성공적으로 저장되었습니다.")
        self.accept()
        
    def restore_defaults(self):
        """기본값 복원"""
        reply = QMessageBox.question(self, "기본값 복원", 
                                   "모든 설정을 기본값으로 복원하시겠습니까?",
                                   QMessageBox.Yes | 
                                   QMessageBox.No,
                                   QMessageBox.No)
        
        if reply == QMessageBox.Yes:
            # 네트워크 설정 기본값
            self.timeout_spin.setValue(30)
            self.retry_spin.setValue(3)
            self.max_concurrent_spin.setValue(5)
            self.user_agent_combo.setCurrentIndex(0)
            self.custom_ua_input.setText("")
            
            # 다운로드 설정 기본값
            self.max_size_spin.setValue(50)
            self.filename_pattern_combo.setCurrentIndex(0)
            self.min_width_spin.setValue(100)
            self.min_height_spin.setValue(100)
            self.supported_formats.setChecked(True)
            
            # UI 설정 기본값
            self.theme_combo.setCurrentIndex(0)
            self.language_combo.setCurrentIndex(0)
            self.thumbnail_size_spin.setValue(150)
            self.thumbnails_per_row_spin.setValue(4)
            self.enable_debug_log.setChecked(False)
            self.auto_save_log.setChecked(False) 