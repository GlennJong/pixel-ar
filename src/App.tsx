import { useState } from 'react'
import Console from '@/components/Console'
import ARScene from '@/components/ARScene'
import './App.css'
import GameScene from './components/GameScene';
import { EventBus } from './game/EventBus';
import Wrapper from './components/Wrapper';

function App() {
  const [ isExtendAR, setIsExtendAR ] = useState(false);
  const [ isEnableAR, setIsEnableAR ] = useState(false);


  return (
    <Wrapper>
    { isExtendAR ?
      <div style={{
        width: '100vw',
        height: '100vh'
      }}>
        <ARScene objectId={"example"} />
      </div>
      :
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <Console
          onClick={(key) => {
            if (key === 'select') {
              setIsExtendAR(!isExtendAR);
            }
            else if (key === 'up') {
              EventBus.emit('game-up-keydown');
            }
            else if (key === 'down') {
              EventBus.emit('game-down-keydown');
            }
            else if (key === 'A') {
              EventBus.emit('game-select-keydown');
            }

          }}
        >
          <div style={{
            width: '100vw',
            height: '90vw'
          }}>
            { isEnableAR ?
              <ARScene objectId={"example"} />
              :
              <GameScene />
            }
          </div>
        </Console>
      </div>
    }
    {/* <GameScene /> */}
    </Wrapper>
  )
}

export default App
