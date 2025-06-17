import { ElementType, alchemyTheme } from '@/styles/theme';
import Matter from 'matter-js';
import { Participant } from './game-store';

// 원소 객체 타입
export interface Element {
  id: string;
  participantId: string;
  type: ElementType;
  body: Matter.Body;
  name: string;
  isAlive: boolean;
  reactionCount: number;
  alchemyScore: number;
}

// 반응 타입
export type ReactionType = 'synergy' | 'conflict' | 'combination' | 'system';

// 반응 결과
export interface ReactionResult {
  type: ReactionType;
  participants: string[];
  message: string;
  scoreChanges: { [participantId: string]: number };
  effects: 'growth' | 'weaken' | 'destroy' | 'combine' | 'boost';
  newElements?: Element[];
}

// 원소 상성 관계 (기획서 기반)
const ELEMENT_REACTIONS: Record<string, ElementReaction[]> = {
  // 물의 반응
  water: [
    {
      target: 'wood',
      type: 'synergy',
      effect: 'growth',
      score: 1,
      message: (s, t) => `💧 ${s}이 🌱 ${t}에게 성장의 힘을 전달했습니다!`,
    },
    {
      target: 'fire',
      type: 'conflict',
      effect: 'destroy',
      score: 5,
      message: (s, t) => `💧 ${s}이 🔥 ${t}을 소화시켰습니다!`,
    },
  ],

  // 나무의 반응
  wood: [
    {
      target: 'fire',
      type: 'synergy',
      effect: 'boost',
      score: 1,
      message: (s, t) => `🌱 ${s}이 🔥 ${t}의 화력을 증폭시켰습니다!`,
    },
    {
      target: 'earth',
      type: 'conflict',
      effect: 'weaken',
      score: 3,
      message: (s, t) => `🌱 ${s}이 🗿 ${t}에 균열을 만들었습니다!`,
    },
  ],

  // 불의 반응
  fire: [
    {
      target: 'earth',
      type: 'synergy',
      effect: 'boost',
      score: 1,
      message: (s, t) => `🔥 ${s}이 🗿 ${t}을 경화시켰습니다!`,
    },
    {
      target: 'metal',
      type: 'conflict',
      effect: 'destroy',
      score: 5,
      message: (s, t) => `🔥 ${s}이 ⚔️ ${t}을 용해시켰습니다!`,
    },
  ],

  // 흙의 반응
  earth: [
    {
      target: 'metal',
      type: 'synergy',
      effect: 'boost',
      score: 1,
      message: (s, t) => `🗿 ${s}이 ⚔️ ${t}을 제련했습니다!`,
    },
    {
      target: 'wind',
      type: 'conflict',
      effect: 'weaken',
      score: 2,
      message: (s, t) => `🗿 ${s}과 💨 ${t}이 풍화 작용을 일으켰습니다!`,
    },
  ],

  // 쇠의 반응
  metal: [
    {
      target: 'water',
      type: 'synergy',
      effect: 'growth',
      score: 1,
      message: (s, t) => `⚔️ ${s}이 💧 ${t}의 수원을 생성했습니다!`,
    },
    {
      target: 'wood',
      type: 'conflict',
      effect: 'destroy',
      score: 5,
      message: (s, t) => `⚔️ ${s}이 🌱 ${t}을 벌목했습니다!`,
    },
    {
      target: 'wind',
      type: 'conflict',
      effect: 'weaken',
      score: 3,
      message: (s, t) => `⚔️ ${s}이 💨 ${t}을 절삭했습니다!`,
    },
  ],

  // 바람의 반응
  wind: [
    {
      target: 'wood',
      type: 'synergy',
      effect: 'growth',
      score: 1,
      message: (s, t) => `💨 ${s}이 🌱 ${t}에게 파종의 힘을 주었습니다!`,
    },
    {
      target: 'earth',
      type: 'conflict',
      effect: 'weaken',
      score: 2,
      message: (s, t) => `💨 ${s}과 🗿 ${t}이 방벽 효과를 만들었습니다!`,
    },
  ],
};

