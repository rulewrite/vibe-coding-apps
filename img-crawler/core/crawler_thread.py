"""
크롤러 스레드 - 백그라운드에서 크롤링 작업 수행
"""

import asyncio
import time
from PyQt5.QtCore import QThread, pyqtSignal
from .image_crawler import ImageCrawler


class CrawlerThread(QThread):
    # 신호 정의
    progress = pyqtSignal(int, str)  # 진행률(%), 메시지
    images_found = pyqtSignal(list)  # 발견된 이미지 목록
    finished_signal = pyqtSignal(list)  # 완료된 결과
    error = pyqtSignal(str)  # 에러 메시지
    
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.crawler = None
        self._stop_requested = False
        
    def run(self):
        """스레드 실행"""
        try:
            self._stop_requested = False
            
            # 크롤러 인스턴스 생성
            self.crawler = ImageCrawler(self.config)
            
            # 신호 연결
            self.crawler.progress_updated.connect(self.progress.emit)
            self.crawler.images_found.connect(self.images_found.emit)
            
            # 이벤트 루프 생성 및 크롤링 실행
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # 비동기 크롤링 실행
                results = loop.run_until_complete(self.crawler.crawl())
                
                if not self._stop_requested:
                    self.finished_signal.emit(results)
                    
            except Exception as e:
                if not self._stop_requested:
                    self.error.emit(f"크롤링 중 오류 발생: {str(e)}")
            finally:
                loop.close()
                
        except Exception as e:
            self.error.emit(f"스레드 초기화 오류: {str(e)}")
            
    def stop(self):
        """크롤링 중지"""
        self._stop_requested = True
        if self.crawler:
            self.crawler.stop()
            
    def is_stop_requested(self):
        """중지 요청 확인"""
        return self._stop_requested 