"""
메인 윈도우 - 이미지 크롤러 앱의 메인 UI
"""

from PyQt5.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QTabWidget, QMenuBar, QStatusBar, QMessageBox,
                             QSplitter, QFrame)
from PyQt5.QtCore import Qt, QSize
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QAction

from .crawler_widget import CrawlerWidget
from .progress_widget import ProgressWidget
from .preview_widget import PreviewWidget
from .settings_dialog import SettingsDialog

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.setup_menu()
        self.setup_status_bar()
        
    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle("이미지 크롤러 v1.0")
        self.setMinimumSize(QSize(1200, 800))
        self.resize(1400, 900)
        
        # 중앙 위젯 설정
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)
        
        # 스플리터로 좌우 분할
        splitter = QSplitter(Qt.Horizontal)
        layout.addWidget(splitter)
        
        # 왼쪽 패널 - 크롤링 설정
        left_panel = QFrame()
        left_panel.setFrameStyle(QFrame.StyledPanel)
        left_panel.setMinimumWidth(400)
        left_panel.setMaximumWidth(500)
        
        left_layout = QVBoxLayout(left_panel)
        
        # 크롤러 위젯
        self.crawler_widget = CrawlerWidget()
        left_layout.addWidget(self.crawler_widget)
        
        # 진행상황 위젯
        self.progress_widget = ProgressWidget()
        left_layout.addWidget(self.progress_widget)
        
        splitter.addWidget(left_panel)
        
        # 오른쪽 패널 - 미리보기 및 결과
        right_panel = QFrame()
        right_panel.setFrameStyle(QFrame.StyledPanel)
        
        right_layout = QVBoxLayout(right_panel)
        
        # 미리보기 위젯
        self.preview_widget = PreviewWidget()
        right_layout.addWidget(self.preview_widget)
        
        splitter.addWidget(right_panel)
        
        # 스플리터 비율 설정 (40:60)
        splitter.setSizes([400, 800])
        
        # 신호 연결
        self.connect_signals()
        
    def setup_menu(self):
        """메뉴바 설정"""
        menubar = self.menuBar()
        
        # 파일 메뉴
        file_menu = menubar.addMenu('파일(&F)')
        
        # 설정 액션
        settings_action = QAction('설정(&S)', self)
        settings_action.setShortcut('Ctrl+,')
        settings_action.triggered.connect(self.show_settings)
        file_menu.addAction(settings_action)
        
        file_menu.addSeparator()
        
        # 종료 액션
        exit_action = QAction('종료(&X)', self)
        exit_action.setShortcut('Ctrl+Q')
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # 도움말 메뉴
        help_menu = menubar.addMenu('도움말(&H)')
        
        # 정보 액션
        about_action = QAction('이미지 크롤러 정보(&A)', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
        
    def setup_status_bar(self):
        """상태바 설정"""
        self.statusBar().showMessage("준비됨")
        
    def connect_signals(self):
        """신호 연결"""
        # 크롤러 위젯에서 진행상황 위젯으로 신호 전달
        self.crawler_widget.crawling_started.connect(self.progress_widget.start_progress)
        self.crawler_widget.crawling_progress.connect(self.progress_widget.update_progress)
        self.crawler_widget.crawling_finished.connect(self.progress_widget.finish_progress)
        self.crawler_widget.crawling_error.connect(self.progress_widget.show_error)
        
        # 크롤러 위젯에서 미리보기 위젯으로 신호 전달
        self.crawler_widget.images_found.connect(self.preview_widget.add_images)
        self.crawler_widget.crawling_finished.connect(self.preview_widget.show_results)
        
        # 상태바 메시지 업데이트
        self.crawler_widget.status_message.connect(self.statusBar().showMessage)
        self.progress_widget.status_message.connect(self.statusBar().showMessage)
        
    def show_settings(self):
        """설정 다이얼로그 표시"""
        dialog = SettingsDialog(self)
        dialog.exec_()
        
    def show_about(self):
        """정보 다이얼로그 표시"""
        QMessageBox.about(self, "이미지 크롤러 정보", 
                         """<h3>이미지 크롤러 v1.0</h3>
                         <p>웹페이지에서 이미지를 자동으로 크롤링하고 다운로드하는 앱입니다.</p>
                         <p><b>주요 기능:</b></p>
                         <ul>
                         <li>URL 패턴 반복 크롤링</li>
                         <li>CSS 선택자 기반 이미지 추출</li>
                         <li>실시간 진행상황 표시</li>
                         <li>이미지 미리보기 및 결과 요약</li>
                         </ul>
                         <p>© 2024 ImageCrawler Studio</p>""")
        
    def closeEvent(self, event):
        """앱 종료 시 확인"""
        if self.crawler_widget.is_crawling():
            reply = QMessageBox.question(self, '종료 확인',
                                       '크롤링이 진행 중입니다. 정말 종료하시겠습니까?',
                                       QMessageBox.Yes | 
                                       QMessageBox.No,
                                       QMessageBox.No)
            
            if reply == QMessageBox.Yes:
                self.crawler_widget.stop_crawling()
                event.accept()
            else:
                event.ignore()
        else:
            event.accept() 