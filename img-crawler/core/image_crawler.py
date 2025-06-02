"""
이미지 크롤러 - 웹페이지에서 이미지 추출 및 다운로드
"""

import os
import re
import asyncio
import aiohttp
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from PyQt5.QtCore import QObject, pyqtSignal
from .downloader import ImageDownloader
from .url_generator import URLGenerator


class ImageCrawler(QObject):
    # 신호 정의
    progress_updated = pyqtSignal(int, str)  # 진행률, 메시지
    images_found = pyqtSignal(list)  # 발견된 이미지들
    
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.url_generator = URLGenerator(config)
        self.downloader = ImageDownloader(config)
        self._stop_requested = False
        
        # 설정에서 값 가져오기
        self.selectors = config.get('selectors', ['img'])
        self.save_path = config.get('save_path', 'downloads')
        self.concurrent_limit = config.get('concurrent', 3)
        
        # 크롤링 통계
        self.total_urls = 0
        self.processed_urls = 0
        self.found_images = []
        self.download_results = []
        
    async def crawl(self):
        """크롤링 실행"""
        try:
            # URL 목록 생성
            urls = self.url_generator.generate_urls()
            self.total_urls = len(urls)
            
            self.progress_updated.emit(0, f"크롤링 시작: {self.total_urls}개 URL 처리 예정")
            
            # 세마포어로 동시 연결 수 제한
            semaphore = asyncio.Semaphore(self.concurrent_limit)
            
            # aiohttp 세션 생성
            timeout = aiohttp.ClientTimeout(total=30)
            connector = aiohttp.TCPConnector(ssl=False)  # SSL 검증 비활성화
            async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
                # 모든 URL 병렬 처리
                tasks = [self._crawl_single_url(session, semaphore, url) for url in urls]
                await asyncio.gather(*tasks, return_exceptions=True)
                
            # 이미지 다운로드
            if self.found_images and not self._stop_requested:
                self.progress_updated.emit(50, f"이미지 다운로드 시작: {len(self.found_images)}개 이미지")
                
                download_results = await self.downloader.download_images(self.found_images)
                self.download_results.extend(download_results)
                
            self.progress_updated.emit(100, f"크롤링 완료: {len(self.download_results)}개 이미지 처리")
            return self.download_results
            
        except Exception as e:
            raise Exception(f"크롤링 실행 오류: {str(e)}")
            
    async def _crawl_single_url(self, session, semaphore, url):
        """단일 URL 크롤링"""
        async with semaphore:
            if self._stop_requested:
                return
                
            try:
                # User-Agent 설정
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        html = await response.text()
                        images = self._extract_images(html, url)
                        
                        if images:
                            self.found_images.extend(images)
                            self.images_found.emit(images)
                            
                        self.processed_urls += 1
                        progress = int((self.processed_urls / self.total_urls) * 50)  # 50%까지만 (다운로드가 나머지 50%)
                        
                        self.progress_updated.emit(
                            progress, 
                            f"URL 처리 중: {self.processed_urls}/{self.total_urls} ({len(images)}개 이미지 발견)"
                        )
                        
                    else:
                        self.processed_urls += 1
                        print(f"HTTP {response.status}: {url}")
                        
            except Exception as e:
                self.processed_urls += 1
                print(f"URL 크롤링 오류 {url}: {e}")
                
    def _extract_images(self, html, base_url):
        """HTML에서 이미지 URL 추출"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            images = []
            image_urls = set()  # 중복 제거용
            
            for selector in self.selectors:
                try:
                    # CSS 선택자로 이미지 요소 찾기
                    img_elements = soup.select(selector)
                    
                    for img in img_elements:
                        if self._stop_requested:
                            break
                            
                        # src 속성에서 이미지 URL 추출
                        img_url = img.get('src') or img.get('data-src') or img.get('data-original')
                        
                        if img_url:
                            # 상대 URL을 절대 URL로 변환
                            img_url = urljoin(base_url, img_url)
                            
                            # 중복 체크
                            if img_url not in image_urls:
                                image_urls.add(img_url)
                                
                                # 이미지 정보 구성
                                image_info = {
                                    'url': img_url,
                                    'alt': img.get('alt', ''),
                                    'title': img.get('title', ''),
                                    'source_url': base_url,
                                    'selector': selector
                                }
                                
                                # 이미지 URL 유효성 검사
                                if self._is_valid_image_url(img_url):
                                    images.append(image_info)
                                    
                except Exception as e:
                    print(f"선택자 '{selector}' 처리 오류: {e}")
                    continue
                    
            return images
            
        except Exception as e:
            print(f"HTML 파싱 오류: {e}")
            return []
            
    def _is_valid_image_url(self, url):
        """이미지 URL 유효성 검사"""
        try:
            # 기본 URL 형식 검사
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return False
                
            # 이미지 확장자 검사 (선택적)
            if self.config.get('check_extensions', True):
                valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
                url_lower = url.lower()
                
                # URL에 쿼리 매개변수가 있는 경우 제거하고 검사
                url_path = parsed.path.lower()
                if any(url_path.endswith(ext) for ext in valid_extensions):
                    return True
                    
                # 확장자가 없어도 이미지일 수 있으므로 허용 (설정에 따라)
                if not self.config.get('strict_extensions', False):
                    return True
                    
                return False
                
            return True
            
        except Exception:
            return False
            
    def stop(self):
        """크롤링 중지"""
        self._stop_requested = True
        self.downloader.stop()
        
    def get_statistics(self):
        """크롤링 통계 반환"""
        return {
            'total_urls': self.total_urls,
            'processed_urls': self.processed_urls,
            'found_images': len(self.found_images),
            'downloaded_images': len([r for r in self.download_results if r.get('success', False)]),
            'failed_downloads': len([r for r in self.download_results if not r.get('success', False)])
        } 