import { useState } from 'react'
//import 'destyle.css'
import { Scanner } from './lib/Scanner'

function App() {
  const [codes, setCodes] = useState<string[]>([])

  return (
    <>
      <h1>REACT QRCODE READER (REQR)</h1>
      
        <Scanner onReadCode={(result) => setCodes((codes) => Array.from(new Set([...codes, result.getText()])))} />
        <div>{codes.join('\n')}</div>
        <button type='button'>コピー</button>
      
    </>
  )
}

export default App
