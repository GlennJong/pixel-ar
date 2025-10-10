
import { useEffect, useRef } from 'react';
import StartGame from '@/game';
import './style.css';


const GameScene = () => {
  const gameCoreRef = useRef<Phaser.Game>(null);

  useEffect(() => {
    gameCoreRef.current = StartGame('game-container');
    gameCoreRef.current.canvas.style.width = '100vw';
    gameCoreRef.current.canvas.style.height = '90vw';
    return () => {
      if (gameCoreRef.current) {
        gameCoreRef.current.destroy(true);
      }
    }
  }, []);

  
  return (
    <div id="game-container"></div>
  );
}

export default GameScene;