import { useMemo } from 'react'
import ZoomSlider from '../Input/ZoomSlider'
import RotateButton from '../Button/RotateButton'
import TorchButton from '../Button/TorchButton'
import PlayButton from '../Button/PlayButton'
import { UseScannerProps, useScanner } from '../../hooks/useScanner'
import ScannerCore from './ScannerCore'
import ScannerFrame from './ScannerFrame'


export const Scanner = (props: UseScannerProps) => {
  const controller = useScanner(props);
  
  const canZoom = useMemo(()=> controller.capabilities?.zoom, [controller.capabilities?.zoom]);
  const canTorch = useMemo(()=> controller.capabilities?.torch, [controller.capabilities?.torch]);
  const isMultiDevices = useMemo(()=> 1 < (controller.devices?.length||0), [controller.devices?.length]);

  return (
    <>
    <div style={{ position:'relative', width:"100%", height:'90dvh', backgroundColor:'#333'}}>
      <ScannerCore controller={controller} />
      <ScannerFrame controller={controller} />
      
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
