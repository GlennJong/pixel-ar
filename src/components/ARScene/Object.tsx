import React, { useEffect, useRef } from 'react';

const Object = ({ targetAssetUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const arSceneHTML = `
      <a-scene embedded arjs='sourceType: webcam; trackingMethod: best; debugUIEnabled: false;'>
        
        <a-assets>
            <img id="render-png" src="${targetAssetUrl}">
        </a-assets>

        <a-marker type='pattern' url='assets/qrcode.patt'>
            
            <a-image 
                src="#render-png"
                width="1.5" height="1.0" 
                position="0 0 0.01"
                rotation="-90 0 0">
            </a-image>

        </a-marker>
        
        <a-entity camera></a-entity>
      </a-scene>
    `;

    if (containerRef.current) {
      containerRef.current.innerHTML = arSceneHTML;
    }

    return () => {
      if (containerRef.current) {
        const scene = containerRef.current.querySelector('a-scene');
        if (scene && scene.parentNode) {
            scene.parentNode.removeChild(scene);
        }
      }
    };
  }, [targetAssetUrl]);

  return <div ref={containerRef} className="ar-container" style={{ width: '100vw', height: '100vh' }} />;
};

export default Object;