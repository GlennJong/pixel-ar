import { Scene } from 'phaser';

export class MainScene extends Scene {
  constructor() {
    super('MainScene');
  }

  async create() {
    this.scene.start('Battle');
  }

  shutdown() {
  }
}