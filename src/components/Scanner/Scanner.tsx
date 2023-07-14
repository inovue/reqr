import {BrowserMultiFormatReader} from '@zxing/browser'
import { Result } from '@zxing/library'
import { ChangeEventHandler, useEffect, useMemo, useRef } from 'react'

import Button from '../Button/Button'
import {FaPlay, FaPause, FaTimes, } from 'react-icons/fa'
import { FaRotate } from 'react-icons/fa6'
import {MdFlashlightOn, MdFlashlightOff } from 'react-icons/md'
import { MediaTrackAdvancedConstraints } from '../../types'
import { useVideoInputDevices, useScanner } from '../../hooks'

import Frame from './ScannerFrame'
import { ReactComponent as IconQR } from '../assets/symbols/qr.svg'
import ZoomSlider from '../Input/ZoomSlider'
import RotateButton from '../Button/RotateButton'
import TorchButton from '../Button/TorchButton'

export type OnDecodedHandler = (text: Result|void) => void;
export type OnErrorHandler = (error: Error) => void;
export type ScannerOptions = {
  scanDelay?:number;
  timeout?:number;
  fps?:number;
}

export type ScannerProps = {
  onDecoded?: OnDecodedHandler;
  onError?: OnErrorHandler;
  options?:ScannerOptions;
}

export const Scanner = ({ closable=true, timeout=30000, interval=500, scale=0.5, onDecoded, onDecodeError }: ScannerProps) => {
  
  return (
    <div style={{ position:'relative', width:"100%", height:'90dvh', backgroundColor:'#333'}}>
        <div style={{position:'absolute', right:0, top:0}}>
          <Button><FaTimes /></Button>
        </div>
        <div style={{position:'absolute', left:'50%', right:'50%', top:'24px', transform: 'translate(-50%, -50%)', width:'180px' }} >
          <ZoomSlider controller={controller}/>
        </div>
        <div style={{position:'absolute', left:0, bottom:0, width:'100%' }}>
          <div style={{display:'grid', gridTemplateColumns:'55px 75px 55px', alignItems:'center', justifyContent:'center', justifyItems:'center', gap:'3rem', padding:'.5rem'}}>
            <div>
              {1 < (devices?.length||0) && <RotateButton controller={controller} /> }
            </div>
            <div>
              <Button size='lg' onClick={()=>togglePlay()}>{scannerState==='PLAYING'?<FaPause />:<FaPlay />}</Button>
            </div>
            <div>
              { capabilities?.torch && <TorchButton controller={controller} /> }
            </div>
          </div>
        </div>
      </div>
  )
}
