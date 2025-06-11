import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import {
  ELEMENT_CONFIG,
  ELEMENT_REACTIONS,
  ElementType,
  GameElement,
  Reaction,
} from '../types/game';

export class GameScene extends Phaser.Scene {
  private elements: Map<string, Phaser.Physics.Matter.Sprite> = new Map();
  private gameStore: any;
  private neutralElementTimer: Phaser.Time.TimerEvent | null = null;
  private gameTimer: Phaser.Time.TimerEvent | null = null;
  private lastCollisionTime: Map<string, number> = new Map();

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // 원소 스프라이트 생성 (임시로 컬러 원형)
    this.createElementSprites();
  }

  create() {
    // Matter.js 물리 엔진 활성화
    this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height);

    // 게임 스토어 참조
    this.gameStore = useGameStore.getState();

    // 초기 원소들 생성
    this.createInitialElements();

    // 중립 원소 보충 시스템 시작
    this.startNeutralElementSystem();

    // 게임 종료 타이머 (3분)
    this.gameTimer = this.time.delayedCall(180000, () => {
      this.endGame();
    });

    // 충돌 감지 설정
    this.matter.world.on('collisionstart', (event: any) => {
      this.handleCollisions(event.pairs);
    });

    // 파티클 시스템 초기화
    this.createParticleSystems();
  }

  update() {
    // 원소들의 상태 업데이트
    this.updateElements();

    // 게임 종료 조건 체크
    this.checkGameEndConditions();
  }

  private createElementSprites() {
    // 각 원소별 컬러 원형 스프라이트 생성
    Object.entries(ELEMENT_CONFIG).forEach(([type, config]) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(parseInt(config.color.replace('#', '0x')));
      graphics.fillCircle(25, 25, 25);
      graphics.generateTexture(type, 50, 50);
      graphics.destroy();
    });
  }

  private createInitialElements() {
    const { players } = this.gameStore;

    players.forEach((player: any, index: number) => {
      this.createPlayerElement(player, index);
    });
  }

  private createPlayerElement(
    player: { id: string; element: ElementType; name: string },
    index: number
  ) {
    const config = ELEMENT_CONFIG[player.element];

    // 초기 위치 (플라스크 상단에서 떨어뜨림)
    const x = 400 + (index - 1) * 100 + (Math.random() - 0.5) * 50;
    const y = 100;

    // Matter.js 스프라이트 생성
    const sprite = this.matter.add.sprite(x, y, player.element, undefined, {
      mass: config.physics.mass,
      friction: config.physics.friction,
      restitution: config.physics.restitution,
      density: config.physics.density,
      shape: 'circle',
    });

    // 스프라이트에 게임 정보 저장
    sprite.setData('elementId', `element-${player.id}`);
    sprite.setData('playerId', player.id);
    sprite.setData('elementType', player.element);
    sprite.setData('health', 100);
    sprite.setData('isNeutral', false);

    // 원소 맵에 추가
    this.elements.set(`element-${player.id}`, sprite);

    // 시각적 효과 추가
    this.addElementEffects(sprite, player.element);
  }

  private createNeutralElement(elementType: ElementType) {
    const config = ELEMENT_CONFIG[elementType];
    if (!config) return;

    // 무작위 위치에서 생성
    const x = Phaser.Math.Between(100, this.scale.width - 100);
    const y = 50;

    const elementId = `neutral-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const sprite = this.matter.add.sprite(x, y, elementType, undefined, {
      mass: config.physics.mass,
      friction: config.physics.friction,
      restitution: config.physics.restitution,
      density: config.physics.density,
      shape: 'circle',
    });

    sprite.setData('elementId', elementId);
    sprite.setData('elementType', elementType);
    sprite.setData('health', 100);
    sprite.setData('isNeutral', true);

    this.elements.set(elementId, sprite);
    this.addElementEffects(sprite, elementType);

    // 게임 스토어에 추가
    const gameElement: GameElement = {
      id: elementId,
      type: elementType,
      isNeutral: true,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      physics: config.physics,
      reactions: [],
    };

    this.gameStore.addNeutralElement(gameElement);
  }

  private addElementEffects(
    sprite: Phaser.Physics.Matter.Sprite,
    elementType: ElementType
  ) {
    const config = ELEMENT_CONFIG[elementType];

    // 글로우 효과
    sprite.setTint(parseInt(config.color.replace('#', '0x')));

    // 원소 이모지 텍스트 추가
    const text = this.add
      .text(sprite.x, sprite.y, config.emoji, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // 텍스트가 스프라이트를 따라다니도록 설정
    sprite.setData('text', text);
  }

  private startNeutralElementSystem() {
    // 매 20초마다 중립 원소 추가
    this.neutralElementTimer = this.time.addEvent({
      delay: 20000,
      callback: this.addNeutralElements,
      callbackScope: this,
      loop: true,
    });
  }

  private addNeutralElements() {
    const allElementTypes = Object.keys(ELEMENT_CONFIG) as ElementType[];
    const playerElements = this.gameStore.players.map((p: any) => p.element);
    const unusedElements = allElementTypes.filter(
      (type) => !playerElements.includes(type)
    );

    // 사용되지 않은 원소 중 하나를 무작위로 선택
    if (unusedElements.length > 0) {
      const randomElement =
        unusedElements[Math.floor(Math.random() * unusedElements.length)];
      this.createNeutralElement(randomElement);
    }
  }

  private handleCollisions(pairs: any[]) {
    pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const spriteA = bodyA.gameObject;
      const spriteB = bodyB.gameObject;

      if (!spriteA || !spriteB) return;

      const elementA = spriteA.getData('elementType');
      const elementB = spriteB.getData('elementType');

      if (!elementA || !elementB) return;

      // 충돌 쿨다운 체크 (같은 원소끼리 너무 자주 반응하지 않도록)
      const collisionKey = [elementA, elementB].sort().join('-');
      const lastTime = this.lastCollisionTime.get(collisionKey) || 0;
      const now = Date.now();

      if (now - lastTime < 1000) return; // 1초 쿨다운

      this.lastCollisionTime.set(collisionKey, now);

      // 상성 관계 체크 및 반응 처리
      this.processElementReaction(spriteA, spriteB);
    });
  }

  private processElementReaction(
    spriteA: Phaser.Physics.Matter.Sprite,
    spriteB: Phaser.Physics.Matter.Sprite
  ) {
    const elementTypeA = spriteA.getData('elementType');
    const elementTypeB = spriteB.getData('elementType');

    // 반응 관계 찾기
    const reactionKey1 = `${elementTypeA}-${elementTypeB}`;
    const reactionKey2 = `${elementTypeB}-${elementTypeA}`;

    const reaction =
      ELEMENT_REACTIONS[reactionKey1] || ELEMENT_REACTIONS[reactionKey2];

    if (!reaction) return;

    // 반응 효과 적용
    this.applyReactionEffect(spriteA, spriteB, reaction);

    // 시각적 효과 생성
    this.createReactionEffect(spriteA, spriteB, reaction);

    // 게임 스토어에 반응 기록
    this.recordReaction(spriteA, spriteB, reaction);
  }

  private applyReactionEffect(
    spriteA: Phaser.Physics.Matter.Sprite,
    spriteB: Phaser.Physics.Matter.Sprite,
    reaction: any
  ) {
    const healthA = spriteA.getData('health');
    const healthB = spriteB.getData('health');

    switch (reaction.effect) {
      case 'strengthen':
        // 상생 반응 - 체력 증가
        spriteA.setData('health', Math.min(100, healthA + 10));
        spriteB.setData('health', Math.min(100, healthB + 10));
        break;

      case 'weaken':
        // 약화 반응 - 체력 감소
        spriteA.setData('health', Math.max(0, healthA - 20));
        spriteB.setData('health', Math.max(0, healthB - 20));
        break;

      case 'destroy':
        // 소멸 반응 - 한쪽 또는 양쪽 소멸
        if (reaction.type === 'extinguish') {
          // 물이 불을 소화
          if (spriteA.getData('elementType') === 'water') {
            spriteB.setData('health', 0);
          } else {
            spriteA.setData('health', 0);
          }
        } else {
          // 상호 소멸
          spriteA.setData('health', 0);
          spriteB.setData('health', 0);
        }
        break;

      case 'combine':
        // 조합 반응 - 새로운 원소 생성
        if (reaction.type === 'steam') {
          this.createSteamExplosion(spriteA, spriteB);
          spriteA.setData('health', 0);
          spriteB.setData('health', 0);
        }
        break;
    }

    // 체력이 0이 된 원소 제거
    if (spriteA.getData('health') <= 0) {
      this.removeElement(spriteA);
    }
    if (spriteB.getData('health') <= 0) {
      this.removeElement(spriteB);
    }
  }

  private createSteamExplosion(
    spriteA: Phaser.Physics.Matter.Sprite,
    spriteB: Phaser.Physics.Matter.Sprite
  ) {
    const centerX = (spriteA.x + spriteB.x) / 2;
    const centerY = (spriteA.y + spriteB.y) / 2;

    // 폭발 효과
    const explosion = this.add.circle(centerX, centerY, 20, 0xffffff, 0.8);

    this.tweens.add({
      targets: explosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => explosion.destroy(),
    });

    // 주변 원소들을 밀어내는 효과
    this.elements.forEach((sprite) => {
      const distance = Phaser.Math.Distance.Between(
        centerX,
        centerY,
        sprite.x,
        sprite.y
      );
      if (distance < 150) {
        const force = (0.1 * (150 - distance)) / 150;
        const angle = Phaser.Math.Angle.Between(
          centerX,
          centerY,
          sprite.x,
          sprite.y
        );

        // 올바른 벡터 형식으로 힘 적용
        const forceVector = new Phaser.Math.Vector2(
          Math.cos(angle) * force,
          Math.sin(angle) * force
        );
        sprite.applyForce(forceVector);
      }
    });

    // 바람 원소 생성
    this.createNeutralElement('wind');
  }

  private createReactionEffect(
    spriteA: Phaser.Physics.Matter.Sprite,
    spriteB: Phaser.Physics.Matter.Sprite,
    reaction: any
  ) {
    const centerX = (spriteA.x + spriteB.x) / 2;
    const centerY = (spriteA.y + spriteB.y) / 2;

    // 반응 타입별 파티클 효과
    const particleConfig = this.getParticleConfig(reaction.type);

    const particles = this.add.particles(centerX, centerY, 'spark', {
      ...particleConfig,
      lifespan: 1000,
      scale: { start: 0.5, end: 0 },
    });

    // 1초 후 파티클 제거
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  private getParticleConfig(reactionType: string) {
    switch (reactionType) {
      case 'growth':
      case 'amplify':
      case 'harden':
      case 'refine':
      case 'generate':
      case 'seed':
        return {
          tint: 0x00ff00,
          speed: { min: 10, max: 30 },
          quantity: 5,
        };
      case 'extinguish':
      case 'melt':
      case 'cut':
        return {
          tint: 0xff0000,
          speed: { min: 30, max: 60 },
          quantity: 10,
        };
      case 'slash':
      case 'crack':
      case 'weathering':
        return {
          tint: 0xffff00,
          speed: { min: 20, max: 40 },
          quantity: 7,
        };
      case 'steam':
        return {
          tint: 0xffffff,
          speed: { min: 50, max: 100 },
          quantity: 15,
        };
      default:
        return {
          tint: 0x888888,
          speed: { min: 10, max: 20 },
          quantity: 3,
        };
    }
  }

  private recordReaction(
    spriteA: Phaser.Physics.Matter.Sprite,
    spriteB: Phaser.Physics.Matter.Sprite,
    reaction: any
  ) {
    const reactionData: Reaction = {
      id: `reaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: reaction.type,
      elements: [spriteA.getData('elementId'), spriteB.getData('elementId')],
      timestamp: Date.now(),
      position: {
        x: (spriteA.x + spriteB.x) / 2,
        y: (spriteA.y + spriteB.y) / 2,
      },
      description: reaction.description,
    };

    this.gameStore.addReaction(reactionData);

    // 플레이어 점수 업데이트
    const playerIdA = spriteA.getData('playerId');
    const playerIdB = spriteB.getData('playerId');

    if (playerIdA && !spriteA.getData('isNeutral')) {
      this.gameStore.updateScore(playerIdA, {
        alchemyPoints:
          this.gameStore.scores.find((s: any) => s.playerId === playerIdA)
            ?.alchemyPoints + reaction.pointsA,
        reactionCount:
          this.gameStore.scores.find((s: any) => s.playerId === playerIdA)
            ?.reactionCount + 1,
      });
    }

    if (playerIdB && !spriteB.getData('isNeutral')) {
      this.gameStore.updateScore(playerIdB, {
        alchemyPoints:
          this.gameStore.scores.find((s: any) => s.playerId === playerIdB)
            ?.alchemyPoints + reaction.pointsB,
        reactionCount:
          this.gameStore.scores.find((s: any) => s.playerId === playerIdB)
            ?.reactionCount + 1,
      });
    }
  }

  private removeElement(sprite: Phaser.Physics.Matter.Sprite) {
    const elementId = sprite.getData('elementId');
    const text = sprite.getData('text');

    // 소멸 효과
    this.tweens.add({
      targets: [sprite, text],
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        this.elements.delete(elementId);
        this.gameStore.removeElement(elementId);
        sprite.destroy();
        if (text) text.destroy();
      },
    });
  }

  private updateElements() {
    // 스프라이트 위치와 텍스트 동기화
    this.elements.forEach((sprite) => {
      const text = sprite.getData('text');
      if (text) {
        text.setPosition(sprite.x, sprite.y);
      }
    });
  }

  private checkGameEndConditions() {
    const livingPlayerElements = Array.from(this.elements.values()).filter(
      (sprite) => !sprite.getData('isNeutral') && sprite.getData('health') > 0
    );

    if (livingPlayerElements.length <= 1) {
      // 마지막 생존자가 결정되면 게임 종료
      this.endGame();
    }
  }

  private endGame() {
    // 타이머 정리
    if (this.neutralElementTimer) {
      this.neutralElementTimer.destroy();
    }
    if (this.gameTimer) {
      this.gameTimer.destroy();
    }

    // 게임 종료
    this.gameStore.endGame();
  }

  private createParticleSystems() {
    // 기본 스파크 파티클을 위한 텍스처 생성
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('spark', 4, 4);
    graphics.destroy();
  }
}
