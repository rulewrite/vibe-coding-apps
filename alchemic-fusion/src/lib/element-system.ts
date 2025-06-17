import { ElementType, Reaction } from '@/types/game';

export const ELEMENT_COLORS = {
  fire: '#ff6b6b',
  water: '#74c0fc',
  wood: '#51cf66',
  metal: '#c0c0c0',
  earth: '#8b4513',
  wind: '#e0e0e0',
} as const;

export const ELEMENT_NAMES = {
  fire: '불',
  water: '물',
  wood: '나무',
  metal: '쇠',
  earth: '흙',
  wind: '바람',
} as const;

export const ELEMENT_DESCRIPTIONS = {
  fire: '공격적이며 파괴적. 연쇄 반응의 기점이 될 수 있는 잠재력을 가짐',
  water:
    '방어적이며 유동적. 다른 원소의 힘을 중화시키거나 새로운 반응을 유도함',
  wood: '성장하며 끈질김. 다른 원소의 도움을 받아 강해지는 대기만성형',
  metal: '날카롭고 단단함. 특정 원소에 대한 확실한 카운터 역할을 수행함',
  earth:
    '묵직하고 견고함. 필드를 제어하고 다른 원소의 움직임을 방해하는 데 특화됨',
  wind: '자유롭고 예측 불가능함. 다른 원소와 만나 그 힘을 증폭시키는 촉매 역할',
} as const;

// 상생 관계 (相生)
const SYNERGY_REACTIONS: Record<string, Reaction> = {
  'water->wood': {
    type: 'growth',
    from: 'water',
    to: 'wood',
    effect: 'strengthen',
    points: 1,
  },
  'wood->fire': {
    type: 'amplify',
    from: 'wood',
    to: 'fire',
    effect: 'strengthen',
    points: 1,
  },
  'fire->earth': {
    type: 'harden',
    from: 'fire',
    to: 'earth',
    effect: 'strengthen',
    points: 1,
  },
  'earth->metal': {
    type: 'refine',
    from: 'earth',
    to: 'metal',
    effect: 'strengthen',
    points: 1,
  },
  'metal->water': {
    type: 'source',
    from: 'metal',
    to: 'water',
    effect: 'strengthen',
    points: 1,
  },
  'wind->wood': {
    type: 'spread',
    from: 'wind',
    to: 'wood',
    effect: 'strengthen',
    points: 1,
  },
};

// 상극 관계 (相剋)
const CONFLICT_REACTIONS: Record<string, Reaction> = {
  'water->fire': {
    type: 'extinguish',
    from: 'water',
    to: 'fire',
    effect: 'destroy',
    points: 5,
  },
  'fire->metal': {
    type: 'melt',
    from: 'fire',
    to: 'metal',
    effect: 'destroy',
    points: 5,
  },
  'metal->wood': {
    type: 'cut',
    from: 'metal',
    to: 'wood',
    effect: 'destroy',
    points: 5,
  },
  'metal->wind': {
    type: 'slice',
    from: 'metal',
    to: 'wind',
    effect: 'weaken',
    points: 3,
  },
  'wood->earth': {
    type: 'crack',
    from: 'wood',
    to: 'earth',
    effect: 'weaken',
    points: 3,
  },
  'earth->wind': {
    type: 'erosion',
    from: 'earth',
    to: 'wind',
    effect: 'mutual_weaken',
    points: 2,
  },
  'wind->earth': {
    type: 'barrier',
    from: 'wind',
    to: 'earth',
    effect: 'mutual_weaken',
    points: 2,
  },
};

// 조합 반응
const COMBINATION_REACTIONS: Record<string, Reaction> = {
  'fire+water': {
    type: 'vaporize',
    from: 'fire',
    to: 'water',
    effect: 'combine',
    points: 10,
  },
};

export function getElementReaction(
  element1: ElementType,
  element2: ElementType
): Reaction | null {
  // 상생 관계 확인
  const synergyKey1 = `${element1}->${element2}`;
  const synergyKey2 = `${element2}->${element1}`;

  if (SYNERGY_REACTIONS[synergyKey1]) {
    return SYNERGY_REACTIONS[synergyKey1];
  }
  if (SYNERGY_REACTIONS[synergyKey2]) {
    return SYNERGY_REACTIONS[synergyKey2];
  }

  // 상극 관계 확인
  const conflictKey1 = `${element1}->${element2}`;
  const conflictKey2 = `${element2}->${element1}`;

  if (CONFLICT_REACTIONS[conflictKey1]) {
    return CONFLICT_REACTIONS[conflictKey1];
  }
  if (CONFLICT_REACTIONS[conflictKey2]) {
    return CONFLICT_REACTIONS[conflictKey2];
  }

  // 조합 반응 확인 (불+물 = 바람)
  const combKey1 = `${element1}+${element2}`;
  const combKey2 = `${element2}+${element1}`;

  if (COMBINATION_REACTIONS[combKey1]) {
    return COMBINATION_REACTIONS[combKey1];
  }
  if (COMBINATION_REACTIONS[combKey2]) {
    return COMBINATION_REACTIONS[combKey2];
  }

  return null;
}

export function getRandomElement(): ElementType {
  const elements: ElementType[] = [
    'fire',
    'water',
    'wood',
    'metal',
    'earth',
    'wind',
  ];
  return elements[Math.floor(Math.random() * elements.length)];
}

export function getElementPhysics(element: ElementType) {
  const basePhysics = {
    density: 1,
    friction: 0.3,
    restitution: 0.6,
    frictionAir: 0.01,
  };

  switch (element) {
    case 'earth':
      return { ...basePhysics, density: 2, friction: 0.8, restitution: 0.2 };
    case 'metal':
      return { ...basePhysics, density: 1.8, friction: 0.4, restitution: 0.8 };
    case 'water':
      return { ...basePhysics, density: 1, friction: 0.1, restitution: 0.3 };
    case 'fire':
      return { ...basePhysics, density: 0.3, friction: 0.1, restitution: 0.9 };
    case 'wind':
      return { ...basePhysics, density: 0.1, friction: 0.05, restitution: 1.0 };
    case 'wood':
      return { ...basePhysics, density: 0.8, friction: 0.6, restitution: 0.4 };
    default:
      return basePhysics;
  }
}
