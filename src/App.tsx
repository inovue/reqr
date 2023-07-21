import { useState } from 'react'
import {Scanner} from './components/complete/BarCodeScanner'
import { OnDecodedHandler } from './hooks/useScanner';


function App() {
  const [codes, setCodes] = useState<string[]>([])

  const onDecodedHandler:OnDecodedHandler = (result) => {
    result && setCodes((codes) => Array.from(new Set([...codes, result.getText()])));
    navigator.vibrate(100);
  }

  return (
    <>
      <Scanner onDecoded={onDecodedHandler}/>
      <h1>REACT QRCODE READER (REQR)</h1>
      <h2>Results</h2>
      <p>{codes.join('\n')}</p>
    </>
  )
}

export default App
