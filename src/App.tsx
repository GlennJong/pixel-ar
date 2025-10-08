import { useState } from 'react'
import Console from '@/components/Console'
import ARScene from '@/components/ARScene'
import './App.css'

function App() {
  const [ isExtendAR, setIsExtendAR ] = useState(false);
  return (
    <>
    { isExtendAR ?
      <div style={{
        width: '100vw',
        height: '100vh'
      }}>
        <ARScene objectId={"example"} />
      </div>
      :
      <Console
        onClickSelect={() => setIsExtendAR(!isExtendAR)}
      >
        <div style={{
          width: '100vw',
          height: '100vw'
        }}>
          <ARScene objectId={"example"} />
        </div>
      </Console>
    }
    </>
  )
}

export default App
