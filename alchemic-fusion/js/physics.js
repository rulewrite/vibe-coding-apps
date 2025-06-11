/**
 * 알케믹 퓨전 - 물리 엔진
 * Matter.js를 사용하여 원소들의 물리적 상호작용을 구현합니다.
 */

class PhysicsEngine {
  constructor() {
    this.engine = null;
    this.world = null;
    this.render = null;
    this.canvas = null;
    this.elements = new Map(); // 물리 바디와 게임 원소를 연결
    this.neutralElements = new Map(); // 중립 원소들
    this.isRunning = false;
    this.isPaused = false;
    this.lastNeutralSpawn = 0;
    this.gameStartTime = 0;

    this.setupPhysicsEngine();
  }

  setupPhysicsEngine() {
    // Matter.js 모듈들 가져오기
    this.Engine = Matter.Engine;
    this.Render = Matter.Render;
    this.Runner = Matter.Runner;
    this.Bodies = Matter.Bodies;
    this.Composite = Matter.Composite;
    this.Events = Matter.Events;
    this.Vector = Matter.Vector;
    this.Body = Matter.Body;
    this.Constraint = Matter.Constraint;

    // 물리 엔진 생성
    this.engine = this.Engine.create();
    this.world = this.engine.world;

    // 중력 설정
    this.engine.world.gravity.y = 0.5;
    this.engine.world.gravity.x = 0;

    // 충돌 이벤트 설정
    this.setupCollisionEvents();
  }

  init(canvas, players) {
    this.canvas = canvas;
    this.players = players;
    this.gameStartTime = Date.now();
    this.lastNeutralSpawn = this.gameStartTime;

    // 캔버스 크기 설정
    this.setupCanvas();

    // 렌더러 생성
    this.setupRenderer();

    // 경계 벽 생성
    this.createBoundaries();

    // 플레이어 원소들 생성
    this.createPlayerElements();

    console.log('🔧 물리 엔진이 초기화되었습니다.');
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
  }

