import { ElementInstance } from '@/types/game';
import Matter from 'matter-js';
import { ELEMENT_COLORS, getElementPhysics } from './element-system';

export class PhysicsEngine {
  private engine: Matter.Engine;
  private render: Matter.Render | null = null;
  private world: Matter.World;
  private bodies: Map<string, Matter.Body> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private isRunning = false;

  // 플라스크 크기 설정
  private readonly FLASK_WIDTH = 600;
  private readonly FLASK_HEIGHT = 800;
  private readonly ELEMENT_SIZE = 30;

  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // 중력 설정
    this.engine.world.gravity.y = 0.8;
    this.engine.world.gravity.x = 0;

    // 플라스크 벽 생성
    this.createFlaskWalls();
  }

  public initializeCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Canvas 크기 설정
    canvas.width = this.FLASK_WIDTH;
    canvas.height = this.FLASK_HEIGHT;

    // Matter.js 렌더러 생성
    this.render = Matter.Render.create({
      canvas: canvas,
      engine: this.engine,
      options: {
        width: this.FLASK_WIDTH,
        height: this.FLASK_HEIGHT,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
  }

  private createFlaskWalls() {
    const wallThickness = 20;

    // 바닥
    const ground = Matter.Bodies.rectangle(
      this.FLASK_WIDTH / 2,
      this.FLASK_HEIGHT - wallThickness / 2,
      this.FLASK_WIDTH,
      wallThickness,
      {
        isStatic: true,
        render: { fillStyle: '#8B4513' },
      }
    );

    // 왼쪽 벽
    const leftWall = Matter.Bodies.rectangle(
      wallThickness / 2,
      this.FLASK_HEIGHT / 2,
      wallThickness,
      this.FLASK_HEIGHT,
      {
        isStatic: true,
        render: { fillStyle: '#8B4513' },
      }
    );

    // 오른쪽 벽
    const rightWall = Matter.Bodies.rectangle(
      this.FLASK_WIDTH - wallThickness / 2,
      this.FLASK_HEIGHT / 2,
      wallThickness,
      this.FLASK_HEIGHT,
      {
        isStatic: true,
        render: { fillStyle: '#8B4513' },
      }
    );

    Matter.World.add(this.world, [ground, leftWall, rightWall]);
  }

  public addElement(element: ElementInstance): Matter.Body {
    const physics = getElementPhysics(element.element);

    // 투입구에서 약간의 랜덤 위치로 원소 생성
    const x = this.FLASK_WIDTH / 2 + (Math.random() - 0.5) * 100;
    const y = 50;

    console.log(
      `원소 생성: ${element.element} (${element.id}) at (${x}, ${y})`
    );

    const body = Matter.Bodies.circle(x, y, this.ELEMENT_SIZE, {
      density: physics.density,
      friction: physics.friction,
      restitution: physics.restitution,
      frictionAir: physics.frictionAir,
      render: {
        fillStyle: ELEMENT_COLORS[element.element],
        strokeStyle: '#fff',
        lineWidth: 2,
      },
      label: element.id,
    });

    Matter.World.add(this.world, body);
    this.bodies.set(element.id, body);

    console.log(
      `물리 바디 추가 완료: ${element.id}, 총 바디 수: ${this.bodies.size}`
    );

    return body;
  }

  public removeElement(elementId: string) {
    const body = this.bodies.get(elementId);
    if (body) {
      Matter.World.remove(this.world, body);
      this.bodies.delete(elementId);
    }
  }

  public updateElementPosition(
    elementId: string
  ): { x: number; y: number } | null {
    const body = this.bodies.get(elementId);
    if (!body) return null;

    return {
      x: body.position.x,
      y: body.position.y,
    };
  }

  public checkCollisions(): Array<{ element1Id: string; element2Id: string }> {
    const collisions: Array<{ element1Id: string; element2Id: string }> = [];

    // 현재 프레임에서 충돌 검사를 위해 간단한 거리 기반 검사 사용
    const elementBodies = Array.from(this.bodies.entries());

    if (elementBodies.length < 2) return collisions;

    for (let i = 0; i < elementBodies.length; i++) {
      for (let j = i + 1; j < elementBodies.length; j++) {
        const [id1, body1] = elementBodies[i];
        const [id2, body2] = elementBodies[j];

        const distance = Math.sqrt(
          Math.pow(body1.position.x - body2.position.x, 2) +
            Math.pow(body1.position.y - body2.position.y, 2)
        );

        // 두 원소가 접촉하거나 겹칠 때 (충돌 범위를 넓힘)
        const collisionDistance = this.ELEMENT_SIZE * 2.5; // 더 넓은 충돌 범위

        if (distance < collisionDistance) {
          collisions.push({
            element1Id: id1,
            element2Id: id2,
          });

          // 디버깅용 로그
          console.log(
            `충돌 감지: ${id1} vs ${id2}, 거리: ${distance.toFixed(2)}`
          );
        }
      }
    }

    return collisions;
  }

  public start() {
    if (this.isRunning) return;

    this.isRunning = true;

    if (this.render) {
      Matter.Render.run(this.render);
    }

    // 물리 엔진 업데이트 루프
    const update = () => {
      if (!this.isRunning) return;

      Matter.Engine.update(this.engine, 1000 / 60); // 60 FPS
      requestAnimationFrame(update);
    };

    update();
  }

  public stop() {
    this.isRunning = false;

    if (this.render) {
      Matter.Render.stop(this.render);
    }
  }

  public reset() {
    // 모든 원소 제거
    for (const body of this.bodies.values()) {
      Matter.World.remove(this.world, body);
    }
    this.bodies.clear();

    // 엔진 리셋
    Matter.Engine.clear(this.engine);
    this.createFlaskWalls();
  }

  public createExplosion(x: number, y: number, force: number = 0.02) {
    // 증기화 반응 시 폭발 효과
    const bodies = this.world.bodies.filter((body) => !body.isStatic);

    for (const body of bodies) {
      const distance = Math.sqrt(
        Math.pow(body.position.x - x, 2) + Math.pow(body.position.y - y, 2)
      );

      if (distance < 150) {
        // 폭발 반경
        const forceX = ((body.position.x - x) / distance) * force;
        const forceY = ((body.position.y - y) / distance) * force;

        Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
      }
    }
  }
}
