# 🖼️ 이미지 크롤러

## 📖 소개

전문적인 이미지 크롤링 GUI 애플리케이션입니다. 웹페이지에서 이미지를 자동으로 수집하고 다운로드할 수 있는 강력한 도구입니다.

## ✨ 주요 기능

### 🌐 URL 입력 및 유효성 검사

- URL 입력 필드 제공
- 실시간 URL 유효성 검사
- 친절한 오류 메시지 표시

### 🚀 크롤링 시작 및 진행 상황 표시

- 직관적인 크롤링 시작/중지 버튼
- 실시간 진행률 표시 (진행률 바, 처리된 이미지 수, 경과 시간)
- 상세한 로그 기록

### 🔄 URL 및 이미지 선택자 반복 크롤링

- **URL 패턴 반복**: `https://example.com/page={}` 형태로 여러 페이지 자동 크롤링
- **다중 CSS 선택자**: 여러 선택자를 동시에 사용하여 이미지 추출
- **동시 연결 수 제어**: 서버 부하를 고려한 병렬 처리

### 🖼️ 이미지 추출 및 다운로드

- CSS 선택자 기반 이미지 추출
- 비동기 병렬 다운로드로 높은 성능
- 중복 이미지 자동 제거
- 다양한 파일명 패턴 지원

### 💾 저장 경로 설정

- 사용자 정의 저장 경로
- 도메인별 하위 폴더 자동 생성
- 기존 파일 덮어쓰기 옵션

### 📊 크롤링 결과 요약 및 미리보기

- 이미지 썸네일 미리보기
- 상세한 다운로드 결과 테이블
- 파일 타입별, 도메인별 통계
- 결과 CSV 내보내기

### ⚠️ 에러 핸들링 및 사용자 알림

- 각 단계별 명확한 오류 메시지
- 네트워크 오류 자동 재시도
- 사용자 친화적인 가이드라인 제시

## 🛠 설치 및 실행

### 🪟 Windows 사용자

1. **Python 설치**: [Python 공식 사이트](https://python.org)에서 Python 3.8+ 설치
2. **간편 실행**: `run_windows.bat` 파일 더블클릭
   - 자동으로 의존성 설치 및 앱 실행

### 🍎 macOS / 🐧 Linux 사용자

```bash
# 의존성 설치
pip install -r requirements.txt

# 앱 실행
python main.py
```

### 📋 시스템 요구사항

- **Python**: 3.8 이상
- **운영체제**: ✅ Windows 10/11, ✅ macOS 10.14+, ✅ Linux (Ubuntu 18.04+)
- **RAM**: 최소 512MB (권장 1GB 이상)
- **저장공간**: 50MB + 다운로드할 이미지 용량

## 🔧 플랫폼별 참고사항

### 🪟 Windows

- **폰트**: Consolas (기본 설치됨)
- **폴더 열기**: Windows 탐색기 자동 연결
- **파일명**: Windows 예약어 자동 처리 (CON, PRN 등)

### 🍎 macOS

- **폰트**: Monaco (기본 설치됨)
- **폴더 열기**: Finder 자동 연결
- **High DPI**: Retina 디스플레이 최적화

### 🐧 Linux

- **폰트**: Courier New 대체
- **폴더 열기**: xdg-open 사용
- **의존성**: PyQt5 시스템 패키지 설치 권장

## 🎯 사용법

### 1. 기본 크롤링

1. **URL 입력**: 크롤링할 웹페이지 URL을 입력합니다
2. **선택자 설정**: CSS 선택자를 입력합니다 (기본값: `img`)
3. **저장 경로 설정**: 이미지를 저장할 폴더를 선택합니다
4. **크롤링 시작**: 🚀 버튼을 클릭하여 크롤링을 시작합니다

### 2. 반복 크롤링

1. **URL 패턴**: `https://example.com/page={}` 형식으로 입력
2. **반복 설정 활성화**: "URL 패턴 반복 활성화" 체크
3. **범위 설정**: 시작값, 끝값, 증가값 설정
4. **크롤링 시작**

### 3. 고급 선택자 사용

```css
/* 기본 이미지 태그 */
img

/* 클래스 기반 선택 */
.gallery img
.thumbnail img

/* 속성 기반 선택 */
img[src*="photo"]
[class*="image"] img

/* 복합 선택자 */
.content .main-image img
article img:not(.icon)
```

## ⚙️ 설정

메뉴바 > 파일 > 설정에서 다양한 옵션을 조정할 수 있습니다:

### 🌐 네트워크 설정

- 요청 타임아웃
- 재시도 횟수
- 최대 동시 연결 수
- User-Agent 설정

### 📥 다운로드 설정

- 최대 파일 크기
- 파일명 패턴
- 이미지 크기 필터
- 지원 파일 형식 제한

### 🎨 인터페이스 설정

- 테마 (라이트/다크)
- 썸네일 크기
- 로그 옵션

## 📊 결과 확인

### 미리보기 탭

- 다운로드된 이미지의 썸네일 그리드 표시
- 클릭하여 상세 정보 확인

### 결과 목록 탭

- 모든 다운로드 결과를 테이블로 표시
- 성공/실패 상태, 파일 크기, 다운로드 시간 등

### 통계 탭

- 전체 요약 통계
- 파일 타입별 분포
- 도메인별 분포

## 🔧 문제 해결

### 일반적인 문제들

**Q: 이미지가 다운로드되지 않아요**
A:

- URL이 올바른지 확인
- CSS 선택자가 정확한지 확인
- 네트워크 연결 상태 확인

**Q: 크롤링이 너무 느려요**
A:

- 동시 연결 수를 줄여보세요 (설정에서 조정)
- 서버가 속도 제한을 걸고 있을 수 있습니다

**Q: 특정 사이트에서 403 오류가 발생해요**
A:

- User-Agent를 브라우저 것으로 변경해보세요
- 해당 사이트의 robots.txt를 확인해보세요

### 로그 확인

진행 상황 패널의 로그를 확인하여 상세한 오류 정보를 얻을 수 있습니다.

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트, 기능 제안, 코드 기여를 환영합니다!

## ⚖️ 법적 고지

이 도구는 교육 및 개인적 용도로 제작되었습니다. 웹사이트를 크롤링할 때는 다음을 확인해주세요:

- 해당 웹사이트의 이용약관 및 robots.txt 준수
- 저작권이 있는 이미지의 경우 적절한 권한 확보
- 서버에 과도한 부하를 주지 않도록 적절한 딜레이 설정

---

**Happy Crawling! 🕷️✨**
