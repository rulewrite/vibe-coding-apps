/**
 * 알케믹 퓨전 - 원소 시스템
 * 6대 원소와 그들의 상성 관계를 정의합니다.
 */

class ElementSystem {
  constructor() {
    this.elements = this.defineElements();
    this.reactions = this.defineReactions();
  }

  // 6대 원소 정의
  defineElements() {
    return {
      fire: {
        name: '불',
        emoji: '🔥',
        color: '#ff6b35',
        description:
          '공격적이며 파괴적. 연쇄 반응의 기점이 될 수 있는 잠재력을 가짐',
        properties: {
          mass: 0.8,
          friction: 0.3,
          restitution: 0.6,
          speed: 1.2,
          aggressiveness: 0.9,
        },
      },
      water: {
        name: '물',
        emoji: '💧',
        color: '#4fc3f7',
        description:
          '방어적이며 유동적. 다른 원소의 힘을 중화시키거나 새로운 반응을 유도함',
        properties: {
          mass: 1.0,
          friction: 0.1,
          restitution: 0.4,
          speed: 1.0,
          aggressiveness: 0.3,
        },
      },
      wood: {
        name: '나무',
        emoji: '🌳',
        color: '#66bb6a',
        description:
          '성장하며 끈질김. 다른 원소의 도움을 받아 강해지는 대기만성형',
        properties: {
          mass: 0.9,
          friction: 0.6,
          restitution: 0.3,
          speed: 0.8,
          aggressiveness: 0.4,
        },
      },
      metal: {
        name: '쇠',
        emoji: '⚔️',
        color: '#bdbdbd',
        description:
          '날카롭고 단단함. 특정 원소에 대한 확실한 카운터 역할을 수행함',
        properties: {
          mass: 1.3,
          friction: 0.4,
          restitution: 0.8,
          speed: 0.9,
          aggressiveness: 0.7,
        },
      },
      earth: {
        name: '흙',
        emoji: '🪨',
        color: '#8d6e63',
        description:
          '묵직하고 견고함. 필드를 제어하고 다른 원소의 움직임을 방해하는 데 특화됨',
        properties: {
          mass: 1.5,
          friction: 0.8,
          restitution: 0.2,
          speed: 0.6,
          aggressiveness: 0.2,
        },
      },
      wind: {
        name: '바람',
        emoji: '💨',
        color: '#e0e0e0',
        description:
          '자유롭고 예측 불가능함. 다른 원소와 만나 그 힘을 증폭시키는 촉매 역할',
        properties: {
          mass: 0.5,
          friction: 0.05,
          restitution: 0.9,
          speed: 1.5,
          aggressiveness: 0.6,
        },
      },
    };
  }

