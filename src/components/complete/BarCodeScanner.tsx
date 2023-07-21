import { useMemo } from 'react'

import FormatSelect from '../assemble/FormatSelect'
import PlayButton from '../assemble/PlayButton'
import RotateButton from '../assemble/RotateButton'
import ScannerCore from '../assemble/ScannerCore'
import TorchButton from '../assemble/TorchButton'
import ZoomSlider from '../assemble/ZoomSlider'

import { UseScannerProps, useScanner } from '../../hooks/useScanner'


export const Scanner = (props: UseScannerProps) => {
  const controller = useScanner(props);
  
  const canZoom = useMemo(()=> controller.capabilities?.zoom, [controller.capabilities?.zoom]);
  const canTorch = useMemo(()=> controller.capabilities?.torch, [controller.capabilities?.torch]);
  const isMultiDevices = useMemo(()=> 1 < (controller.devices?.length||0), [controller.devices?.length]);

  return (
    <>
    <div style={{ position:'relative', width:"100%", height:'90dvh', backgroundColor:'#333'}}>
      <ScannerCore controller={controller} />
      
      <div style={{position:'absolute', left:0, top:0}} >
        <FormatSelect controller={controller} />  
      </div>
      {canZoom && 
        <div style={{position:'absolute', left:'50%', right:'50%', top:'24px', transform: 'translate(-50%, -50%)', width:'180px' }} >
          <ZoomSlider controller={controller}/>
        </div>
      }
      <div style={{position:'absolute', left:0, bottom:0, width:'100%' }}>
        <div style={{display:'grid', gridTemplateColumns:'55px 75px 55px', alignItems:'center', justifyContent:'center', justifyItems:'center', gap:'3rem', padding:'.5rem'}}>
          <div>
            { isMultiDevices && <RotateButton controller={controller} /> }
          </div>
          <div>
            <PlayButton controller={controller} />
          </div>
          <div>
            { canTorch && <TorchButton controller={controller} /> }
          </div>
        </div>
      </div>
      
    </div>
    <small style={{fontSize:'6pt', whiteSpace:'pre-wrap'}}>{JSON.stringify(controller.devices, null, 2)}</small>
    <small style={{fontSize:'6pt', whiteSpace:'pre-wrap'}}>{JSON.stringify(controller.capabilities, null, 2)}</small>

    </>
  )
}
