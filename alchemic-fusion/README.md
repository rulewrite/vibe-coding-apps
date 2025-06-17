# 🧪 알케믹 퓨전 (Alchemic Fusion)

> **신비로운 연금술사의 실험실에서 펼쳐지는 원소들의 장대한 모험!**

플레이어가 선택한 원소들이 서로 상호작용하며 예측 불가능한 드라마를 만드는 관전형 전략 파티 게임입니다.

![알케믹 퓨전 로고](https://github.com/user-attachments/assets/game-logo.png)

## 🎮 게임 소개

### 핵심 컨셉

- **전략적 깊이**: 6개의 원소와 복잡하게 얽힌 상성 관계 속에서 최적의 수를 예측하는 즐거움
- **시각적 만족감**: 원소들의 상호작용이 만들어내는 화려하고 아름다운 연쇄 반응을 보는 재미
- **파티 게임의 유쾌함**: 친구들과 함께 각자의 선택이 어떤 나비효과를 불러일으킬지 기대하며 관전하는 즐거움

### 6대 원소 시스템

- **🔥 불 (火)**: 공격적이며 파괴적. 연쇄 반응의 기점
- **💧 물 (水)**: 방어적이며 유동적. 다른 원소의 힘을 중화
- **🌱 나무 (木)**: 성장하며 끈질김. 대기만성형
- **⚔️ 쇠 (金)**: 날카롭고 단단함. 확실한 카운터 역할
- **🏔️ 흙 (土)**: 묵직하고 견고함. 필드 제어 특화
- **💨 바람 (風)**: 자유롭고 예측 불가능함. 촉매 역할

## 🏆 승리 조건

게임은 3가지 부문의 승자를 동시에 발표합니다:

1. **🏆 최후의 생존자**: 마지막까지 플라스크에 남아있는 원소
2. **🧪 최고의 연금술사**: 연금 점수가 가장 높은 플레이어
3. **💎 현자의 돌**: 가장 적게 반응하며 순수함을 지킨 원소

## 🛠 기술 스택

### Frontend

- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Styled Components** - CSS-in-JS 스타일링
- **Framer Motion** - 부드러운 애니메이션
- **Matter.js** - 2D 물리 엔진
- **Zustand** - 경량 상태 관리

### 배포

- **Vercel** - 자동 배포 및 CDN

## 🚀 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/alchemic-fusion.git
cd alchemic-fusion
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 게임을 플레이하세요!

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지 (대기실)
│   ├── game/page.tsx      # 게임 진행 화면
│   ├── result/page.tsx    # 결과 발표 화면
│   └── layout.tsx         # 전역 레이아웃
├── components/
│   └── ui/                # UI 컴포넌트들
│       ├── ElementButton.tsx
│       ├── PlayerForm.tsx
│       └── PlayerList.tsx
├── lib/                   # 핵심 로직
│   ├── element-system.ts  # 원소 상성 시스템
│   └── physics-engine.ts  # Matter.js 물리 엔진
├── store/
│   └── game-store.ts      # Zustand 게임 상태
└── types/
    └── game.ts            # TypeScript 타입 정의
```

## 🎯 게임 플레이 가이드

### 1. 대기실 단계

- 플레이어 이름 입력
- 6개 원소 중 하나 선택 (또는 랜덤 선택)
- 최소 2명 이상이 참가해야 게임 시작 가능

### 2. 게임 진행 단계

- 원소들이 순차적으로 플라스크에 투입
- 물리 법칙에 따라 자유로운 상호작용
- 20초마다 중립 원소 자동 보충
- 3분간 진행 (또는 1명만 남을 때까지)

### 3. 결과 발표 단계

- 드라마틱한 승자 발표 연출
- 상세한 통계 및 순위 확인
- 다시 플레이하기 또는 결과 공유

## 🔥 원소 상성 관계

### 상생 관계 (相生)

- 물 → 나무: 성장
- 나무 → 불: 화력 증폭
- 불 → 흙: 경화
- 흙 → 쇠: 제련
- 쇠 → 물: 수원 생성
- 바람 → 나무: 파종

### 상극 관계 (相剋)

- 물 → 불: 소화 (소멸)
- 불 → 쇠: 용해 (소멸)
- 쇠 → 나무: 벌목 (소멸)
- 쇠 → 바람: 절삭 (약화)
- 나무 → 흙: 균열 (약화)
- 흙 ↔ 바람: 풍화/방벽 (상호 약화)

### 특수 조합

- **불 + 물 → 바람**: 증기화 반응으로 폭발 후 바람 원소 생성

## 🎨 디자인 철학

1. **테마의 몰입감**: 연금술사의 실험실 분위기
2. **정보의 명확성**: 복잡한 상성 관계의 직관적 표현
3. **드라마틱한 연출**: 관전의 재미를 극대화하는 시각 효과
4. **직관적인 흐름**: 자연스러운 사용자 경험

## 📊 성능 최적화

- **정적 사이트 생성**: 빠른 로딩 속도
- **효율적인 물리 엔진**: 60fps 부드러운 시뮬레이션
- **최적화된 번들**: ~200KB 경량 패키지
- **반응형 디자인**: 모든 디바이스 지원

## 🌟 향후 업데이트 계획

- [ ] 동적 환경 이벤트 (혼돈의 소용돌이)
- [ ] 팀전 모드
- [ ] 신규 원소 및 조합법 추가
- [ ] 게임 통계 및 랭킹 시스템
- [ ] PWA 지원
- [ ] 멀티플레이어 온라인 모드

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 감사의 말

- **Matter.js** - 훌륭한 2D 물리 엔진
- **Framer Motion** - 아름다운 애니메이션 라이브러리
- **Vercel** - 간편한 배포 플랫폼

---

**🎮 지금 바로 플레이해보세요!** [알케믹 퓨전 플레이하기](https://alchemic-fusion.vercel.app)

Made with ❤️ by 천재 기획자
