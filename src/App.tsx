import { useState } from 'react'
//import 'destyle.css'
import {onReadCodeHandler } from './components/Scanner/Scanner'
import {Scanner} from './components/Scanner'

function App() {
  const [codes, setCodes] = useState<string[]>([])

  const onReadCode:onReadCodeHandler = (result) => {
    setCodes((codes) => Array.from(new Set([...codes, result.getText()])))
    navigator.vibrate(100)
  }

  return (
    <>
      
      <Scanner onReadCode={onReadCode} />
      <h1>REACT QRCODE READER (REQR)</h1>
      
      <div>{codes.join('\n')}</div>
      <button type='button'>コピー</button>
      
    </>
  )
}

export default App
