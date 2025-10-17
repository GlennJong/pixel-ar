
import { useEffect, useRef } from 'react';
import StartGame from '@/game';
import './style.css';


const GameScene = () => {
  const gameCoreRef = useRef<Phaser.Game>(null);

  useEffect(() => {
    gameCoreRef.current = StartGame('game-container');
    gameCoreRef.current.canvas.style.width = '100%';
    gameCoreRef.current.canvas.style.height = '100%';
    return () => {
      if (gameCoreRef.current) {
        gameCoreRef.current.destroy(true);
      }
    }
  }, []);

  
  return (
    <div
      id="game-container"
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        background: '#fff',
        width: '100%',
        height: '100%',
      }}
    ></div>
  );
}

export default GameScene;