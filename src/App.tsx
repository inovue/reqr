import { useState } from 'react'
import {OnDecodedHandler} from './components/Scanner/Scanner.org'
import { useScanner } from './hooks/useScanner'

function App() {
  const [scannerController, Scanner] = useScanner();

  const [codes, setCodes] = useState<string[]>([])

  const onDecodedHandler:OnDecodedHandler = (result) => {
    result && setCodes((codes) => Array.from(new Set([...codes, result.getText()])));
    navigator.vibrate(100);
  }

  return (
    <>
      {Scanner}
      <small style={{whiteSpace:'pre-wrap', fontSize:'6pt'}}>{JSON.stringify(scannerController,null,2)}</small>

      {/*
        <Scanner onDecoded={onDecodedHandler} />
        <h1>REACT QRCODE READER (REQR)</h1>
        
        <div>{codes.join('\n')}</div>
        <button type='button'>コピー</button>
       */}
      
    </>
  )
}

export default App
