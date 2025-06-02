#!/usr/bin/env python3
"""
이미지 크롤러 앱 - 메인 진입점
"""

import sys
import os
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon
from ui.main_window import MainWindow

def main():
    # High DPI 스케일링 활성화 (macOS Retina 디스플레이 지원)
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
    
    app = QApplication(sys.argv)
    app.setApplicationName("이미지 크롤러")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("ImageCrawler Studio")
    
    # 다운로드 폴더 생성
    os.makedirs("downloads", exist_ok=True)
    
    # 메인 윈도우 생성 및 표시
    window = MainWindow()
    window.show()
    
    # 애플리케이션 실행
    sys.exit(app.exec_())

if __name__ == "__main__":
    main() 