// 조합 반응 타입
interface CombinationReaction {
  elements: ElementType[];
  result: ElementType;
  type: ReactionType;
  score: number;
  message: (s1: string, s2: string) => string;
}

// 원소 반응 타입
interface ElementReaction {
  target: ElementType;
  type: ReactionType;
  effect: 'growth' | 'weaken' | 'destroy' | 'combine' | 'boost';
  score: number;
  message: (source: string, target: string) => string;
}

// 특수 조합 반응
const COMBINATION_REACTIONS: CombinationReaction[] = [
  {
    elements: ['fire', 'water'],
    result: 'wind',
    type: 'combination',
    score: 10,
    message: (s1: string, s2: string) =>
      `🔥 ${s1}과 💧 ${s2}가 증기화하여 💨 바람이 생성되었습니다!`,
  },
];

export class PhysicsEngine {
  private engine: Matter.Engine;
  private render: Matter.Render | null = null;
  private canvas: HTMLCanvasElement;
  private elements: Map<string, Element> = new Map();
  private walls: Matter.Body[] = [];
  private onReaction?: (reaction: ReactionResult) => void;
  private neutralElementCounter = 0;

  constructor(
    canvas: HTMLCanvasElement,
    onReaction?: (reaction: ReactionResult) => void
  ) {
    this.canvas = canvas;
    this.onReaction = onReaction;

    // Matter.js 엔진 초기화
    this.engine = Matter.Engine.create();
    this.engine.world.gravity.y = 0.8;

    this.setupRenderer();
    this.createWalls();
    this.setupCollisionDetection();
  }

  private setupRenderer() {
    this.render = Matter.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: 800,
        height: 500,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
  }

  private createWalls() {
    const width = 800;
    const height = 500;
    const wallThickness = 20;

    // 플라스크 모양의 벽 생성
    const walls = [
      // 바닥 (둥근 모양)
      Matter.Bodies.rectangle(
        width / 2,
        height - 10,
        width - 100,
        wallThickness,
        {
          isStatic: true,
          render: { visible: false },
        }
      ),
      // 좌측벽
      Matter.Bodies.rectangle(50, height / 2, wallThickness, height - 100, {
        isStatic: true,
        render: { visible: false },
      }),
      // 우측벽
      Matter.Bodies.rectangle(
        width - 50,
        height / 2,
        wallThickness,
        height - 100,
        {
          isStatic: true,
          render: { visible: false },
        }
      ),
      // 상단 좌측
      Matter.Bodies.rectangle(200, 50, 300, wallThickness, {
        isStatic: true,
        render: { visible: false },
      }),
      // 상단 우측
      Matter.Bodies.rectangle(600, 50, 300, wallThickness, {
        isStatic: true,
        render: { visible: false },
      }),
    ];

    this.walls = walls;
    Matter.World.add(this.engine.world, walls);
  }

  private setupCollisionDetection() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // 벽과의 충돌은 무시
        if (this.walls.includes(bodyA) || this.walls.includes(bodyB)) return;

        const elementA = this.findElementByBody(bodyA);
        const elementB = this.findElementByBody(bodyB);

