"""
미리보기 위젯 - 이미지 미리보기 및 크롤링 결과 표시
"""

import os
from urllib.parse import urlparse
from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QGroupBox,
                             QTableWidget, QTableWidgetItem, QLabel, QPushButton,
                             QTabWidget, QScrollArea, QFrame, QGridLayout,
                             QHeaderView, QAbstractItemView, QMessageBox,
                             QFileDialog, QSplitter)
from PyQt5.QtCore import Qt, pyqtSignal, QThread, QTimer
from PyQt5.QtGui import QPixmap, QFont, QIcon
from PIL import Image
import requests


class ImageThumbnailWidget(QLabel):
    """이미지 썸네일 표시 위젯"""
    clicked = pyqtSignal(str)  # 이미지 URL
    
    def __init__(self, image_url, local_path=None):
        super().__init__()
        self.image_url = image_url
        self.local_path = local_path
        self.setFixedSize(150, 150)
        self.setAlignment(Qt.AlignCenter)
        self.setStyleSheet("""
            QLabel {
                border: 2px solid #ddd;
                border-radius: 8px;
                background-color: #f9f9f9;
                padding: 4px;
            }
            QLabel:hover {
                border-color: #4CAF50;
                background-color: #f0f8f0;
            }
        """)
        self.setText("Loading...")
        self.load_thumbnail()
        
    def load_thumbnail(self):
        """썸네일 로드"""
        try:
            if self.local_path and os.path.exists(self.local_path):
                # 로컬 파일에서 로드
                print(f"썸네일 로딩 시도: {self.local_path}")  # 디버깅용
                pixmap = QPixmap(self.local_path)
                
                if not pixmap.isNull():
                    # 비율 유지하며 크기 조정
                    scaled_pixmap = pixmap.scaled(140, 140, 
                                                Qt.KeepAspectRatio,
                                                Qt.SmoothTransformation)
                    self.setPixmap(scaled_pixmap)
                    print(f"썸네일 로딩 성공: {self.local_path}")  # 디버깅용
                else:
                    print(f"Pixmap 로딩 실패: {self.local_path}")  # 디버깅용
                    self.setText("❌\n로드 실패")
            else:
                # 파일이 없거나 경로가 없는 경우
                if self.local_path:
                    print(f"파일 없음: {self.local_path}")  # 디버깅용
                else:
                    print(f"경로 없음. URL: {self.image_url}")  # 디버깅용
                self.setText("🖼️\n다운로드\n대기중")
                
        except Exception as e:
            print(f"썸네일 로딩 오류: {e}")  # 디버깅용
            self.setText("❌\n로드 실패")
            
    def mousePressEvent(self, event):
        """클릭 이벤트"""
        if event.button() == Qt.LeftButton:
            self.clicked.emit(self.image_url)


class PreviewWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.images_data = []
        self.init_ui()
        
    def init_ui(self):
        """UI 초기화"""
        layout = QVBoxLayout(self)
        
        # 탭 위젯
        self.tab_widget = QTabWidget()
        layout.addWidget(self.tab_widget)
        
        # 미리보기 탭
        preview_tab = self.create_preview_tab()
        self.tab_widget.addTab(preview_tab, "🖼️ 미리보기")
        
        # 결과 테이블 탭
        results_tab = self.create_results_tab()
        self.tab_widget.addTab(results_tab, "📊 결과 목록")
        
        # 통계 탭
        stats_tab = self.create_stats_tab()
        self.tab_widget.addTab(stats_tab, "📈 통계")
        
    def create_preview_tab(self):
        """미리보기 탭 생성"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # 컨트롤 버튼들
        controls_layout = QHBoxLayout()
        
        self.refresh_btn = QPushButton("🔄 새로고침")
        self.refresh_btn.clicked.connect(self.refresh_thumbnails)
        controls_layout.addWidget(self.refresh_btn)
        
        self.open_folder_btn = QPushButton("📁 폴더 열기")
        self.open_folder_btn.clicked.connect(self.open_download_folder)
        controls_layout.addWidget(self.open_folder_btn)
        
        controls_layout.addStretch()
        
        self.image_count_label = QLabel("이미지: 0개")
        self.image_count_label.setFont(QFont("", 10, QFont.Weight.Bold))
        controls_layout.addWidget(self.image_count_label)
        
        layout.addLayout(controls_layout)
        
        # 스크롤 가능한 이미지 그리드
        self.scroll_area = QScrollArea()
        self.scroll_widget = QWidget()
        self.grid_layout = QGridLayout(self.scroll_widget)
        self.grid_layout.setSpacing(10)
        
        self.scroll_area.setWidget(self.scroll_widget)
        self.scroll_area.setWidgetResizable(True)
        layout.addWidget(self.scroll_area)
        
        return widget
        
    def create_results_tab(self):
        """결과 테이블 탭 생성"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # 결과 테이블
        self.results_table = QTableWidget()
        self.results_table.setColumnCount(5)
        self.results_table.setHorizontalHeaderLabels([
            "상태", "파일명", "원본 URL", "크기", "다운로드 시간"
        ])
        
        # 테이블 설정
        header = self.results_table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeToContents)  # 상태
        header.setSectionResizeMode(1, QHeaderView.Stretch)          # 파일명
        header.setSectionResizeMode(2, QHeaderView.Stretch)          # URL
        header.setSectionResizeMode(3, QHeaderView.ResizeToContents)  # 크기
        header.setSectionResizeMode(4, QHeaderView.ResizeToContents)  # 시간
        
        self.results_table.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.results_table.setAlternatingRowColors(True)
        
        layout.addWidget(self.results_table)
        
        # 테이블 컨트롤
        table_controls = QHBoxLayout()
        
        export_btn = QPushButton("📄 결과 내보내기")
        export_btn.clicked.connect(self.export_results)
        table_controls.addWidget(export_btn)
        
        table_controls.addStretch()
        
        layout.addLayout(table_controls)
        
        return widget
        
    def create_stats_tab(self):
        """통계 탭 생성"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # 통계 그룹들
        summary_group = self.create_summary_stats()
        layout.addWidget(summary_group)
        
        file_types_group = self.create_file_types_stats()
        layout.addWidget(file_types_group)
        
        domains_group = self.create_domains_stats()
        layout.addWidget(domains_group)
        
        layout.addStretch()
        
        return widget
        
    def create_summary_stats(self):
        """요약 통계 그룹"""
        group = QGroupBox("📊 요약 통계")
        layout = QGridLayout(group)
        
        self.total_images_label = QLabel("총 이미지: 0")
        self.success_images_label = QLabel("성공: 0")
        self.failed_images_label = QLabel("실패: 0")
        self.total_size_label = QLabel("총 크기: 0 MB")
        
        labels = [
            self.total_images_label,
            self.success_images_label,
            self.failed_images_label,
            self.total_size_label
        ]
        
        for i, label in enumerate(labels):
            label.setFont(QFont("", 12, QFont.Weight.Bold))
            label.setStyleSheet("padding: 10px; border: 1px solid #ddd; border-radius: 4px;")
            layout.addWidget(label, i // 2, i % 2)
            
        return group
        
    def create_file_types_stats(self):
        """파일 타입 통계 그룹"""
        group = QGroupBox("📁 파일 타입별 통계")
        layout = QVBoxLayout(group)
        
        self.file_types_label = QLabel("파일 타입별 분포가 여기에 표시됩니다.")
        self.file_types_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.file_types_label)
        
        return group
        
    def create_domains_stats(self):
        """도메인별 통계 그룹"""
        group = QGroupBox("🌐 도메인별 통계")
        layout = QVBoxLayout(group)
        
        self.domains_label = QLabel("도메인별 분포가 여기에 표시됩니다.")
        self.domains_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.domains_label)
        
        return group
        
    def add_images(self, images):
        """이미지 추가"""
        self.images_data.extend(images)
        self.update_image_count()
        self.refresh_thumbnails()
        
    def refresh_thumbnails(self):
        """썸네일 새로고침"""
        print(f"썸네일 새로고침 시작. 이미지 데이터 개수: {len(self.images_data)}")  # 디버깅용
        
        # 기존 썸네일 제거
        for i in reversed(range(self.grid_layout.count())):
            child = self.grid_layout.itemAt(i).widget()
            if child:
                child.setParent(None)
            
        # 새 썸네일 추가
        columns = 4  # 한 행당 이미지 수
        for i, image_data in enumerate(self.images_data):
            row = i // columns
            col = i % columns
            
            print(f"썸네일 {i+1} 생성 중: {image_data}")  # 디버깅용
            
            thumbnail = ImageThumbnailWidget(
                image_data.get('url', ''),
                image_data.get('local_path', '')
            )
            thumbnail.clicked.connect(self.on_thumbnail_clicked)
            
            self.grid_layout.addWidget(thumbnail, row, col)
        
        print(f"썸네일 새로고침 완료")  # 디버깅용
        
    def update_image_count(self):
        """이미지 개수 업데이트"""
        count = len(self.images_data)
        self.image_count_label.setText(f"이미지: {count}개")
        
    def on_thumbnail_clicked(self, image_url):
        """썸네일 클릭 처리"""
        # 간단한 정보 표시
        QMessageBox.information(self, "이미지 정보", 
                               f"원본 URL: {image_url}")
        
    def show_results(self, results):
        """크롤링 결과 표시"""
        # 다운로드된 이미지들을 미리보기에 추가
        downloaded_images = []
        for result in results:
            if result.get('success', False) and result.get('local_path'):
                # 다운로드 결과를 이미지 데이터 형식으로 변환
                image_data = {
                    'url': result.get('url', ''),
                    'local_path': result.get('local_path', ''),
                    'filename': result.get('filename', ''),
                    'size': result.get('size', 0)
                }
                downloaded_images.append(image_data)
        
        # 기존 이미지 데이터를 다운로드된 것들로 교체
        if downloaded_images:
            self.images_data = downloaded_images
            self.update_image_count()
            self.refresh_thumbnails()
        
        # 결과 테이블과 통계 업데이트
        self.populate_results_table(results)
        self.update_statistics(results)
        
    def populate_results_table(self, results):
        """결과 테이블 채우기"""
        self.results_table.setRowCount(len(results))
        
        for row, result in enumerate(results):
            # 상태
            status = "✅" if result.get('success', False) else "❌"
            self.results_table.setItem(row, 0, QTableWidgetItem(status))
            
            # 파일명
            filename = result.get('filename', '알 수 없음')
            self.results_table.setItem(row, 1, QTableWidgetItem(filename))
            
            # 원본 URL
            url = result.get('url', '알 수 없음')
            self.results_table.setItem(row, 2, QTableWidgetItem(url))
            
            # 크기
            size = result.get('size', 0)
            size_str = self.format_size(size) if size > 0 else "알 수 없음"
            self.results_table.setItem(row, 3, QTableWidgetItem(size_str))
            
            # 다운로드 시간
            download_time = result.get('download_time', '알 수 없음')
            self.results_table.setItem(row, 4, QTableWidgetItem(str(download_time)))
            
    def update_statistics(self, results):
        """통계 업데이트"""
        total = len(results)
        success = sum(1 for r in results if r.get('success', False))
        failed = total - success
        total_size = sum(r.get('size', 0) for r in results if r.get('success', False))
        
        # 요약 통계 업데이트
        self.total_images_label.setText(f"총 이미지: {total}")
        self.success_images_label.setText(f"성공: {success}")
        self.success_images_label.setStyleSheet("padding: 10px; border: 1px solid #4CAF50; border-radius: 4px; color: #4CAF50;")
        
        self.failed_images_label.setText(f"실패: {failed}")
        self.failed_images_label.setStyleSheet("padding: 10px; border: 1px solid #f44336; border-radius: 4px; color: #f44336;")
        
        self.total_size_label.setText(f"총 크기: {self.format_size(total_size)}")
        
        # 파일 타입 통계
        file_types = {}
        for result in results:
            if result.get('success', False):
                filename = result.get('filename', '')
                ext = os.path.splitext(filename)[1].lower()
                file_types[ext] = file_types.get(ext, 0) + 1
                
        file_types_text = "\n".join([f"{ext or '확장자 없음'}: {count}개" 
                                   for ext, count in file_types.items()])
        self.file_types_label.setText(file_types_text or "파일 타입 정보 없음")
        
        # 도메인 통계
        domains = {}
        for result in results:
            if result.get('success', False):
                url = result.get('url', '')
                domain = urlparse(url).netloc
                domains[domain] = domains.get(domain, 0) + 1
                
        domains_text = "\n".join([f"{domain}: {count}개" 
                                for domain, count in domains.items()])
        self.domains_label.setText(domains_text or "도메인 정보 없음")
        
    def format_size(self, size_bytes):
        """파일 크기 포맷팅"""
        if size_bytes == 0:
            return "0 B"
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024.0 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        return f"{size_bytes:.1f} {size_names[i]}"
        
    def open_download_folder(self):
        """다운로드 폴더 열기"""
        download_path = os.path.join(os.getcwd(), "downloads")
        if os.path.exists(download_path):
            import platform
            import subprocess
            
            system = platform.system()
            try:
                if system == "Windows":
                    os.startfile(download_path)
                elif system == "Darwin":  # macOS
                    subprocess.run(["open", download_path])
                elif system == "Linux":
                    subprocess.run(["xdg-open", download_path])
                else:
                    # 지원하지 않는 OS의 경우 기본 파일 탐색기 시도
                    subprocess.run(["xdg-open", download_path])
            except Exception as e:
                QMessageBox.information(self, "알림", 
                                      f"폴더를 열 수 없습니다: {e}\n\n폴더 경로: {download_path}")
        else:
            QMessageBox.information(self, "알림", "다운로드 폴더가 존재하지 않습니다.")
            
    def export_results(self):
        """결과 내보내기"""
        filename, _ = QFileDialog.getSaveFileName(
            self, "결과 내보내기", "crawling_results.csv", "CSV Files (*.csv)")
        
        if filename:
            try:
                # CSV 내보내기 구현
                import csv
                with open(filename, 'w', newline='', encoding='utf-8') as file:
                    writer = csv.writer(file)
                    writer.writerow(["상태", "파일명", "원본 URL", "크기", "다운로드 시간"])
                    
                    for row in range(self.results_table.rowCount()):
                        row_data = []
                        for col in range(self.results_table.columnCount()):
                            item = self.results_table.item(row, col)
                            row_data.append(item.text() if item else "")
                        writer.writerow(row_data)
                        
                QMessageBox.information(self, "내보내기 완료", 
                                      f"결과가 성공적으로 저장되었습니다:\n{filename}")
            except Exception as e:
                QMessageBox.critical(self, "내보내기 오류", 
                                   f"파일을 저장할 수 없습니다:\n{e}")
                
    def clear_all(self):
        """모든 데이터 지우기"""
        self.images_data.clear()
        self.refresh_thumbnails()
        self.update_image_count()
        self.results_table.setRowCount(0)
        
        # 통계 초기화
        self.total_images_label.setText("총 이미지: 0")
        self.success_images_label.setText("성공: 0")
        self.failed_images_label.setText("실패: 0")
        self.total_size_label.setText("총 크기: 0 MB")
        self.file_types_label.setText("파일 타입별 분포가 여기에 표시됩니다.")
        self.domains_label.setText("도메인별 분포가 여기에 표시됩니다.") 