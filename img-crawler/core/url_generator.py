"""
URL 생성기 - 반복 패턴 기반으로 URL 목록 생성
"""

from urllib.parse import urlparse


class URLGenerator:
    def __init__(self, config):
        self.config = config
        self.base_url = config.get('url', '')
        self.repeat_enabled = config.get('repeat_enabled', False)
        self.start_value = config.get('start_value', 1)
        self.end_value = config.get('end_value', 10)
        self.step_value = config.get('step_value', 1)
        
    def generate_urls(self):
        """URL 목록 생성"""
        if not self.base_url:
            return []
            
        if not self.repeat_enabled or '{}' not in self.base_url:
            # 반복 없이 단일 URL
            return [self.base_url]
            
        # 반복 패턴으로 URL 생성
        urls = []
        current = self.start_value
        
        while current <= self.end_value:
            url = self.base_url.format(current)
            urls.append(url)
            current += self.step_value
            
        return urls
        
    def get_url_count(self):
        """생성될 URL 개수 반환"""
        if not self.repeat_enabled or '{}' not in self.base_url:
            return 1
            
        return len(range(self.start_value, self.end_value + 1, self.step_value))
        
    def validate_pattern(self):
        """URL 패턴 유효성 검사"""
        if not self.base_url:
            return False, "URL이 입력되지 않았습니다."
            
        if self.repeat_enabled:
            if '{}' not in self.base_url:
                return False, "반복 크롤링을 위해서는 URL에 {} 패턴이 필요합니다."
                
            if self.start_value > self.end_value:
                return False, "시작값이 끝값보다 클 수 없습니다."
                
            if self.step_value <= 0:
                return False, "증가값은 0보다 커야 합니다."
                
            url_count = self.get_url_count()
            if url_count > 1000:  # 안전을 위한 제한
                return False, f"생성될 URL이 너무 많습니다 ({url_count}개). 1000개 이하로 설정해주세요."
                
        # 테스트 URL 생성해서 유효성 확인
        test_urls = self.generate_urls()[:3]  # 처음 3개만 테스트
        for url in test_urls:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return False, f"유효하지 않은 URL이 생성됩니다: {url}"
                
        return True, "URL 패턴이 유효합니다." 