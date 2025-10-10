import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface PixiSpriteSheetProps {
  jsonUrl: string;
  width?: number;
  height?: number;
  animationSpeed?: number;
  loop?: boolean;
}

const PixiSpriteSheet: React.FC<PixiSpriteSheetProps> = ({
  jsonUrl,
  width = 512,
  height = 512,
  animationSpeed = 0.5,
  loop = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundAlpha: 0 });
    appRef.current = app;
    if (containerRef.current) {
      containerRef.current.appendChild(app.view);
    }

    PIXI.Assets.load(jsonUrl).then((sheet: any) => {
      const textures = Object.values(sheet.textures);
      const anim = new PIXI.AnimatedSprite(textures);
      anim.animationSpeed = animationSpeed;
      anim.loop = loop;
      anim.play();
      anim.x = width / 2;
      anim.y = height / 2;
      anim.anchor.set(0.5);
      app.stage.addChild(anim);
    });

    return () => {
      app.destroy(true, { children: true });
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [jsonUrl, width, height, animationSpeed, loop]);

  return <div ref={containerRef} style={{ width, height }} />;
};

export default PixiSpriteSheet;
