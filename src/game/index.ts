import { AUTO, Game } from 'phaser';

// General
import { canvas } from '@/game/constants';

// Scenes
import { Preloader } from '@/game/scenes/Preloader';
import Battle from '@/game/scenes/Battle';
import TestScene from '@/game/scenes/Test';
import { MainScene } from '@/game/scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  width: canvas.width,
  height: canvas.height,
  backgroundColor: '#000',
  canvasStyle: `display:block; image-rendering: pixelated; transform-origin: top left;`,
  scene: [
    Preloader,
    MainScene,
    TestScene,
    Battle
  ],
};

const StartGame = (parent: string) => {
  const customConfig = {...config }
  
  return new Game({ ...customConfig, parent });
};

export default StartGame;