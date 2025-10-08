import Console from '@/components/Console'
import './App.css'
// import ARScene from '@/components/ARScene'

function App() {
  return (
    <>
      <Console>
        <div style={{
          width: 'calc(72vw)',
          height: 'calc(72vw)'
        }}>
          content here
        </div>
      </Console>
      {/* <ARScene objectId={"example"} /> */}
    </>
  )
}

export default App
