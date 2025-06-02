"""
이미지 다운로더 - 이미지 파일 다운로드 및 저장
"""

import os
import asyncio
import aiohttp
import time
from urllib.parse import urlparse, unquote
from pathlib import Path
from datetime import datetime


class ImageDownloader:
    def __init__(self, config):
        self.config = config
        self.save_path = config.get('save_path', 'downloads')
        self.overwrite = config.get('overwrite', False)
        self.create_subfolder = config.get('create_subfolder', True)
        self.concurrent_limit = config.get('concurrent', 3)
        self._stop_requested = False
        
        # 저장 폴더 생성
        os.makedirs(self.save_path, exist_ok=True)
        
    async def download_images(self, images):
        """이미지 목록 다운로드"""
        if not images:
            return []
            
        results = []
        semaphore = asyncio.Semaphore(self.concurrent_limit)
        
        # aiohttp 세션 생성
        timeout = aiohttp.ClientTimeout(total=60)
        connector = aiohttp.TCPConnector(ssl=False)  # SSL 검증 비활성화
        async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
            # 병렬 다운로드 작업 생성
            tasks = [
                self._download_single_image(session, semaphore, img, i) 
                for i, img in enumerate(images)
            ]
            
            # 모든 다운로드 완료 대기
            download_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 예외 처리 및 결과 정리
            for result in download_results:
                if isinstance(result, Exception):
                    results.append({
                        'success': False,
                        'error': str(result),
                        'url': 'unknown'
                    })
                else:
                    results.append(result)
                    
        return results
        
    async def _download_single_image(self, session, semaphore, image_info, index):
        """단일 이미지 다운로드"""
        async with semaphore:
            if self._stop_requested:
                return {
                    'success': False,
                    'error': 'Download cancelled',
                    'url': image_info.get('url', '')
                }
                
            start_time = time.time()
            
            try:
                url = image_info.get('url', '')
                if not url:
                    return {
                        'success': False,
                        'error': 'No URL provided',
                        'url': ''
                    }
                    
                # 헤더 설정
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': image_info.get('source_url', '')
                }
                
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        # 파일명 생성
                        filename = self._generate_filename(url, image_info, index)
                        file_path = self._get_file_path(url, filename)
                        
                        # 파일이 이미 존재하고 덮어쓰기가 비활성화된 경우
                        if os.path.exists(file_path) and not self.overwrite:
                            return {
                                'success': True,
                                'url': url,
                                'filename': filename,
                                'local_path': file_path,
                                'size': os.path.getsize(file_path),
                                'download_time': 0,
                                'status': 'skipped (already exists)'
                            }
                            
                        # 파일 다운로드
                        content = await response.read()
                        
                        # 디렉토리 생성
                        os.makedirs(os.path.dirname(file_path), exist_ok=True)
                        
                        # 파일 저장
                        with open(file_path, 'wb') as f:
                            f.write(content)
                            
                        download_time = time.time() - start_time
                        
                        return {
                            'success': True,
                            'url': url,
                            'filename': filename,
                            'local_path': file_path,
                            'size': len(content),
                            'download_time': round(download_time, 2),
                            'status': 'downloaded'
                        }
                        
                    else:
                        return {
                            'success': False,
                            'error': f'HTTP {response.status}',
                            'url': url,
                            'download_time': time.time() - start_time
                        }
                        
            except Exception as e:
                return {
                    'success': False,
                    'error': str(e),
                    'url': image_info.get('url', ''),
                    'download_time': time.time() - start_time
                }
                
    def _generate_filename(self, url, image_info, index):
        """파일명 생성"""
        try:
            # URL에서 원본 파일명 추출
            parsed = urlparse(url)
            original_filename = os.path.basename(unquote(parsed.path))
            
            # 확장자가 없는 경우 기본값 설정
            if not os.path.splitext(original_filename)[1]:
                original_filename += '.jpg'
                
            # 파일명이 비어있는 경우
            if not original_filename or original_filename == '.jpg':
                original_filename = f"image_{index}.jpg"
                
            # 파일명 패턴 적용 (설정에 따라)
            filename_pattern = self.config.get('filename_pattern', 0)
            
            if filename_pattern == 1:  # 원본파일명_타임스탬프
                name, ext = os.path.splitext(original_filename)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{name}_{timestamp}{ext}"
                
            elif filename_pattern == 2:  # 순번_원본파일명
                filename = f"{index:04d}_{original_filename}"
                
            elif filename_pattern == 3:  # 도메인_순번_원본파일명
                domain = urlparse(url).netloc.replace('.', '_')
                filename = f"{domain}_{index:04d}_{original_filename}"
                
            else:  # 원본 파일명 유지
                filename = original_filename
                
            # 파일명에서 위험한 문자 제거
            filename = self._sanitize_filename(filename)
            
            return filename
            
        except Exception as e:
            # 오류 발생 시 기본 파일명 사용
            return f"image_{index}_{int(time.time())}.jpg"
            
    def _get_file_path(self, url, filename):
        """파일 저장 경로 생성 (크로스 플랫폼 호환)"""
        from pathlib import Path
        
        base_path = Path(self.save_path)
        
        if self.create_subfolder:
            # 도메인별 하위 폴더 생성
            domain = urlparse(url).netloc
            domain_folder = self._sanitize_filename(domain)
            file_path = base_path / domain_folder / filename
        else:
            file_path = base_path / filename
            
        return str(file_path)
        
    def _sanitize_filename(self, filename):
        """파일명에서 위험한 문자 제거 (Windows 호환)"""
        import re
        import platform
        
        # Windows에서 금지된 문자들 제거
        if platform.system() == "Windows":
            # Windows 금지 문자: < > : " | ? * / \
            sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
            
            # Windows 예약어 처리
            reserved_names = [
                'CON', 'PRN', 'AUX', 'NUL',
                'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
                'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
            ]
            name, ext = os.path.splitext(sanitized)
            if name.upper() in reserved_names:
                name = f"_{name}"
                sanitized = name + ext
        else:
            # Unix 계열 시스템 (macOS, Linux)
            sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # 연속된 언더스코어를 하나로 줄임
        sanitized = re.sub(r'_+', '_', sanitized)
        
        # 앞뒤 공백, 점, 언더스코어 제거
        sanitized = sanitized.strip(' ._')
        
        # Windows: 파일명 끝에 점이나 공백 금지
        if platform.system() == "Windows":
            sanitized = sanitized.rstrip('. ')
        
        # 파일명이 너무 긴 경우 자르기 (확장자 제외하고 100자로 제한)
        name, ext = os.path.splitext(sanitized)
        if len(name) > 100:
            name = name[:100]
            sanitized = name + ext
            
        return sanitized if sanitized else "unnamed_file"
        
    def stop(self):
        """다운로드 중지"""
        self._stop_requested = True
        
    def get_download_stats(self, results):
        """다운로드 통계 계산"""
        if not results:
            return {
                'total': 0,
                'success': 0,
                'failed': 0,
                'total_size': 0,
                'avg_time': 0
            }
            
        total = len(results)
        success = len([r for r in results if r.get('success', False)])
        failed = total - success
        total_size = sum(r.get('size', 0) for r in results if r.get('success', False))
        
        download_times = [r.get('download_time', 0) for r in results if r.get('success', False)]
        avg_time = sum(download_times) / len(download_times) if download_times else 0
        
        return {
            'total': total,
            'success': success,
            'failed': failed,
            'total_size': total_size,
            'avg_time': round(avg_time, 2)
        } 