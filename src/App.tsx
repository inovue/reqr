import { useState } from 'react'
//import 'destyle.css'
import {OnDecodedHandler} from './components/Scanner'
import {Scanner} from './components/Scanner'

function App() {
  const [codes, setCodes] = useState<string[]>([])

  const onDecodedHandler:OnDecodedHandler = (result) => {
    result && setCodes((codes) => Array.from(new Set([...codes, result.getText()])));
    navigator.vibrate(100);
  }

  return (
    <>
      
      <Scanner onDecoded={onDecodedHandler} />
      <h1>REACT QRCODE READER (REQR)</h1>
      
      <div>{codes.join('\n')}</div>
      <button type='button'>コピー</button>
      
    </>
  )
}

export default App
