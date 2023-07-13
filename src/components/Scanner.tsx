import {BrowserMultiFormatReader} from '@zxing/browser'
import { Result } from '@zxing/library'
import { ChangeEventHandler, useEffect, useMemo, useRef } from 'react'

import Button from './Button'
import {FaPlay, FaPause, FaTimes, } from 'react-icons/fa'
import { FaRotate } from 'react-icons/fa6'
import {MdFlashlightOn, MdFlashlightOff } from 'react-icons/md'
import { MediaTrackAdvancedConstraints } from '../types'
import { useVideoInputDevices, useScanner } from '../hooks'

export type OnDecodedHandler = (text: Result|void) => void;
export type OnDecodeErrorHandler = (error: Error) => void;

export type ScannerProps = {
  timeout?:number,
  interval?:number,
  closable?:boolean

  scale?:number;
  constraints?:MediaStreamConstraints;
  onDecoded?: OnDecodedHandler;
  onDecodeError?: OnDecodeErrorHandler;
}

const defaultConstraints:MediaTrackConstraints = {facingMode:'environment'}
  
export const Scanner = ({ closable=true, timeout=30000, interval=500, scale=0.5, onDecoded, onDecodeError }: ScannerProps) => {
  
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const devices = useVideoInputDevices();
  
  const {state:scannerState, deviceId, stream, track, capabilities, settings:trackSetting, setSettings} = useScanner(videoRef.current);

  const scanInterval = useRef<number>(0);
  const stopTimeout = useRef<number>(0);

  
  useEffect(()=>{
    if(1 <= (devices?.length ?? 0)) play(videoRef.current, defaultConstraints);
  }, [devices]);
 
  useEffect(()=>{
    window.clearInterval(scanInterval.current);
    window.clearTimeout(stopTimeout.current);
    if(scannerState==='PLAYING'){
      scanInterval.current = window.setInterval(()=>scanFrame(), interval);
      stopTimeout.current = window.setTimeout(()=>stop(videoRef.current), timeout);
    }
    return () => { 
      window.clearInterval(scanInterval.current);
      window.clearTimeout(stopTimeout.current);
    };
  },[scannerState]);


  
  const play = (videoElement:HTMLVideoElement|null, constraints?:MediaTrackConstraints) => {
    (async () =>{
      if(!videoElement) return;
      if(constraints){
        if(videoElement.srcObject) stop(videoElement);
        videoElement.srcObject = await navigator.mediaDevices.getUserMedia({video:constraints});
      }
      await videoElement.play();
      initFrame();
    })()
  }

  const initFrame = () => {
    if(!videoRef.current || !frameRef.current || !canvasRef.current) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    frameRef.current.style.width = `${videoRef.current.clientWidth * scale}px`;
    frameRef.current.style.height = `${videoRef.current.clientHeight * scale}px`;
    //frameRef.current.style.left = `${(window.innerWidth - videoRef.current.clientWidth * scale) / 2}px`;
    //frameRef.current.style.top = `${(window.innerHeight - videoRef.current.clientHeight * scale) / 2}px`;
    
    //canvasRef.current.getContext('2d').filter = 'grayscale(80%) brightness(1.5)';
  }
  
  const pause = (videoElement:HTMLVideoElement|null) => {
    if(!videoElement) return;
    if(!videoElement.paused) videoElement.pause();
  }
  const stop = (videoElement:HTMLVideoElement|null) => {
    if(!videoElement) return;
    if(videoElement.srcObject instanceof MediaStream){
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    videoElement.srcObject = null;
  }
  const togglePlay = () => {
    switch(scannerState){
      case 'PLAYING':
        pause(videoRef.current); break;
      case 'PAUSED':
        play(videoRef.current); break;
      default:
        play(videoRef.current, deviceId ? {deviceId:deviceId} : defaultConstraints); break;
    }
  }

  const scanFrame = () => {
    if (canvasRef.current === null || videoRef.current === null ) return;
    
    canvasRef.current.getContext('2d')?.drawImage(
      videoRef.current,
      // source x, y, w, h:
      (videoRef.current.videoWidth - videoRef.current.videoWidth * scale) / 2,
      (videoRef.current.videoHeight - videoRef.current.videoHeight * scale) / 2,
      videoRef.current.videoWidth * scale,
      videoRef.current.videoHeight * scale,
      // dest x, y, w, h:
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    )
    // convert the canvas image to an image blob and stick it in an image element
    canvasRef.current.toBlob(blob => {
      if(!blob) return;
      const url = URL.createObjectURL(blob);
      codeReader.decodeFromImageUrl(url).then((result)=>{
        if(!result) return;
        window.clearTimeout(stopTimeout.current);
        stopTimeout.current = window.setTimeout(()=>{stop(videoRef.current);}, timeout);
        onDecoded?.(result);
      }).catch((error)=>{
        onDecodeError?.(error);
      })
    })
  }

  const toggleDevice = () => {
    if(!deviceId) return;
    if(!devices || devices.length <= 1) return;
    
    const index = devices.findIndex(d=>d.deviceId === deviceId);
    const nextIndex = index + 1 >= devices.length ? 0 : index + 1;
    play(videoRef.current, {deviceId:devices[nextIndex].deviceId})
  }

  const toggleTorch = () => {
    if(track && capabilities?.torch) applyConstraints(track, {advanced:[{torch:!trackSetting?.torch}]});
  }
  const onChangeZoom: ChangeEventHandler<HTMLInputElement> = (e) => {
    if(track && capabilities?.zoom) applyConstraints(track, {advanced:[{zoom:parseFloat(e.target.value)}]});
  }
  const applyConstraints = async (mediaStreamTrack:MediaStreamTrack, constraints:MediaTrackAdvancedConstraints) => {
    await mediaStreamTrack.applyConstraints(constraints);
    setSettings(()=>mediaStreamTrack.getSettings() || null)
  }


  return (
    <>
      <p>scannerState:{scannerState}</p>
      <p>deviceId:{deviceId}</p>

      <div style={{ position:'relative', width:"100%", height:'90dvh', backgroundColor:'#333'}}>
        <video ref={videoRef} style={{ width:'auto', maxWidth:'100%', height:'100%', position:'absolute', margin:'auto', left:0, right:0 }} playsInline />
        <div ref={frameRef} style={{visibility:(scannerState==='PLAYING')?'visible':'hidden', border: 'dashed red', position:'absolute', margin:'auto', left:0, right:0, top:0, bottom:0 }} />
        
        {closable && 
          <div style={{position:'absolute', right:0, top:0}}>
            <Button onClick={() => stop(videoRef.current)}><FaTimes /></Button>
          </div>
        }
        { capabilities?.zoom && 
          <div style={{position:'absolute', left:'50%', right:'50%', top:'24px', transform: 'translate(-50%, -50%)', width:'180px' }} >
              <input type="range" id="zoom" name="zoom" 
                min={capabilities.zoom?.min} 
                max={capabilities.zoom?.max} 
                step={capabilities.zoom?.step} 
                value={trackSetting?.zoom} 
                onChange={onChangeZoom} 
                style={{width:'100%'}}
              />
          </div>
        }
        <div style={{position:'absolute', left:0, bottom:0, width:'100%' }}>
          <div style={{display:'grid', gridTemplateColumns:'55px 75px 55px', alignItems:'center', justifyContent:'center', justifyItems:'center', gap:'3rem', padding:'.5rem'}}>
            <div>
              {2 <= (devices?.length||0) && stream && 
                <Button onClick={()=>toggleDevice()} ><FaRotate /></Button>
              }
            </div>
            <div>
              {(scannerState === 'STOPPED' || scannerState === 'PLAYING' || scannerState === 'PAUSED')  &&
                <Button size='lg' onClick={()=>togglePlay()}>{scannerState==='PLAYING'?<FaPause />:<FaPlay />}</Button>
              }
            </div>
            <div>
              { capabilities?.torch &&
                <Button onClick={()=>toggleTorch()}>{trackSetting?.torch ? <MdFlashlightOff/> : <MdFlashlightOn/> }</Button>
              }
            </div>
          </div>
        </div>
      </div>
      
      <canvas style={{ width:'100%', display:'' }}  ref={canvasRef} />
      
      <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(devices, null, 2)}</p>
      
      <p style={{whiteSpace:'pre-wrap'}}>stream: {JSON.stringify(stream?.id, null, 2)}</p>
      <p style={{whiteSpace:'pre-wrap'}}>track: {JSON.stringify(track?.id, null, 2)}</p>
      
      {/*<p style={{whiteSpace:'pre-wrap'}}>capabilities: {JSON.stringify(capabilities, null, 2)}</p>*/}
      <p style={{whiteSpace:'pre-wrap'}}>trackSetting: {JSON.stringify(trackSetting, null, 2)}</p>
      
    </>
  )
}
