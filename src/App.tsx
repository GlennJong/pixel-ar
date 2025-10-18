import Console from '@/components/Console'
import Wrapper from '@/components/Wrapper';
import GameScene from '@/components/GameScene';
import { EventBus } from '@/game/EventBus';
import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const [inputs, setInputs] = useState<string[]>([]);

  useEffect(() => {
    if (inputs.length < 9) return;
    if (inputs.slice(-9).join('') === '^^vv<><>B') {
      EventBus.emit('game-preinput-secret-mode');
    }
    else if (inputs.slice(-10).join('') === '^^vv<><>BA') {
      EventBus.emit('game-input-secret-mode');
    }
    else {
      EventBus.emit('game-cancel-secret-mode');
    }
  }, [inputs])
  
  return (
    <Wrapper>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        height: '100%',
        margin: 'auto',
        overflow: 'hidden',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
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
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '0',
              paddingBottom: '90%',
            }}>
              <GameScene />
            </div>
          </div>
        </Console>
      </div>
    </Wrapper>
  )
}

export default App
