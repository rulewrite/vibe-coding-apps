import Phaser from 'phaser';
import { GameScene } from './GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: 'rgba(30, 27, 75, 0.1)',
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0.5 },
      debug: false,
      enableSleeping: false,
    },
  },
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