  // 상성 관계 정의
  defineReactions() {
    return {
      // 상생(相生) 관계
      symbiosis: {
        // 물 → 나무: 성장
        'water-wood': {
          type: 'growth',
          name: '성장',
          description: '물이 나무에게 영양을 공급하여 성장시킵니다',
          effect: 'strengthen',
          scoreChange: 1,
          visualEffect: 'growth',
          soundEffect: 'grow',
        },
        // 나무 → 불: 화력 증폭
        'wood-fire': {
          type: 'amplify',
          name: '화력 증폭',
          description: '나무가 불의 화력을 증폭시킵니다',
          effect: 'strengthen',
          scoreChange: 1,
          visualEffect: 'amplify',
          soundEffect: 'ignite',
        },
        // 불 → 흙: 경화
        'fire-earth': {
          type: 'harden',
          name: '경화',
          description: '불이 흙을 굳혀 더욱 견고하게 만듭니다',
          effect: 'strengthen',
          scoreChange: 1,
          visualEffect: 'harden',
          soundEffect: 'solidify',
        },
        // 흙 → 쇠: 제련
        'earth-metal': {
          type: 'refine',
          name: '제련',
          description: '흙이 쇠를 제련하여 더욱 강하게 만듭니다',
          effect: 'strengthen',
          scoreChange: 1,
          visualEffect: 'refine',
          soundEffect: 'forge',
        },
        // 쇠 → 물: 수원 생성
        'metal-water': {
          type: 'spring',
          name: '수원 생성',
          description: '쇠가 물의 근원을 생성합니다',
          effect: 'strengthen',
          scoreChange: 1,
          visualEffect: 'spring',
          soundEffect: 'flow',
        },
        // 바람 → 나무: 파종
        'wind-wood': {
          type: 'seed',
          name: '파종',
          description: '바람이 나무의 씨앗을 퍼뜨려 성장을 돕습니다',
          effect: 'strengthen',
          scoreChange: 1,
          visualEffect: 'seed',
          soundEffect: 'scatter',
        },
      },

      // 조합(조합) 관계
      combination: {
        // 불 + 물 → 바람: 증기화
        'fire-water': {
          type: 'steam',
          name: '증기화',
          description: '불과 물이 만나 증기가 되어 바람을 생성합니다',
          effect: 'create_wind',
          scoreChange: 10,
          visualEffect: 'steam_explosion',
          soundEffect: 'steam',
          result: 'wind',
        },
      },

      // 상극(相剋) 관계
      conflict: {
        // 물 → 불: 소화 (소멸)
        'water-fire': {
          type: 'extinguish',
          name: '소화',
          description: '물이 불을 완전히 소화시킵니다',
          effect: 'eliminate',
          scoreChange: 5,
          visualEffect: 'extinguish',
          soundEffect: 'sizzle',
          target: 'fire',
        },
        // 불 → 쇠: 용해 (소멸)
        'fire-metal': {
          type: 'melt',
          name: '용해',
          description: '불이 쇠를 녹여 소멸시킵니다',
          effect: 'eliminate',
          scoreChange: 5,
          visualEffect: 'melt',
          soundEffect: 'melt',
          target: 'metal',
        },
        // 쇠 → 나무: 벌목 (소멸)
        'metal-wood': {
          type: 'cut',
          name: '벌목',
          description: '쇠가 나무를 베어 소멸시킵니다',
          effect: 'eliminate',
          scoreChange: 5,
          visualEffect: 'cut',
          soundEffect: 'chop',
          target: 'wood',
        },
        // 쇠 → 바람: 절삭 (약화)
        'metal-wind': {
          type: 'slice',
          name: '절삭',
          description: '쇠가 바람을 갈라 약화시킵니다',
          effect: 'weaken',
          scoreChange: 3,
          visualEffect: 'slice',
          soundEffect: 'slash',
          target: 'wind',
        },
        // 나무 → 흙: 균열 (약화)
        'wood-earth': {
          type: 'crack',
          name: '균열',
          description: '나무가 흙에 균열을 내어 약화시킵니다',
          effect: 'weaken',
          scoreChange: 3,
          visualEffect: 'crack',
          soundEffect: 'crack',
          target: 'earth',
        },
        // 흙 ↔ 바람: 풍화/방벽 (상호 약화)
        'earth-wind': {
          type: 'weather',
          name: '풍화/방벽',
          description: '흙과 바람이 서로를 약화시킵니다',
          effect: 'mutual_weaken',
          scoreChange: 2,
          visualEffect: 'weather',
          soundEffect: 'weather',
          target: 'both',
        },
      },
    };
  }

  // 두 원소 간의 반응 확인
  checkReaction(element1, element2) {
    const reactions = [];

    // 상생 관계 확인
    const symbiosisKey = `${element1}-${element2}`;
    const reverseSymbiosisKey = `${element2}-${element1}`;

    if (this.reactions.symbiosis[symbiosisKey]) {
      reactions.push({
        ...this.reactions.symbiosis[symbiosisKey],
        source: element1,
        target: element2,
        category: 'symbiosis',
      });
    }

    if (this.reactions.symbiosis[reverseSymbiosisKey]) {
      reactions.push({
        ...this.reactions.symbiosis[reverseSymbiosisKey],
        source: element2,
        target: element1,
        category: 'symbiosis',
      });
    }

    // 조합 관계 확인
    const combinationKey = `${element1}-${element2}`;
    const reverseCombinationKey = `${element2}-${element1}`;

    if (this.reactions.combination[combinationKey]) {
      reactions.push({
        ...this.reactions.combination[combinationKey],
        source: element1,
        target: element2,
        category: 'combination',
      });
    }

    if (this.reactions.combination[reverseCombinationKey]) {
      reactions.push({
        ...this.reactions.combination[reverseCombinationKey],
        source: element2,
        target: element1,
        category: 'combination',
      });
    }

    // 상극 관계 확인
    const conflictKey = `${element1}-${element2}`;
    const reverseConflictKey = `${element2}-${element1}`;

    if (this.reactions.conflict[conflictKey]) {
      reactions.push({
        ...this.reactions.conflict[conflictKey],
        source: element1,
        target: element2,
        category: 'conflict',
      });
    }

    if (this.reactions.conflict[reverseConflictKey]) {
      reactions.push({
        ...this.reactions.conflict[reverseConflictKey],
        source: element2,
        target: element1,
        category: 'conflict',
      });
    }

    return reactions;
  }

