import Phaser from "phaser";

export function runTween<T>(
  obj: { scene: Phaser.Scene } & T,
  options: { [key: string]: number },
  duration: number,
  ease?: (num: number) => number,
): Promise<void> | undefined {
  const { scene } = obj;
  if (scene) {
    const data = {
      targets: obj,
      repeat: 0,
      duration,
      ...options,
    };

    if (ease) {
      data.ease = ease;
    }

    let tween: Phaser.Tweens.BaseTween | undefined = obj.scene.tweens.add({
      ...data,
      onUpdate: () => {
        // 強制將 x/y 取整數，避免 subpixel rendering
        if ('x' in obj && typeof obj['x'] === 'number') obj['x'] = Math.round(obj['x']);
        if ('y' in obj && typeof obj['y'] === 'number') obj['y'] = Math.round(obj['y']);
        // scale 取小數第二位，避免 subpixel scale 造成鋸齒或黑邊
        if ('scale' in obj && typeof obj['scale'] === 'number') obj['scale'] = Math.round(obj['scale'] * 100) / 100;
        if ('scaleX' in obj && typeof obj['scaleX'] === 'number') obj['scaleX'] = Math.round(obj['scaleX'] * 100) / 100;
        if ('scaleY' in obj && typeof obj['scaleY'] === 'number') obj['scaleY'] = Math.round(obj['scaleY'] * 100) / 100;
      },
    });

    return new Promise((resolve) => {
      if (!tween) {
        resolve();
        return;
      }
      tween.once("complete", () => {
        if (tween) {
          tween.remove();
          tween = undefined;
        }
        resolve();
      });
    });
  }
}
