import Phaser from 'phaser';

export class KeyboardHandler {
  scene: Phaser.Scene;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey?: Phaser.Input.Keyboard.Key;
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onSpace?: () => void;
  
  constructor(scene: Phaser.Scene, { onUp, onDown, onLeft, onRight, onSpace } : {
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onSpace?: () => void
  }) {
    this.scene = scene;
    this.onUp = onUp;
    this.onDown = onDown;
    this.onLeft = onLeft;
    this.onRight = onRight;
    this.onSpace = onSpace;

    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (!this.cursors || !this.spaceKey) return;
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (this.onUp) this.onUp();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      if (this.onDown) this.onDown();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      if (this.onLeft) this.onLeft();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      if (this.onRight) this.onRight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.onSpace) this.onSpace();
    }
  }

  destroy() {
    this.spaceKey?.destroy();
  }
}