  // 원소 강화 효과 적용
  applyStrengthEffect(element, strengthLevel = 1) {
    const properties = this.elements[element].properties;
    return {
      mass: properties.mass * (1 + strengthLevel * 0.2),
      friction: properties.friction * (1 + strengthLevel * 0.1),
      restitution: properties.restitution * (1 + strengthLevel * 0.1),
      speed: properties.speed * (1 + strengthLevel * 0.3),
      aggressiveness: Math.min(
        1.0,
        properties.aggressiveness * (1 + strengthLevel * 0.2)
      ),
    };
  }

  // 원소 약화 효과 적용
  applyWeakenEffect(element, weakenLevel = 1) {
    const properties = this.elements[element].properties;
    return {
      mass: properties.mass * Math.max(0.5, 1 - weakenLevel * 0.2),
      friction: properties.friction * Math.max(0.1, 1 - weakenLevel * 0.1),
      restitution:
        properties.restitution * Math.max(0.1, 1 - weakenLevel * 0.1),
      speed: properties.speed * Math.max(0.3, 1 - weakenLevel * 0.3),
      aggressiveness: Math.max(
        0.1,
        properties.aggressiveness * (1 - weakenLevel * 0.2)
      ),
    };
  }

  // 중립 원소 생성 (소수 원소 보충 시스템)
  generateNeutralElements(excludeElements = []) {
    const availableElements = Object.keys(this.elements).filter(
      (element) => !excludeElements.includes(element)
    );

    if (availableElements.length === 0) return [];

    // 무작위로 1-2개의 중립 원소 선택
    const count = Math.random() < 0.7 ? 1 : 2;
    const selectedElements = [];

    for (let i = 0; i < count && availableElements.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableElements.length);
      const selectedElement = availableElements.splice(randomIndex, 1)[0];
      selectedElements.push({
        element: selectedElement,
        isNeutral: true,
        properties: this.elements[selectedElement].properties,
      });
    }

    return selectedElements;
  }

  // 반응 확률 계산
  calculateReactionProbability(element1, element2, distance, relativeVelocity) {
    const reactions = this.checkReaction(element1, element2);
    if (reactions.length === 0) return 0;

    // 거리 기반 확률 (가까울수록 높음)
    const distanceFactor = Math.max(0, 1 - distance / 100);

    // 속도 기반 확률 (빠를수록 높음)
    const velocityFactor = Math.min(1, relativeVelocity / 50);

    // 원소별 반응성
    const aggressiveness1 = this.elements[element1].properties.aggressiveness;
    const aggressiveness2 = this.elements[element2].properties.aggressiveness;
    const aggressivenessFactor = (aggressiveness1 + aggressiveness2) / 2;

    // 최종 확률 계산
    const baseProbability = 0.3; // 기본 30% 확률
    const finalProbability =
      baseProbability * distanceFactor * velocityFactor * aggressivenessFactor;

    return Math.min(0.8, finalProbability); // 최대 80% 확률
  }

  // 원소 정보 가져오기
  getElementInfo(elementType) {
    return this.elements[elementType] || null;
  }

  // 모든 원소 목록 가져오기
  getAllElements() {
    return Object.keys(this.elements);
  }

  // 반응 효과 설명 생성
  getReactionDescription(reaction) {
    const sourceElement = this.elements[reaction.source];
    const targetElement = this.elements[reaction.target];

    return `${sourceElement.emoji} ${sourceElement.name}이(가) ${targetElement.emoji} ${targetElement.name}에게 ${reaction.name} 반응을 일으켰습니다!`;
  }
}

// 전역 원소 시스템 인스턴스 생성
window.ElementSystem = new ElementSystem();
