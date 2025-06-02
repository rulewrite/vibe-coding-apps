# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

# 할 일 목록 앱

간단하고 직관적인 할 일 관리 애플리케이션입니다.

## 주요 기능

- 할 일 추가, 수정, 삭제
- 마감일 설정 및 관리
- 드래그 앤 드롭으로 할 일 순서 변경
- 로컬 스토리지를 통한 데이터 저장
- 다크 모드 지원

## 🥚 숨겨진 이스터에그

앱에 숨겨진 재미있는 기능들을 발견해보세요!

### 1. Konami 코드

- 키보드로 `↑↑↓↓←→←→BA`를 순서대로 입력하면 특별한 알림이 표시됩니다.
- 힌트: 할 일 내용에 "konami" 또는 "코나미"를 입력해보세요!

### 2. 테마 변경

- 할 일 제목을 5번 연속으로 클릭하면 다크 모드가 토글됩니다.
- 힌트: 제목에 마우스를 올리면 도구 설명이 표시됩니다.

### 3. 비밀 메시지

- 할 일 내용에 "secret" 또는 "비밀"을 입력하면 특별한 애니메이션 메시지가 표시됩니다.
- 메시지는 2초 동안 표시된 후 사라집니다.

## 사용 방법

1. 할 일 추가

   - 상단의 입력 필드에 할 일을 입력하고 추가 버튼을 클릭
   - 마감일이 있는 경우 날짜와 시간을 선택

2. 할 일 관리

   - 체크박스로 완료 표시
   - 연필 아이콘으로 수정
   - 휴지통 아이콘으로 삭제
   - 드래그 핸들을 사용하여 순서 변경

3. 이스터에그 발견하기
   - 위의 이스터에그 목록을 참고하여 숨겨진 기능들을 찾아보세요!
   - 새로운 이스터에그를 발견하면 알려주세요 😉

## 기술 스택

- React
- TypeScript
- Chakra UI
- react-beautiful-dnd
- Local Storage

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
