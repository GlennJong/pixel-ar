import Console from '@/components/Console'
import Wrapper from '@/components/Wrapper';
import GameScene from '@/components/GameScene';
import { EventBus } from '@/game/EventBus';
import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const [inputs, setInputs] = useState<string[]>([]);

  useEffect(() => {
    if (inputs.length < 10) return;
    if (inputs.join('') === '^^vv<><>BA') {
      // EventBus.emit('game-secret-mode');
    }
  }, [inputs])
  
  return (
    <Wrapper>
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <Console
          onClick={(key) => {
            if (key === 'up') {
              EventBus.emit('game-up-keydown');
              setInputs([...inputs, '^'].slice(-10));
            }
            else if (key === 'down') {
              EventBus.emit('game-down-keydown');
              setInputs([...inputs, 'v'].slice(-10));
            }
            else if (key === 'left') {
              setInputs([...inputs, '<'].slice(-10));
            }
            else if (key === 'right') {
              setInputs([...inputs, '>'].slice(-10));
            }
            else if (key === 'A') {
              EventBus.emit('game-select-keydown');
              setInputs([...inputs, 'A'].slice(-10));
            }
            else if (key === 'B') {
              setInputs([...inputs, 'B'].slice(-10));
            }
          }}
        >
          <div style={{
            width: '100vw',
            height: '90vw'
          }}>
            <GameScene />
          </div>
        </Console>
      </div>
    </Wrapper>
  )
}

export default App
