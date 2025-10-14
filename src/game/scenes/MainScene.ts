import { Scene } from 'phaser';

export class MainScene extends Scene {
  constructor() {
    super('MainScene');
  }

  async create() {
    this.scene.start('Battle');

    // Pixelated all textures
    Object.values(this.textures.list).forEach((texture) => {
    if (texture && texture.setFilter) {
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  });
  }

  shutdown() {
  }
}