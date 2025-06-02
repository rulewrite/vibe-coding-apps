"""
진행상황 위젯 - 크롤링 진행률 및 로그 표시
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QGroupBox,
                             QProgressBar, QLabel, QTextEdit, QPushButton,
                             QFrame)
from PyQt5.QtCore import pyqtSignal, QTimer, QDateTime
from PyQt5.QtGui import QFont


class ProgressWidget(QWidget):
    status_message = pyqtSignal(str)
    
    def __init__(self):
        super().__init__()
        self.start_time = None
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_elapsed_time)
        self.init_ui()
        
    def init_ui(self):
        """UI 초기화"""
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        
        # 진행률 그룹
        progress_group = self.create_progress_group()
        layout.addWidget(progress_group)
        
        # 로그 그룹
        log_group = self.create_log_group()
        layout.addWidget(log_group)
        
    def create_progress_group(self):
        """진행률 그룹 생성"""
        group = QGroupBox("📊 진행 상황")
        layout = QVBoxLayout(group)
        
        # 진행률 바
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #cccccc;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
            }
            QProgressBar::chunk {
                background-color: #4CAF50;
                border-radius: 3px;
            }
        """)
        layout.addWidget(self.progress_bar)
        
        # 진행률 라벨
        self.progress_label = QLabel("대기 중...")
        self.progress_label.setFont(QFont("", 10))
        layout.addWidget(self.progress_label)
        
        # 통계 정보
        stats_layout = QHBoxLayout()
        
        # 처리된 이미지 수
        self.processed_label = QLabel("처리됨: 0")
        self.processed_label.setStyleSheet("color: #4CAF50; font-weight: bold;")
        stats_layout.addWidget(self.processed_label)
        
        # 실패한 이미지 수
        self.failed_label = QLabel("실패: 0")
        self.failed_label.setStyleSheet("color: #f44336; font-weight: bold;")
        stats_layout.addWidget(self.failed_label)
        
        # 경과 시간
        self.elapsed_label = QLabel("경과시간: 00:00")
        self.elapsed_label.setStyleSheet("color: #2196F3; font-weight: bold;")
        stats_layout.addWidget(self.elapsed_label)
        
        layout.addLayout(stats_layout)
        
        return group
        
    def create_log_group(self):
        """로그 그룹 생성"""
        group = QGroupBox("📝 로그")
        layout = QVBoxLayout(group)
        
        # 로그 텍스트
        self.log_text = QTextEdit()
        self.log_text.setMaximumHeight(200)
        self.log_text.setReadOnly(True)
        self.log_text.setFont(QFont("Monaco", 9))  # macOS의 기본 모노스페이스 폰트
        self.log_text.setStyleSheet("""
            QTextEdit {
                background-color: #ffffff;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 8px;
                color: #333333;
                selection-background-color: #007acc;
                selection-color: white;
            }
        """)
        layout.addWidget(self.log_text)
        
        # 로그 제어 버튼
        log_controls = QHBoxLayout()
        
        clear_btn = QPushButton("로그 지우기")
        clear_btn.clicked.connect(self.clear_log)
        log_controls.addWidget(clear_btn)
        
        log_controls.addStretch()
        
        # 자동 스크롤 토글 (기본적으로 체크됨)
        self.auto_scroll = True
        
        layout.addLayout(log_controls)
        
        return group
        
    def start_progress(self):
        """진행률 시작"""
        self.start_time = QDateTime.currentDateTime()
        self.timer.start(1000)  # 1초마다 업데이트
        self.progress_bar.setValue(0)
        self.progress_label.setText("크롤링 시작...")
        self.processed_label.setText("처리됨: 0")
        self.failed_label.setText("실패: 0")
        self.add_log("✅ 크롤링을 시작합니다.")
        
    def update_progress(self, percentage, message):
        """진행률 업데이트"""
        self.progress_bar.setValue(percentage)
        self.progress_label.setText(message)
        
        # 통계 정보 업데이트 (메시지에서 파싱)
        if "처리됨:" in message:
            parts = message.split(",")
            for part in parts:
                part = part.strip()
                if "처리됨:" in part:
                    processed = part.split(":")[1].strip()
                    self.processed_label.setText(f"처리됨: {processed}")
                elif "실패:" in part:
                    failed = part.split(":")[1].strip()
                    self.failed_label.setText(f"실패: {failed}")
        
        self.add_log(f"📊 {message}")
        
    def finish_progress(self, results):
        """진행률 완료"""
        self.timer.stop()
        self.progress_bar.setValue(100)
        self.progress_label.setText("완료!")
        
        # 최종 통계
        total = len(results)
        success = sum(1 for r in results if r.get('success', False))
        failed = total - success
        
        self.processed_label.setText(f"처리됨: {success}")
        self.failed_label.setText(f"실패: {failed}")
        
        elapsed = self.get_elapsed_time()
        self.add_log(f"🎉 크롤링 완료! 총 {total}개 처리 (성공: {success}, 실패: {failed}) - 소요시간: {elapsed}")
        
    def show_error(self, error_message):
        """에러 표시"""
        self.timer.stop()
        self.progress_bar.setValue(0)
        self.progress_label.setText("오류 발생")
        self.add_log(f"❌ 오류: {error_message}")
        
    def add_log(self, message):
        """로그 추가"""
        timestamp = QDateTime.currentDateTime().toString("hh:mm:ss")
        formatted_message = f"[{timestamp}] {message}"
        
        # 텍스트 색상을 명시적으로 설정
        self.log_text.setTextColor(self.log_text.palette().text().color())
        self.log_text.append(formatted_message)
        
        # 자동 스크롤
        if self.auto_scroll:
            scrollbar = self.log_text.verticalScrollBar()
            scrollbar.setValue(scrollbar.maximum())
            
    def clear_log(self):
        """로그 지우기"""
        self.log_text.clear()
        self.add_log("로그가 지워졌습니다.")
        
    def update_elapsed_time(self):
        """경과 시간 업데이트"""
        if self.start_time:
            elapsed = self.get_elapsed_time()
            self.elapsed_label.setText(f"경과시간: {elapsed}")
            
    def get_elapsed_time(self):
        """경과 시간 문자열 반환"""
        if not self.start_time:
            return "00:00"
            
        current_time = QDateTime.currentDateTime()
        elapsed_ms = self.start_time.msecsTo(current_time)
        elapsed_seconds = elapsed_ms // 1000
        
        hours = elapsed_seconds // 3600
        minutes = (elapsed_seconds % 3600) // 60
        seconds = elapsed_seconds % 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes:02d}:{seconds:02d}" 