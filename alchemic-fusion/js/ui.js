/**
 * 알케믹 퓨전 - UI 컨트롤러
 * 사용자 인터페이스와 시각 효과를 담당합니다.
 */

class UIController {
  constructor() {
    this.particles = [];
    this.effects = [];
    this.notifications = [];
    this.animationFrame = null;

    this.init();
  }

  init() {
    this.setupParticleSystem();
    this.setupNotificationSystem();
    this.startAnimationLoop();

    console.log('🎨 UI 컨트롤러가 초기화되었습니다.');
  }

  setupParticleSystem() {
    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.style.position = 'absolute';
    this.particleCanvas.style.top = '0';
    this.particleCanvas.style.left = '0';
    this.particleCanvas.style.pointerEvents = 'none';
    this.particleCanvas.style.zIndex = '10';

    this.particleCtx = this.particleCanvas.getContext('2d');

    // 게임 화면의 particle-system div에 추가
    const particleContainer = document.querySelector('.particle-system');
    if (particleContainer) {
      particleContainer.appendChild(this.particleCanvas);
    }
  }

  setupNotificationSystem() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'notification-container';
    this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
    document.body.appendChild(this.notificationContainer);
  }

  // 파티클 효과 생성
  createParticles(x, y, options = {}) {
    const defaults = {
      count: 10,
      color: '#ffd700',
      size: 3,
      velocity: 2,
      life: 1000,
      type: 'spark',
    };

    const config = { ...defaults, ...options };

    for (let i = 0; i < config.count; i++) {
      const particle = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * config.velocity * 2,
        vy: (Math.random() - 0.5) * config.velocity * 2,
        size: config.size * (0.5 + Math.random() * 0.5),
        color: config.color,
        life: config.life,
        maxLife: config.life,
        type: config.type,
        createdAt: Date.now(),
      };

      this.particles.push(particle);
    }
  }

  // 반응 효과 생성
  createReactionEffect(reaction, position) {
    const effectConfig = this.getReactionEffectConfig(reaction.type);

    // 파티클 효과
    this.createParticles(position.x, position.y, effectConfig.particles);

    // 화면 효과
    this.createScreenEffect(effectConfig.screen);

    // 텍스트 효과
    this.createFloatingText(
      position.x,
      position.y,
      reaction.name,
      effectConfig.text
    );

    // 카메라 흔들림 효과
    if (effectConfig.shake) {
      this.createScreenShake(
        effectConfig.shake.intensity,
        effectConfig.shake.duration
      );
    }
  }

  getReactionEffectConfig(reactionType) {
    const configs = {
      growth: {
        particles: { count: 15, color: '#66bb6a', size: 4, type: 'leaf' },
        screen: { color: '#66bb6a', intensity: 0.1 },
        text: { color: '#66bb6a', size: '16px' },
        shake: null,
      },
      amplify: {
        particles: { count: 20, color: '#ff6b35', size: 5, type: 'flame' },
        screen: { color: '#ff6b35', intensity: 0.15 },
        text: { color: '#ff6b35', size: '18px' },
        shake: { intensity: 2, duration: 300 },
      },
      harden: {
        particles: { count: 12, color: '#8d6e63', size: 3, type: 'stone' },
        screen: { color: '#8d6e63', intensity: 0.08 },
        text: { color: '#8d6e63', size: '16px' },
        shake: null,
      },
      refine: {
        particles: { count: 18, color: '#bdbdbd', size: 4, type: 'metal' },
        screen: { color: '#bdbdbd', intensity: 0.12 },
        text: { color: '#bdbdbd', size: '17px' },
        shake: { intensity: 1, duration: 200 },
      },
      spring: {
        particles: { count: 25, color: '#4fc3f7', size: 3, type: 'water' },
        screen: { color: '#4fc3f7', intensity: 0.1 },
        text: { color: '#4fc3f7', size: '16px' },
        shake: null,
      },
      seed: {
        particles: { count: 30, color: '#66bb6a', size: 2, type: 'seed' },
        screen: { color: '#66bb6a', intensity: 0.08 },
        text: { color: '#66bb6a', size: '15px' },
        shake: null,
      },
      steam: {
        particles: { count: 50, color: '#e0e0e0', size: 6, type: 'steam' },
        screen: { color: '#ffffff', intensity: 0.3 },
        text: { color: '#ffffff', size: '20px' },
        shake: { intensity: 5, duration: 800 },
      },
      extinguish: {
        particles: { count: 20, color: '#4fc3f7', size: 4, type: 'water' },
        screen: { color: '#4fc3f7', intensity: 0.15 },
        text: { color: '#4fc3f7', size: '18px' },
        shake: { intensity: 3, duration: 400 },
      },
      melt: {
        particles: { count: 25, color: '#ff6b35', size: 5, type: 'flame' },
        screen: { color: '#ff6b35', intensity: 0.2 },
        text: { color: '#ff6b35', size: '18px' },
        shake: { intensity: 3, duration: 500 },
      },
      cut: {
        particles: { count: 15, color: '#bdbdbd', size: 3, type: 'metal' },
        screen: { color: '#bdbdbd', intensity: 0.15 },
        text: { color: '#bdbdbd', size: '17px' },
        shake: { intensity: 4, duration: 300 },
      },
      slice: {
        particles: { count: 12, color: '#bdbdbd', size: 4, type: 'metal' },
        screen: { color: '#bdbdbd', intensity: 0.1 },
        text: { color: '#bdbdbd', size: '16px' },
        shake: { intensity: 2, duration: 200 },
      },
      crack: {
        particles: { count: 18, color: '#8d6e63', size: 3, type: 'stone' },
        screen: { color: '#8d6e63', intensity: 0.12 },
        text: { color: '#8d6e63', size: '17px' },
        shake: { intensity: 2, duration: 300 },
      },
      weather: {
        particles: { count: 22, color: '#e0e0e0', size: 4, type: 'wind' },
        screen: { color: '#e0e0e0', intensity: 0.1 },
        text: { color: '#e0e0e0', size: '16px' },
        shake: { intensity: 1, duration: 400 },
      },
    };

    return configs[reactionType] || configs.growth;
  }

  // 화면 효과 생성
  createScreenEffect(config) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${config.color};
            opacity: ${config.intensity};
            pointer-events: none;
            z-index: 999;
            animation: screenFlash 0.3s ease-out;
        `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }

  // 떠다니는 텍스트 효과
  createFloatingText(x, y, text, config) {
    const textElement = document.createElement('div');
    textElement.textContent = text;
    textElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${config.color};
            font-size: ${config.size};
            font-weight: bold;
            pointer-events: none;
            z-index: 100;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            animation: floatingText 2s ease-out forwards;
        `;

    document.body.appendChild(textElement);

    setTimeout(() => {
      if (textElement.parentNode) {
        textElement.parentNode.removeChild(textElement);
      }
    }, 2000);
  }

  // 화면 흔들림 효과
  createScreenShake(intensity, duration) {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;

    const originalTransform = gameScreen.style.transform;
    const startTime = Date.now();

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        gameScreen.style.transform = originalTransform;
        return;
      }

      const progress = elapsed / duration;
      const currentIntensity = intensity * (1 - progress);

      const offsetX = (Math.random() - 0.5) * currentIntensity * 2;
      const offsetY = (Math.random() - 0.5) * currentIntensity * 2;

      gameScreen.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

      requestAnimationFrame(shake);
    };

    shake();
  }

  // 알림 메시지 표시
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const colors = {
      info: '#4fc3f7',
      success: '#66bb6a',
      warning: '#ffb74d',
      error: '#f56565',
      reaction: '#9f7aea',
    };

    notification.style.cssText = `
            background: linear-gradient(135deg, ${
              colors[type] || colors.info
            }, ${colors[type] || colors.info}dd);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            font-weight: 600;
            font-size: 14px;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
        `;

    this.notificationContainer.appendChild(notification);

    // 애니메이션
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });

    // 클릭으로 제거
    notification.addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // 자동 제거
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);

    // 최대 5개까지만 표시
    while (this.notificationContainer.children.length > 5) {
      this.removeNotification(this.notificationContainer.firstChild);
    }
  }

  removeNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // 파티클 애니메이션 루프
  startAnimationLoop() {
    const animate = () => {
      this.updateParticles();
      this.renderParticles();
      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  updateParticles() {
    const now = Date.now();

    this.particles = this.particles.filter((particle) => {
      const age = now - particle.createdAt;
      if (age > particle.maxLife) return false;

      // 위치 업데이트
      particle.x += particle.vx;
      particle.y += particle.vy;

      // 중력 적용 (타입에 따라)
      if (particle.type !== 'steam' && particle.type !== 'wind') {
        particle.vy += 0.1;
      } else {
        particle.vy -= 0.05; // 위로 올라가는 효과
      }

      // 공기 저항
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // 생명력 감소
      particle.life = particle.maxLife - age;

      return true;
    });
  }

  renderParticles() {
    if (!this.particleCanvas || !this.particleCtx) return;

    // 캔버스 크기 업데이트
    const gameCanvas = document.getElementById('game-canvas');
    if (gameCanvas) {
      const rect = gameCanvas.getBoundingClientRect();
      this.particleCanvas.width = rect.width;
      this.particleCanvas.height = rect.height;
    }

    // 클리어
    this.particleCtx.clearRect(
      0,
      0,
      this.particleCanvas.width,
      this.particleCanvas.height
    );

    // 파티클 렌더링
    this.particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      this.particleCtx.save();

      this.particleCtx.globalAlpha = alpha;
      this.particleCtx.fillStyle = particle.color;

      switch (particle.type) {
        case 'spark':
          this.renderSparkParticle(particle);
          break;
        case 'flame':
          this.renderFlameParticle(particle);
          break;
        case 'water':
          this.renderWaterParticle(particle);
          break;
        case 'leaf':
          this.renderLeafParticle(particle);
          break;
        case 'stone':
          this.renderStoneParticle(particle);
          break;
        case 'metal':
          this.renderMetalParticle(particle);
          break;
        case 'steam':
          this.renderSteamParticle(particle);
          break;
        case 'wind':
          this.renderWindParticle(particle);
          break;
        case 'seed':
          this.renderSeedParticle(particle);
          break;
        default:
          this.renderDefaultParticle(particle);
      }

      this.particleCtx.restore();
    });
  }

  // 파티클 렌더링 메서드들
  renderSparkParticle(particle) {
    this.particleCtx.beginPath();
    this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.particleCtx.fill();
  }

  renderFlameParticle(particle) {
    this.particleCtx.beginPath();
    this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.particleCtx.fill();

    // 내부 밝은 부분
    this.particleCtx.fillStyle = '#ffed4e';
    this.particleCtx.beginPath();
    this.particleCtx.arc(
      particle.x,
      particle.y,
      particle.size * 0.5,
      0,
      Math.PI * 2
    );
    this.particleCtx.fill();
  }

  renderWaterParticle(particle) {
    this.particleCtx.beginPath();
    this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.particleCtx.fill();

    // 반사 효과
    this.particleCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.particleCtx.beginPath();
    this.particleCtx.arc(
      particle.x - particle.size * 0.3,
      particle.y - particle.size * 0.3,
      particle.size * 0.3,
      0,
      Math.PI * 2
    );
    this.particleCtx.fill();
  }

  renderLeafParticle(particle) {
    this.particleCtx.save();
    this.particleCtx.translate(particle.x, particle.y);
    this.particleCtx.rotate((Date.now() - particle.createdAt) * 0.005);

    this.particleCtx.beginPath();
    this.particleCtx.ellipse(
      0,
      0,
      particle.size,
      particle.size * 1.5,
      0,
      0,
      Math.PI * 2
    );
    this.particleCtx.fill();

    this.particleCtx.restore();
  }

  renderStoneParticle(particle) {
    this.particleCtx.fillRect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size
    );
  }

  renderMetalParticle(particle) {
    this.particleCtx.save();
    this.particleCtx.translate(particle.x, particle.y);
    this.particleCtx.rotate((Date.now() - particle.createdAt) * 0.01);

    this.particleCtx.beginPath();
    this.particleCtx.moveTo(-particle.size, 0);
    this.particleCtx.lineTo(0, -particle.size);
    this.particleCtx.lineTo(particle.size, 0);
    this.particleCtx.lineTo(0, particle.size);
    this.particleCtx.closePath();
    this.particleCtx.fill();

    this.particleCtx.restore();
  }

  renderSteamParticle(particle) {
    const size = particle.size * (2 - particle.life / particle.maxLife);
    this.particleCtx.beginPath();
    this.particleCtx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.particleCtx.fill();
  }

  renderWindParticle(particle) {
    this.particleCtx.strokeStyle = particle.color;
    this.particleCtx.lineWidth = particle.size * 0.5;
    this.particleCtx.beginPath();
    this.particleCtx.moveTo(particle.x - particle.size, particle.y);
    this.particleCtx.lineTo(particle.x + particle.size, particle.y);
    this.particleCtx.stroke();
  }

  renderSeedParticle(particle) {
    this.particleCtx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
  }

  renderDefaultParticle(particle) {
    this.particleCtx.beginPath();
    this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.particleCtx.fill();
  }

  // 승리 애니메이션
  playVictoryAnimation(winners) {
    // 화면 전체에 축하 효과
    this.createCelebrationEffect();

    // 승자 카드 애니메이션
    winners.forEach((winner, index) => {
      setTimeout(() => {
        this.highlightWinnerCard(winner.category);
        this.showNotification(
          `🏆 ${winner.title}: ${winner.name}`,
          'success',
          5000
        );
      }, index * 1500);
    });
  }

  createCelebrationEffect() {
    // 폭죽 효과
    const colors = ['#ffd700', '#ff6b35', '#4fc3f7', '#66bb6a', '#9f7aea'];

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.createParticles(x, y, {
          count: 30,
          color: color,
          size: 6,
          velocity: 8,
          life: 3000,
          type: 'spark',
        });
      }, i * 200);
    }
  }

  highlightWinnerCard(category) {
    const cardId = `${category}-winner`;
    const card = document.getElementById(cardId);
    if (card) {
      card.style.animation = 'winnerHighlight 2s ease-in-out';

      setTimeout(() => {
        card.style.animation = '';
      }, 2000);
    }
  }

  // 화면 전환 애니메이션
  transitionToScreen(fromScreen, toScreen) {
    fromScreen.style.animation = 'fadeOut 0.5s ease-in';

    setTimeout(() => {
      fromScreen.classList.remove('active');
      toScreen.classList.add('active');
      toScreen.style.animation = 'fadeIn 0.8s ease-out';

      setTimeout(() => {
        fromScreen.style.animation = '';
        toScreen.style.animation = '';
      }, 800);
    }, 500);
  }

  // 정리
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    if (this.particleCanvas && this.particleCanvas.parentNode) {
      this.particleCanvas.parentNode.removeChild(this.particleCanvas);
    }

    if (this.notificationContainer && this.notificationContainer.parentNode) {
      this.notificationContainer.parentNode.removeChild(
        this.notificationContainer
      );
    }
  }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes screenFlash {
        0% { opacity: 0; }
        50% { opacity: var(--intensity, 0.1); }
        100% { opacity: 0; }
    }
    
    @keyframes floatingText {
        0% { 
            opacity: 1; 
            transform: translateY(0px) scale(1);
        }
        50% {
            transform: translateY(-30px) scale(1.2);
            opacity: 1;
        }
        100% { 
            opacity: 0; 
            transform: translateY(-60px) scale(0.8);
        }
    }
    
    @keyframes winnerHighlight {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }
        50% { 
            transform: scale(1.05);
            box-shadow: 0 20px 60px rgba(255, 215, 0, 0.6);
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;

document.head.appendChild(style);

// 전역 UI 컨트롤러 인스턴스 생성
window.UIController = new UIController();