  setupRenderer() {
    this.render = this.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.canvasWidth,
        height: this.canvasHeight,
        wireframes: false,
        background: 'transparent',
        showVelocity: false,
        showAngleIndicator: false,
        showDebug: false,
      },
    });
  }

  createBoundaries() {
    const thickness = 20;
    const options = {
      isStatic: true,
      render: {
        fillStyle: 'rgba(79, 209, 199, 0.3)',
        strokeStyle: '#4fd1c7',
        lineWidth: 2,
      },
    };

    // 경계 벽들
    const boundaries = [
      // 바닥
      this.Bodies.rectangle(
        this.canvasWidth / 2,
        this.canvasHeight - thickness / 2,
        this.canvasWidth,
        thickness,
        options
      ),
      // 좌측 벽
      this.Bodies.rectangle(
        thickness / 2,
        this.canvasHeight / 2,
        thickness,
        this.canvasHeight,
        options
      ),
      // 우측 벽
      this.Bodies.rectangle(
        this.canvasWidth - thickness / 2,
        this.canvasHeight / 2,
        thickness,
        this.canvasHeight,
        options
      ),
      // 상단 (투입구 제외)
      this.Bodies.rectangle(
        this.canvasWidth / 4,
        thickness / 2,
        this.canvasWidth / 2 - 50,
        thickness,
        options
      ),
      this.Bodies.rectangle(
        (this.canvasWidth * 3) / 4,
        thickness / 2,
        this.canvasWidth / 2 - 50,
        thickness,
        options
      ),
    ];

    this.Composite.add(this.world, boundaries);
  }

  createPlayerElements() {
    const dropZoneWidth = 100;
    const dropZoneX = this.canvasWidth / 2 - dropZoneWidth / 2;
    const dropY = 50;

    this.players.forEach((player, index) => {
      // 약간의 위치 편차를 주어 겹치지 않게 함
      const offsetX = (Math.random() - 0.5) * dropZoneWidth;
      const offsetY = index * 30; // 순차적으로 떨어지도록

      setTimeout(() => {
        this.createElementBody(player, dropZoneX + offsetX, dropY + offsetY);
      }, index * 500); // 0.5초 간격으로 투입
    });
  }

  createElementBody(player, x, y) {
    const elementInfo = window.ElementSystem.getElementInfo(player.element);
    if (!elementInfo) return;

    const radius = 20;
    const body = this.Bodies.circle(x, y, radius, {
      restitution: elementInfo.properties.restitution,
      friction: elementInfo.properties.friction,
      density: elementInfo.properties.mass * 0.01,
      render: {
        fillStyle: elementInfo.color,
        strokeStyle: elementInfo.color,
        lineWidth: 2,
      },
    });

    // 초기 속도 설정
    const initialVelocity = {
      x: (Math.random() - 0.5) * elementInfo.properties.speed,
      y: elementInfo.properties.speed,
    };
    this.Body.setVelocity(body, initialVelocity);

    // 원소 정보 연결
    body.elementData = {
      playerId: player.id,
      element: player.element,
      isNeutral: false,
      strength: 1,
      health: 100,
      lastReactionTime: 0,
    };

    this.elements.set(body.id, body);
    this.Composite.add(this.world, body);

    // 투입 효과
    this.createDropEffect(x, y);

    console.log(`원소 투입: ${player.name} (${player.element})`);
  }

  createNeutralElement() {
    const playerElements = this.players.map((p) => p.element);
    const neutralElementsData =
      window.ElementSystem.generateNeutralElements(playerElements);

    neutralElementsData.forEach((elementData) => {
      const elementInfo = window.ElementSystem.getElementInfo(
        elementData.element
      );
      if (!elementInfo) return;

      // 무작위 위치에서 생성
      const x = Math.random() * (this.canvasWidth - 100) + 50;
      const y = 50;
      const radius = 15; // 중립 원소는 약간 작게

      const body = this.Bodies.circle(x, y, radius, {
        restitution: elementInfo.properties.restitution,
        friction: elementInfo.properties.friction,
        density: elementInfo.properties.mass * 0.008,
        render: {
          fillStyle: elementInfo.color,
          strokeStyle: elementInfo.color,
          lineWidth: 1,
          opacity: 0.7,
        },
      });

      body.elementData = {
        playerId: null,
        element: elementData.element,
        isNeutral: true,
        strength: 0.8,
        health: 80,
        lastReactionTime: 0,
      };

      this.neutralElements.set(body.id, body);
      this.Composite.add(this.world, body);

      // 생성 효과
      this.createSpawnEffect(x, y);
    });
  }

  setupCollisionEvents() {
    this.Events.on(this.engine, 'collisionStart', (event) => {
      if (this.isPaused) return;

      event.pairs.forEach((pair) => {
        this.handleCollision(pair.bodyA, pair.bodyB);
      });
    });

    this.Events.on(this.engine, 'beforeUpdate', () => {
      if (this.isPaused) return;

      this.updateNeutralElementSpawning();
      this.updateElementStates();
    });
  }

  handleCollision(bodyA, bodyB) {
    // 경계 벽과의 충돌은 무시
    if (!bodyA.elementData || !bodyB.elementData) return;

    const elementA = bodyA.elementData.element;
    const elementB = bodyB.elementData.element;

    // 같은 원소끼리는 반응하지 않음
    if (elementA === elementB) return;

    // 최근에 반응했다면 쿨다운 적용
    const now = Date.now();
    if (
      now - bodyA.elementData.lastReactionTime < 1000 ||
      now - bodyB.elementData.lastReactionTime < 1000
    ) {
      return;
    }

    // 반응 확률 계산
    const distance = this.Vector.magnitude(
      this.Vector.sub(bodyA.position, bodyB.position)
    );
    const relativeVelocity = this.Vector.magnitude(
      this.Vector.sub(bodyA.velocity, bodyB.velocity)
    );
    const probability = window.ElementSystem.calculateReactionProbability(
      elementA,
      elementB,
      distance,
      relativeVelocity
    );

    if (Math.random() > probability) return;

    // 반응 처리
    const reactions = window.ElementSystem.checkReaction(elementA, elementB);
    if (reactions.length > 0) {
      // 가장 우선순위가 높은 반응 선택 (조합 > 상극 > 상생)
      const priorityOrder = ['combination', 'conflict', 'symbiosis'];
      const selectedReaction = reactions.sort(
        (a, b) =>
          priorityOrder.indexOf(a.category) - priorityOrder.indexOf(b.category)
      )[0];

      this.executeReaction(selectedReaction, bodyA, bodyB);
    }
  }

  executeReaction(reaction, bodyA, bodyB) {
    const now = Date.now();
    bodyA.elementData.lastReactionTime = now;
    bodyB.elementData.lastReactionTime = now;

    // 반응 위치 계산
    const reactionPos = {
      x: (bodyA.position.x + bodyB.position.x) / 2,
      y: (bodyA.position.y + bodyB.position.y) / 2,
    };

    // 시각 효과 생성
    this.createReactionEffect(reaction, reactionPos);

    // 반응 효과 적용
    switch (reaction.effect) {
      case 'strengthen':
        this.applyStrengthenEffect(bodyA, bodyB, reaction);
        break;
      case 'weaken':
        this.applyWeakenEffect(bodyA, bodyB, reaction);
        break;
      case 'eliminate':
        this.applyEliminateEffect(bodyA, bodyB, reaction);
        break;
      case 'mutual_weaken':
        this.applyMutualWeakenEffect(bodyA, bodyB, reaction);
        break;
      case 'create_wind':
        this.applyCreateWindEffect(bodyA, bodyB, reaction, reactionPos);
        break;
    }

    // 점수 업데이트
    this.updateScores(bodyA, bodyB, reaction);

    // 게임 로그 추가
    if (window.game) {
      const description = window.ElementSystem.getReactionDescription(reaction);
      window.game.addEventLog('reaction', description);
    }

    console.log(
      `반응 발생: ${reaction.name} (${reaction.source} → ${reaction.target})`
    );
  }

  applyStrengthenEffect(bodyA, bodyB, reaction) {
    const targetBody =
      reaction.source === bodyA.elementData.element ? bodyB : bodyA;
    const targetElement = targetBody.elementData.element;

    targetBody.elementData.strength += 0.2;
    targetBody.elementData.health = Math.min(
      100,
      targetBody.elementData.health + 20
    );

    // 물리적 특성 강화
    const newProperties = window.ElementSystem.applyStrengthEffect(
      targetElement,
      targetBody.elementData.strength
    );

    this.Body.setDensity(targetBody, newProperties.mass * 0.01);
    targetBody.restitution = newProperties.restitution;
    targetBody.friction = newProperties.friction;

    // 시각적 효과
    targetBody.render.strokeStyle = '#ffd700';
    targetBody.render.lineWidth = 3;

    setTimeout(() => {
      targetBody.render.strokeStyle =
        window.ElementSystem.getElementInfo(targetElement).color;
      targetBody.render.lineWidth = 2;
    }, 2000);
  }

  applyWeakenEffect(bodyA, bodyB, reaction) {
    const targetBody =
      reaction.target === bodyA.elementData.element ? bodyA : bodyB;
    const targetElement = targetBody.elementData.element;

    targetBody.elementData.strength -= 0.3;
    targetBody.elementData.health -= 30;

    if (targetBody.elementData.health <= 0) {
      this.eliminateElement(targetBody);
      return;
    }

    // 물리적 특성 약화
    const newProperties = window.ElementSystem.applyWeakenEffect(
      targetElement,
      Math.abs(targetBody.elementData.strength - 1)
    );

    this.Body.setDensity(targetBody, newProperties.mass * 0.01);
    targetBody.restitution = newProperties.restitution;
    targetBody.friction = newProperties.friction;

    // 시각적 효과
    targetBody.render.opacity = 0.7;
    targetBody.render.strokeStyle = '#666';
  }

  applyEliminateEffect(bodyA, bodyB, reaction) {
    const targetBody =
      reaction.target === bodyA.elementData.element ? bodyA : bodyB;
    this.eliminateElement(targetBody);
  }

  applyMutualWeakenEffect(bodyA, bodyB, reaction) {
    [bodyA, bodyB].forEach((body) => {
      body.elementData.strength -= 0.2;
      body.elementData.health -= 20;

      if (body.elementData.health <= 0) {
        this.eliminateElement(body);
      } else {
        body.render.opacity = 0.8;
      }
    });
  }

  applyCreateWindEffect(bodyA, bodyB, reaction, position) {
    // 원래 두 원소 제거
    this.eliminateElement(bodyA);
    this.eliminateElement(bodyB);

    // 증기 폭발 효과
    this.createExplosionEffect(position);

    // 주변 원소들을 밀어냄
    this.applyExplosionForce(position, 150, 0.02);

    // 중립 바람 원소 생성
    setTimeout(() => {
      this.createWindFromReaction(position);
    }, 1000);
  }

  eliminateElement(body) {
    const elementData = body.elementData;

    // 플레이어 원소인 경우 게임에 알림
    if (!elementData.isNeutral && window.game) {
      const player = window.game.players.find(
        (p) => p.id === elementData.playerId
      );
      if (player) {
        window.game.eliminatePlayer(elementData.playerId, '소멸');
      }
    }

    // 소멸 효과 생성
    this.createEliminationEffect(body.position, elementData.element);

    // 물리 세계에서 제거
    this.Composite.remove(this.world, body);
    this.elements.delete(body.id);
    if (elementData.isNeutral) {
      this.neutralElements.delete(body.id);
    }
  }

  createWindFromReaction(position) {
    const radius = 15;
    const body = this.Bodies.circle(position.x, position.y, radius, {
      restitution: 0.9,
      friction: 0.05,
      density: 0.005,
      render: {
        fillStyle: '#e0e0e0',
        strokeStyle: '#e0e0e0',
        lineWidth: 1,
        opacity: 0.8,
      },
    });

    body.elementData = {
      playerId: null,
      element: 'wind',
      isNeutral: true,
      strength: 1,
      health: 100,
      lastReactionTime: 0,
    };

    this.neutralElements.set(body.id, body);
    this.Composite.add(this.world, body);
  }

  updateScores(bodyA, bodyB, reaction) {
    if (!window.game) return;

    // 점수를 받을 플레이어 결정
    const sourceBody =
      reaction.source === bodyA.elementData.element ? bodyA : bodyB;

    if (!sourceBody.elementData.isNeutral) {
      window.game.updatePlayerScore(
        sourceBody.elementData.playerId,
        reaction.scoreChange,
        reaction.type
      );
    }
  }

  updateNeutralElementSpawning() {
    const now = Date.now();
    const timeSinceStart = now - this.gameStartTime;
    const timeSinceLastSpawn = now - this.lastNeutralSpawn;

    // 시간 기반 스폰 (20초마다)
    const shouldSpawnByTime = timeSinceLastSpawn >= 20000;

    // 이벤트 기반 스폰은 eliminateElement에서 처리됨

    if (shouldSpawnByTime) {
      this.createNeutralElement();
      this.lastNeutralSpawn = now;
    }
  }

  updateElementStates() {
    // 원소들의 상태 업데이트 (예: 자연 회복 등)
    this.elements.forEach((body) => {
      if (body.elementData.health < 100) {
        body.elementData.health += 0.1; // 천천히 회복
      }
    });
  }

  // 시각 효과 생성 메서드들
  createDropEffect(x, y) {
    // 투입 효과 (파티클 등)
    console.log(`Drop effect at ${x}, ${y}`);
  }

  createSpawnEffect(x, y) {
    // 중립 원소 생성 효과
    console.log(`Spawn effect at ${x}, ${y}`);
  }

  createReactionEffect(reaction, position) {
    // 반응 효과
    console.log(
      `Reaction effect: ${reaction.name} at ${position.x}, ${position.y}`
    );
  }

  createEliminationEffect(position, element) {
    // 소멸 효과
    console.log(
      `Elimination effect: ${element} at ${position.x}, ${position.y}`
    );
  }

  createExplosionEffect(position) {
    // 폭발 효과
    console.log(`Explosion effect at ${position.x}, ${position.y}`);
  }

  applyExplosionForce(center, radius, force) {
    this.elements.forEach((body) => {
      const distance = this.Vector.magnitude(
        this.Vector.sub(body.position, center)
      );
      if (distance < radius) {
        const direction = this.Vector.normalise(
          this.Vector.sub(body.position, center)
        );
        const forceVector = this.Vector.mult(
          direction,
          force * (1 - distance / radius)
        );
        this.Body.applyForce(body, body.position, forceVector);
      }
    });
  }

  // 게임 제어 메서드들
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.runner = this.Runner.create();
      this.Runner.run(this.runner, this.engine);
      this.Render.run(this.render);
      console.log('⚡ 물리 엔진이 시작되었습니다.');
    }
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.engine.enabled = false;
      console.log('⏸️ 물리 엔진이 일시정지되었습니다.');
    }
  }

  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.engine.enabled = true;
      console.log('▶️ 물리 엔진이 재개되었습니다.');
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      this.isPaused = false;

      if (this.runner) {
        this.Runner.stop(this.runner);
        this.runner = null;
      }

      if (this.render) {
        this.Render.stop(this.render);
      }

      // 모든 원소 제거
      this.Composite.clear(this.world, false);
      this.elements.clear();
      this.neutralElements.clear();

      console.log('⏹️ 물리 엔진이 정지되었습니다.');
    }
  }

  // 현재 상태 정보 가져오기
  getGameState() {
    const playerElements = Array.from(this.elements.values()).filter(
      (body) => !body.elementData.isNeutral
    );

    const neutralElements = Array.from(this.neutralElements.values());

    return {
      playerElementsCount: playerElements.length,
      neutralElementsCount: neutralElements.length,
      totalElements: playerElements.length + neutralElements.length,
      survivors: playerElements.filter((body) => body.elementData.health > 0),
    };
  }
}

// 전역 물리 엔진 인스턴스 생성
window.PhysicsEngine = new PhysicsEngine();
