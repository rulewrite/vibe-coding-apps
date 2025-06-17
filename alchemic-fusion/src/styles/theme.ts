export const alchemyTheme = {
  colors: {
    // 배경 색상
    background: {
      primary: '#0f0f23',
      secondary: '#16213e',
      tertiary: '#1a1a2e',
      glass: 'rgba(255, 255, 255, 0.1)',
    },

    // 원소 색상
    elements: {
      fire: '#ef4444',
      water: '#3b82f6',
      wood: '#10b981',
      metal: '#6b7280',
      earth: '#a3a3a3',
      wind: '#e5e7eb',
    },

    // UI 색상
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',

    // 텍스트 색상
    text: {
      primary: '#e0e6ed',
      secondary: '#9ca3af',
      accent: '#fbbf24',
    },

    // 상호작용 색상
    reactions: {
      synergy: '#10b981', // 상생
      conflict: '#ef4444', // 상극
      combination: '#8b5cf6', // 조합
      neutral: '#6b7280', // 중립
    },
  },

  // 그라디언트
  gradients: {
    background:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    glass:
      'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    fire: 'radial-gradient(circle, #ef4444 0%, #dc2626 100%)',
    water: 'radial-gradient(circle, #3b82f6 0%, #2563eb 100%)',
    wood: 'radial-gradient(circle, #10b981 0%, #059669 100%)',
    metal: 'radial-gradient(circle, #6b7280 0%, #4b5563 100%)',
    earth: 'radial-gradient(circle, #a3a3a3 0%, #737373 100%)',
    wind: 'radial-gradient(circle, #e5e7eb 0%, #d1d5db 100%)',
  },

  // 그림자
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.2)',
    large: '0 8px 16px rgba(0, 0, 0, 0.3)',
    glow: {
      fire: '0 0 20px rgba(239, 68, 68, 0.5)',
      water: '0 0 20px rgba(59, 130, 246, 0.5)',
      wood: '0 0 20px rgba(16, 185, 129, 0.5)',
      metal: '0 0 20px rgba(107, 114, 128, 0.5)',
      earth: '0 0 20px rgba(163, 163, 163, 0.5)',
      wind: '0 0 20px rgba(229, 231, 235, 0.5)',
    },
  },

  // 애니메이션
  animations: {
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // 브레이크포인트
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },

  // 원소별 물리 속성
  physics: {
    fire: { density: 0.8, restitution: 0.9 },
    water: { density: 1.0, restitution: 0.3 },
    wood: { density: 0.6, restitution: 0.4 },
    metal: { density: 2.0, restitution: 0.8 },
    earth: { density: 1.5, restitution: 0.2 },
    wind: { density: 0.1, restitution: 1.2 },
  },
} as const;

export type AlchemyTheme = typeof alchemyTheme;
export type ElementType = keyof typeof alchemyTheme.colors.elements;
