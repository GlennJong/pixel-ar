import { useEffect, useRef } from 'react';
// import 'aframe';
// import 'mind-ar/dist/mindar-image-aframe.prod.js';

const ARScene = ({ objectId }: { objectId: string}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const targetAssetUrl = `./assets/${objectId}_photo.svg`;
  const mindAssetUrl = `/assets/${objectId}_mind.mind`;
  
  useEffect(() => {
    if (!containerRef.current) return;

    const uiAttrs = [
      'uiLoading:no',
      'uiScanning:#example-scanning-overlay;'
    ];

    const sensitiveAttrs = [
      'autoStart:true',
      'filterMinCF:0.001',
      'missTolerance:20',
      'filterBeta:20',
      'warmupTolerance:5'
    ]

    const arSceneHTML = `
      <a-scene mindar-image="imageTargetSrc:${mindAssetUrl}; ${[...uiAttrs, ...sensitiveAttrs].join(';')}" color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
        <a-assets>
          <img id="card" src="${targetAssetUrl}" />
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity mindar-image-target="targetIndex: 0">
          <a-image src="#card" position="0 0.3 0" height="1" width="1" rotation="90 0 0"></a-plane>
        </a-entity>
      </a-scene>
    `;

    if (containerRef.current) {
      containerRef.current.innerHTML = arSceneHTML;
      // containerRef.current.innerHTML = test;

      // script.src = 'https://cdn.jsdelivr.net/npm/mindar-image-aframe@1.2.2/dist/mindar-image-aframe.prod.js';
      // script.async = true;
      // document.body.appendChild(script);
    }

    return () => {
      // document.body.removeChild(script);
      if (containerRef.current) {
        const scene = containerRef.current.querySelector('a-scene');
        if (scene && scene.parentNode) {
            scene.parentNode.removeChild(scene);
        }
      }
    };
  }, [objectId, targetAssetUrl]);

  return (
    <>
      <div id="example-scanning-overlay" className="hidden"></div>
      <div ref={containerRef} className="ar-container" style={{ width: '100%', height: '100%' }}></div>
    </>
  );
};

export default ARScene;



// import React, { useEffect, useRef } from 'react';
// import 'aframe';
// import 'mind-ar/dist/mindar-image-aframe.prod.js';

// export default () => {
//   const sceneRef = useRef(null);

//   useEffect(() => {
//     const sceneEl = sceneRef.current;
//     const arSystem = sceneEl.systems["mindar-image-system"];
//     sceneEl.addEventListener('renderstart', () => {
//       arSystem.start(); // start AR 
//     });
//     return () => {
//       arSystem.stop();
//     }
//   }, []);

//   return (
//     <a-scene ref={sceneRef} mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/card.mind; autoStart: false; uiLoading: no; uiError: no; uiScanning: no;" color-space="sRGB" embedded renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
//       <a-assets>
//         <img id="card" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/card.png" />
//         <a-asset-item id="avatarModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/softmind/scene.gltf"></a-asset-item>
//       </a-assets>

//       <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

//       <a-entity mindar-image-target="targetIndex: 0">
//         <a-plane src="#card" position="0 0 0" height="0.552" width="1" rotation="0 0 0"></a-plane>
//         <a-gltf-model rotation="0 0 0 " position="0 0 0.1" scale="0.005 0.005 0.005" src="#avatarModel" animation="property: position; to: 0 0.1 0.1; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-gltf-model>
//       </a-entity>
//     </a-scene>
//   )
// }