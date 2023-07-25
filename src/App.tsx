import { useState } from 'react'

import { OnDecodedHandler } from './hooks/useScanner';

import {BarCodeScanner} from './components/complete/BarCodeScanner'

// import {BarCodeScanner} from '../dist/index'
// import '../dist/style.css'

function App() {
  const [codes, setCodes] = useState<string[]>([])

  const onDecodedHandler:OnDecodedHandler = (result) => {
    result && setCodes((codes) => Array.from(new Set([...codes, result.getText()])));
    navigator.vibrate(100);
  }

  return (
    <>
      <BarCodeScanner onDecoded={onDecodedHandler}/>
      <h1>REACT QRCODE READER (REQR)</h1>
      <h2>Results</h2>
      <p>{codes.join('\n')}</p>
    </>
  )
}

export default App
