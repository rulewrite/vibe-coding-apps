"""
크롤러 위젯 - URL 입력, 선택자 설정, 크롤링 제어
"""

import os
from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QGroupBox,
                             QLineEdit, QTextEdit, QPushButton, QLabel,
                             QSpinBox, QCheckBox, QFileDialog, QMessageBox,
                             QGridLayout, QFrame, QScrollArea)
from PyQt5.QtCore import QThread, pyqtSignal, QSettings
import validators

from core.crawler_thread import CrawlerThread


class CrawlerWidget(QWidget):
    # 신호 정의
    crawling_started = pyqtSignal()
    crawling_progress = pyqtSignal(int, str)  # 진행률, 메시지
    crawling_finished = pyqtSignal(list)  # 결과 리스트
    crawling_error = pyqtSignal(str)  # 에러 메시지
    images_found = pyqtSignal(list)  # 발견된 이미지 리스트
    status_message = pyqtSignal(str)  # 상태 메시지
    
    def __init__(self):
        super().__init__()
        self.crawler_thread = None
        self.settings = QSettings()
        self.init_ui()
        self.load_settings()
        
    def init_ui(self):
        """UI 초기화"""
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        
        # 스크롤 가능한 영역
        scroll = QScrollArea()
        scroll_widget = QWidget()
        scroll_layout = QVBoxLayout(scroll_widget)
        
        # URL 설정 그룹
        url_group = self.create_url_group()
        scroll_layout.addWidget(url_group)
        
        # 선택자 설정 그룹
        selector_group = self.create_selector_group()
        scroll_layout.addWidget(selector_group)
        
        # 반복 설정 그룹
        repeat_group = self.create_repeat_group()
        scroll_layout.addWidget(repeat_group)
        
        # 저장 설정 그룹
        save_group = self.create_save_group()
        scroll_layout.addWidget(save_group)
        
        scroll.setWidget(scroll_widget)
        scroll.setWidgetResizable(True)
        layout.addWidget(scroll)
        
        # 제어 버튼
        control_layout = self.create_control_buttons()
        layout.addLayout(control_layout)
        
    def create_url_group(self):
        """URL 입력 그룹 생성"""
        group = QGroupBox("🌐 URL 설정")
        layout = QVBoxLayout(group)
        
        # 기본 URL 입력
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("예: https://example.com/images/page={}")
        self.url_input.textChanged.connect(self.validate_url)
        layout.addWidget(QLabel("크롤링할 URL:"))
        layout.addWidget(self.url_input)
        
        # URL 유효성 표시
        self.url_status_label = QLabel("URL을 입력해주세요")
        self.url_status_label.setStyleSheet("color: gray; font-size: 12px;")
        layout.addWidget(self.url_status_label)
        
        return group
        
    def create_selector_group(self):
        """CSS 선택자 설정 그룹 생성"""
        group = QGroupBox("🎯 이미지 선택자")
        layout = QVBoxLayout(group)
        
        # 선택자 입력 (여러 줄)
        layout.addWidget(QLabel("CSS 선택자 (한 줄에 하나씩):"))
        self.selectors_input = QTextEdit()
        self.selectors_input.setPlaceholderText("""img
.main-image img
.thumbnail img
[class*='image'] img""")
        self.selectors_input.setMaximumHeight(100)
        layout.addWidget(self.selectors_input)
        
        # 기본 설정 버튼들
        buttons_layout = QHBoxLayout()
        
        common_btn = QPushButton("일반적인 선택자")
        common_btn.clicked.connect(self.set_common_selectors)
        buttons_layout.addWidget(common_btn)
        
        gallery_btn = QPushButton("갤러리용 선택자")
        gallery_btn.clicked.connect(self.set_gallery_selectors)
        buttons_layout.addWidget(gallery_btn)
        
        layout.addLayout(buttons_layout)
        
        return group
        
    def create_repeat_group(self):
        """반복 설정 그룹 생성"""
        group = QGroupBox("🔄 반복 크롤링 설정")
        layout = QVBoxLayout(group)
        
        # 반복 활성화 체크박스
        self.enable_repeat = QCheckBox("URL 패턴 반복 활성화")
        self.enable_repeat.toggled.connect(self.toggle_repeat_settings)
        layout.addWidget(self.enable_repeat)
        
        # 반복 설정 프레임
        self.repeat_frame = QFrame()
        repeat_layout = QGridLayout(self.repeat_frame)
        
        # 시작값
        repeat_layout.addWidget(QLabel("시작값:"), 0, 0)
        self.start_value = QSpinBox()
        self.start_value.setRange(0, 10000)
        self.start_value.setValue(1)
        repeat_layout.addWidget(self.start_value, 0, 1)
        
        # 끝값
        repeat_layout.addWidget(QLabel("끝값:"), 0, 2)
        self.end_value = QSpinBox()
        self.end_value.setRange(0, 10000)
        self.end_value.setValue(10)
        repeat_layout.addWidget(self.end_value, 0, 3)
        
        # 증가값
        repeat_layout.addWidget(QLabel("증가값:"), 1, 0)
        self.step_value = QSpinBox()
        self.step_value.setRange(1, 100)
        self.step_value.setValue(1)
        repeat_layout.addWidget(self.step_value, 1, 1)
        
        # 동시 연결 수
        repeat_layout.addWidget(QLabel("동시 연결:"), 1, 2)
        self.concurrent_value = QSpinBox()
        self.concurrent_value.setRange(1, 10)
        self.concurrent_value.setValue(3)
        repeat_layout.addWidget(self.concurrent_value, 1, 3)
        
        self.repeat_frame.setEnabled(False)
        layout.addWidget(self.repeat_frame)
        
        return group
        
    def create_save_group(self):
        """저장 설정 그룹 생성"""
        group = QGroupBox("💾 저장 설정")
        layout = QVBoxLayout(group)
        
        # 저장 경로
        path_layout = QHBoxLayout()
        layout.addWidget(QLabel("저장 경로:"))
        
        self.save_path_input = QLineEdit()
        self.save_path_input.setText(os.path.join(os.getcwd(), "downloads"))
        path_layout.addWidget(self.save_path_input)
        
        browse_btn = QPushButton("찾아보기")
        browse_btn.clicked.connect(self.browse_save_path)
        path_layout.addWidget(browse_btn)
        
        layout.addLayout(path_layout)
        
        # 추가 옵션들
        options_layout = QVBoxLayout()
        
        self.overwrite_check = QCheckBox("기존 파일 덮어쓰기")
        options_layout.addWidget(self.overwrite_check)
        
        self.create_subfolder_check = QCheckBox("도메인별 하위 폴더 생성")
        self.create_subfolder_check.setChecked(True)
        options_layout.addWidget(self.create_subfolder_check)
        
        layout.addLayout(options_layout)
        
        return group
        
    def create_control_buttons(self):
        """제어 버튼 생성"""
        layout = QHBoxLayout()
        
        self.start_btn = QPushButton("🚀 크롤링 시작")
        self.start_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
                border-radius: 6px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        self.start_btn.clicked.connect(self.start_crawling)
        
        self.stop_btn = QPushButton("⏹ 중지")
        self.stop_btn.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
                border-radius: 6px;
            }
            QPushButton:hover {
                background-color: #da190b;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        self.stop_btn.clicked.connect(self.stop_crawling)
        self.stop_btn.setEnabled(False)
        
        layout.addWidget(self.start_btn)
        layout.addWidget(self.stop_btn)
        
        return layout
        
    def validate_url(self):
        """URL 유효성 검사"""
        url = self.url_input.text().strip()
        if not url:
            self.url_status_label.setText("URL을 입력해주세요")
            self.url_status_label.setStyleSheet("color: gray; font-size: 12px;")
            return False
            
        # {} 패턴 체크
        if self.enable_repeat.isChecked() and '{}' not in url:
            self.url_status_label.setText("⚠️ 반복 크롤링을 위해 {} 패턴이 필요합니다")
            self.url_status_label.setStyleSheet("color: orange; font-size: 12px;")
            return False
            
        # URL 유효성 검사 (기본 템플릿 체크)
        test_url = url.replace('{}', '1')
        if validators.url(test_url):
            self.url_status_label.setText("✅ 유효한 URL입니다")
            self.url_status_label.setStyleSheet("color: green; font-size: 12px;")
            return True
        else:
            self.url_status_label.setText("❌ 유효하지 않은 URL입니다")
            self.url_status_label.setStyleSheet("color: red; font-size: 12px;")
            return False
            
    def toggle_repeat_settings(self, enabled):
        """반복 설정 활성화/비활성화"""
        self.repeat_frame.setEnabled(enabled)
        self.validate_url()
        
    def set_common_selectors(self):
        """일반적인 선택자 설정"""
        selectors = """img
img[src]
.image img
.photo img
[class*='img'] img"""
        self.selectors_input.setPlainText(selectors)
        
    def set_gallery_selectors(self):
        """갤러리용 선택자 설정"""
        selectors = """.gallery img
.thumbnail img
.preview img
.main-image img
.content img
article img"""
        self.selectors_input.setPlainText(selectors)
        
    def browse_save_path(self):
        """저장 경로 선택"""
        path = QFileDialog.getExistingDirectory(self, "저장 경로 선택")
        if path:
            self.save_path_input.setText(path)
            
    def start_crawling(self):
        """크롤링 시작"""
        if not self.validate_inputs():
            return
            
        # 설정 저장
        self.save_settings()
        
        # UI 상태 변경
        self.start_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)
        
        # 크롤링 스레드 시작
        self.crawler_thread = CrawlerThread(self.get_crawl_config())
        self.crawler_thread.progress.connect(self.crawling_progress.emit)
        self.crawler_thread.images_found.connect(self.images_found.emit)
        self.crawler_thread.finished_signal.connect(self.on_crawling_finished)
        self.crawler_thread.error.connect(self.on_crawling_error)
        
        self.crawler_thread.start()
        self.crawling_started.emit()
        self.status_message.emit("크롤링을 시작합니다...")
        
    def stop_crawling(self):
        """크롤링 중지"""
        if self.crawler_thread and self.crawler_thread.isRunning():
            self.crawler_thread.stop()
            self.crawler_thread.wait()
            
        self.reset_ui_state()
        self.status_message.emit("크롤링이 중지되었습니다")
        
    def validate_inputs(self):
        """입력값 유효성 검사"""
        if not self.validate_url():
            QMessageBox.warning(self, "입력 오류", "올바른 URL을 입력해주세요.")
            return False
            
        selectors = self.get_selectors()
        if not selectors:
            QMessageBox.warning(self, "입력 오류", "최소 하나의 CSS 선택자를 입력해주세요.")
            return False
            
        if not os.path.exists(self.save_path_input.text()):
            try:
                os.makedirs(self.save_path_input.text(), exist_ok=True)
            except Exception as e:
                QMessageBox.warning(self, "경로 오류", f"저장 경로를 생성할 수 없습니다: {e}")
                return False
                
        return True
        
    def get_selectors(self):
        """선택자 목록 반환"""
        text = self.selectors_input.toPlainText().strip()
        if not text:
            return []
        return [line.strip() for line in text.split('\n') if line.strip()]
        
    def get_crawl_config(self):
        """크롤링 설정 반환"""
        config = {
            'url': self.url_input.text().strip(),
            'selectors': self.get_selectors(),
            'save_path': self.save_path_input.text().strip(),
            'overwrite': self.overwrite_check.isChecked(),
            'create_subfolder': self.create_subfolder_check.isChecked(),
            'repeat_enabled': self.enable_repeat.isChecked(),
            'start_value': self.start_value.value(),
            'end_value': self.end_value.value(),
            'step_value': self.step_value.value(),
            'concurrent': self.concurrent_value.value()
        }
        return config
        
    def on_crawling_finished(self, results):
        """크롤링 완료 처리"""
        self.reset_ui_state()
        self.crawling_finished.emit(results)
        self.status_message.emit(f"크롤링 완료: {len(results)}개 이미지 처리됨")
        
    def on_crawling_error(self, error_msg):
        """크롤링 오류 처리"""
        self.reset_ui_state()
        self.crawling_error.emit(error_msg)
        self.status_message.emit(f"크롤링 오류: {error_msg}")
        QMessageBox.critical(self, "크롤링 오류", error_msg)
        
    def reset_ui_state(self):
        """UI 상태 초기화"""
        self.start_btn.setEnabled(True)
        self.stop_btn.setEnabled(False)
        
    def is_crawling(self):
        """크롤링 중인지 확인"""
        return self.crawler_thread and self.crawler_thread.isRunning()
        
    def save_settings(self):
        """설정 저장"""
        self.settings.setValue("url", self.url_input.text())
        self.settings.setValue("selectors", self.selectors_input.toPlainText())
        self.settings.setValue("save_path", self.save_path_input.text())
        self.settings.setValue("overwrite", self.overwrite_check.isChecked())
        self.settings.setValue("create_subfolder", self.create_subfolder_check.isChecked())
        self.settings.setValue("repeat_enabled", self.enable_repeat.isChecked())
        self.settings.setValue("start_value", self.start_value.value())
        self.settings.setValue("end_value", self.end_value.value())
        self.settings.setValue("step_value", self.step_value.value())
        self.settings.setValue("concurrent", self.concurrent_value.value())
        
    def load_settings(self):
        """설정 로드"""
        # 안전한 기본값으로 시작
        default_url = ""
        default_selectors = "img"
        default_path = os.path.join(os.getcwd(), "downloads")
        
        self.url_input.setText(self.settings.value("url", default_url))
        self.selectors_input.setPlainText(self.settings.value("selectors", default_selectors))
        self.save_path_input.setText(self.settings.value("save_path", default_path))
        self.overwrite_check.setChecked(self.settings.value("overwrite", False, type=bool))
        self.create_subfolder_check.setChecked(self.settings.value("create_subfolder", True, type=bool))
        self.enable_repeat.setChecked(self.settings.value("repeat_enabled", False, type=bool))
        self.start_value.setValue(self.settings.value("start_value", 1, type=int))
        self.end_value.setValue(self.settings.value("end_value", 10, type=int))
        self.step_value.setValue(self.settings.value("step_value", 1, type=int))
        self.concurrent_value.setValue(self.settings.value("concurrent", 3, type=int)) 