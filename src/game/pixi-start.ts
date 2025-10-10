// import { Application } from 'pixi.js';
// import { canvas } from '@/game/constants';

// const config = {
//   background: '#000',
//   width: canvas.width * 2,
//   height: canvas.height * 2,
// };

// const canvasStyle = [
//   'display:block',
//   'image-rendering: pixelated',
//   'transform: scale(0.5)',
//   'transform-origin: top left'
// ];

// const InitGame = async(containerElem: HTMLDivElement) => {
//   const app = new Application();
//   await app.init(config);
//   app.canvas.setAttribute('style', canvasStyle.join(';'));

//   containerElem.appendChild(app.canvas);

//   return app;
// }

// export default InitGame;