        if (elementA && elementB && elementA.isAlive && elementB.isAlive) {
          this.processReaction(elementA, elementB);
        }
      });
    });
  }

  private findElementByBody(body: Matter.Body): Element | undefined {
    for (const element of this.elements.values()) {
      if (element.body === body) return element;
    }
    return undefined;
  }

  addParticipants(participants: Participant[]) {
    participants.forEach((participant, index) => {
      this.addElement(participant, index);
    });
  }

  private addElement(participant: Participant, index: number) {
    const physicsProps = alchemyTheme.physics[participant.element];
    const colors = alchemyTheme.colors.elements;

    // 투입구에서 약간의 랜덤 위치로 떨어뜨림
    const x = 350 + index * 30 + (Math.random() - 0.5) * 100;
    const y = 100;

    const body = Matter.Bodies.circle(x, y, 15, {
      density: physicsProps.density,
      restitution: physicsProps.restitution,
      friction: 0.3,
      render: {
        fillStyle: colors[participant.element],
        strokeStyle: colors[participant.element],
        lineWidth: 2,
      },
    });

    const element: Element = {
      id: `element-${participant.id}`,
      participantId: participant.id,
      type: participant.element,
      body,
      name: participant.name,
      isAlive: true,
      reactionCount: 0,
      alchemyScore: 0,
    };

    this.elements.set(element.id, element);
    Matter.World.add(this.engine.world, body);
  }

  private processReaction(elementA: Element, elementB: Element) {
    // 조합 반응 확인 (우선순위 높음)
    const combination = this.checkCombination(elementA, elementB);
    if (combination) {
      this.applyCombination(elementA, elementB, combination);
      return;
    }

    // 일반 상성 반응 확인
    const reactionA = this.getReaction(elementA.type, elementB.type);
    const reactionB = this.getReaction(elementB.type, elementA.type);

    if (reactionA) {
      this.applyReaction(elementA, elementB, reactionA);
    } else if (reactionB) {
      this.applyReaction(elementB, elementA, reactionB);
    }
  }

  private checkCombination(elementA: Element, elementB: Element) {
    return COMBINATION_REACTIONS.find(
      (combo) =>
        combo.elements.includes(elementA.type) &&
        combo.elements.includes(elementB.type) &&
        elementA.type !== elementB.type
    );
  }

  private applyCombination(
    elementA: Element,
    elementB: Element,
    combination: CombinationReaction
  ) {
    // 두 원소 모두 소멸
    this.destroyElement(elementA);
    this.destroyElement(elementB);

    // 새로운 중립 원소 생성 (폭발 위치)
    const centerX = (elementA.body.position.x + elementB.body.position.x) / 2;
    const centerY = (elementA.body.position.y + elementB.body.position.y) / 2;

    // 폭발 효과
    this.createExplosion(centerX, centerY);

    // 새로운 바람 원소 생성
    setTimeout(() => {
      this.addNeutralElement('wind', centerX, centerY);
    }, 500);

    // 반응 결과 생성
    const reaction: ReactionResult = {
      type: 'combination',
      participants: [elementA.participantId, elementB.participantId],
      message: combination.message(elementA.name, elementB.name),
      scoreChanges: {
        [elementA.participantId]: combination.score,
        [elementB.participantId]: combination.score,
      },
      effects: 'combine',
    };

    // 점수 업데이트
    elementA.alchemyScore += combination.score;
    elementB.alchemyScore += combination.score;

    this.onReaction?.(reaction);
  }

  private getReaction(sourceType: ElementType, targetType: ElementType) {
    const reactions = ELEMENT_REACTIONS[sourceType];
    return reactions?.find((r) => r.target === targetType);
  }

  private applyReaction(
    source: Element,
    target: Element,
    reaction: ElementReaction
  ) {
    source.reactionCount++;
    target.reactionCount++;

    // 효과 적용
    switch (reaction.effect) {
      case 'destroy':
        this.destroyElement(target);
        break;
      case 'weaken':
        this.weakenElement(target);
        break;
      case 'growth':
        this.strengthenElement(target);
        break;
      case 'boost':
        this.strengthenElement(source);
        break;
    }

    // 반응 결과 생성
    const reactionResult: ReactionResult = {
      type: reaction.type,
      participants: [source.participantId, target.participantId],
      message: reaction.message(source.name, target.name),
      scoreChanges: {
        [source.participantId]: reaction.score,
        [target.participantId]:
          reaction.effect === 'growth' ? reaction.score : 0,
      },
      effects: reaction.effect,
    };

    // 점수 업데이트
    source.alchemyScore += reaction.score;
    if (reaction.effect === 'growth') {
      target.alchemyScore += reaction.score;
    }

    this.onReaction?.(reactionResult);
  }

  private destroyElement(element: Element) {
    element.isAlive = false;
    // 소멸 효과
    this.createDestroyEffect(
      element.body.position.x,
      element.body.position.y,
      element.type
    );

    // 물리 바디 제거
    setTimeout(() => {
      Matter.World.remove(this.engine.world, element.body);
      this.elements.delete(element.id);
    }, 1000);
  }

  private weakenElement(element: Element) {
    // 크기 축소 효과
    Matter.Body.scale(element.body, 0.8, 0.8);

    // 색상 변화
    if (element.body.render.fillStyle) {
      element.body.render.fillStyle = element.body.render.fillStyle + '80'; // 투명도 추가
    }
  }

  private strengthenElement(element: Element) {
    // 크기 확대 효과
    Matter.Body.scale(element.body, 1.2, 1.2);

    // 글로우 효과
    element.body.render.strokeStyle =
      alchemyTheme.colors.elements[element.type];
    element.body.render.lineWidth = 3;
  }

  private createExplosion(x: number, y: number) {
    // 주변 원소들에게 충격파 적용
    this.elements.forEach((element) => {
      if (!element.isAlive) return;

      const dx = element.body.position.x - x;
      const dy = element.body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = 0.02 / (distance + 1);
        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;

        Matter.Body.applyForce(element.body, element.body.position, {
          x: forceX,
          y: forceY,
        });
      }
    });
  }

  private createDestroyEffect(x: number, y: number, elementType: ElementType) {
    // TODO: 파티클 효과 구현
    console.log(`💥 ${elementType} 원소가 ${x}, ${y}에서 소멸!`);
  }

  private addNeutralElement(type: ElementType, x: number, y: number) {
    const physicsProps = alchemyTheme.physics[type];
    const colors = alchemyTheme.colors.elements;

    const body = Matter.Bodies.circle(x, y, 12, {
      density: physicsProps.density,
      restitution: physicsProps.restitution,
      friction: 0.3,
      render: {
        fillStyle: colors[type],
        strokeStyle: colors[type],
        lineWidth: 1,
      },
    });

    const element: Element = {
      id: `neutral-${this.neutralElementCounter++}`,
      participantId: 'neutral',
      type,
      body,
      name: `중립 ${type}`,
      isAlive: true,
      reactionCount: 0,
      alchemyScore: 0,
    };

    this.elements.set(element.id, element);
    Matter.World.add(this.engine.world, body);
  }

  // 20초마다 소수 원소 보충
  addMinorityElements() {
    const participantElements = Array.from(this.elements.values())
      .filter((e) => e.participantId !== 'neutral' && e.isAlive)
      .map((e) => e.type);

    const allElementTypes: ElementType[] = [
      'fire',
      'water',
      'wood',
      'metal',
      'earth',
      'wind',
    ];
    const missingElements = allElementTypes.filter(
      (type) => !participantElements.includes(type)
    );

    missingElements.forEach((type, index) => {
      setTimeout(() => {
        const x = 300 + index * 50 + Math.random() * 100;
        this.addNeutralElement(type, x, 80);
      }, index * 500);
    });
  }

  start() {
    if (this.render) {
      Matter.Render.run(this.render);
    }
    Matter.Runner.run(this.engine);
  }

  stop() {
    if (this.render) {
      Matter.Render.stop(this.render);
    }
    Matter.Engine.clear(this.engine);
  }

  getElementStats() {
    const stats: {
      [participantId: string]: {
        alchemyScore: number;
        reactionCount: number;
        isAlive: boolean;
      };
    } = {};

    this.elements.forEach((element) => {
      if (element.participantId !== 'neutral') {
        stats[element.participantId] = {
          alchemyScore: element.alchemyScore,
          reactionCount: element.reactionCount,
          isAlive: element.isAlive,
        };
      }
    });

    return stats;
  }

  getAliveParticipants() {
    return Array.from(this.elements.values())
      .filter((e) => e.participantId !== 'neutral' && e.isAlive)
      .map((e) => e.participantId);
  }
}
