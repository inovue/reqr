import {BrowserMultiFormatReader} from '@zxing/browser'
import { Result } from '@zxing/library'
import { ChangeEventHandler, ReactEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { RadioButtonGroup } from '../RadioButtonGroup/RadioButtonGroup'

import Button from '../Button'
import {FaPlay, FaPause, FaStop, FaTimes, } from 'react-icons/fa'
import { FaRotate } from 'react-icons/fa6'
import {MdFlashlightOn, MdFlashlightOff } from 'react-icons/md'

export type ScannerProps = {
  timeout?:number,
  interval?:number,
  
  scale?:number;
  constraints?:MediaStreamConstraints;
  onReadCode?: (text: Result) => void;
}

export type VideoState = 'playing' | 'paused' | 'stopped'

export const Scanner = ({ timeout=30000, interval=500, scale=0.5, onReadCode }: ScannerProps) => {
  
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), [])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const [devices, setDevices] = useState<MediaDeviceInfo[]>()
  const [deviceId, setDeviceId] = useState<string>()
  
  const [videoState, setVideoState] = useState<VideoState>();
  const isPlaying = useMemo(()=>videoState === 'playing', [videoState]);
  const isPaused = useMemo(()=>videoState === 'paused', [videoState]);
  const isStopped = useMemo(()=>videoState === 'stopped', [videoState]);
  
  const mediaStream = useMemo(()=>{
    if(videoRef.current && videoRef.current.srcObject instanceof MediaStream){
      return videoRef.current.srcObject;
    }
  }, [videoRef.current?.srcObject]);
  const mediaStreamTrack = useMemo(()=> mediaStream?.getTracks()?.[0], [mediaStream]);

  const capabilities = useMemo(()=> mediaStreamTrack?.getCapabilities(), [mediaStreamTrack]);
  const constraints = useMemo(()=> mediaStreamTrack?.getConstraints(), [mediaStreamTrack]);
  const [trackSetting, setTrackSetting] = useState<MediaTrackSettings>();

  const scanInterval = useRef<number>(0);
  const stopTimeout = useRef<number>(0);

  useEffect(()=>{
    (async () => {
      const [devices, ms] = await Promise.all([
        BrowserMultiFormatReader.listVideoInputDevices(),
        navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
      ])
      setDevices(()=>devices);
      setDeviceId(()=>ms.getVideoTracks()?.[0].getSettings().deviceId);
    })();
  }, []);

  useEffect(()=>{
    playVideo();

    return () => {
      stopVideo();
    };
  },[deviceId]);

  useEffect(()=>{
    if(isPlaying){
      scanInterval.current = window.setInterval(()=>{scanFrame();}, interval);
      stopTimeout.current = window.setTimeout(()=>{stopVideo();}, timeout);
    }else{
      window.clearInterval(scanInterval.current);
      window.clearTimeout(stopTimeout.current);
    }
    
    return () => { 
      window.clearInterval(scanInterval.current);
      window.clearTimeout(stopTimeout.current);
    };
  },[isPlaying]);


  
  const playVideo = () => {
    (async () =>{
      if(!videoRef.current) return;
      if(!deviceId) return;
      
      if(!videoRef.current.srcObject){
        videoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({video:{deviceId:deviceId}});
      }
      await videoRef.current.play();

      if(!isPaused) initFrame();
      setVideoState(()=> 'playing');
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
  }
  
  const pauseVideo = () => {
    if(!videoRef.current) return;
    if(isPlaying) videoRef.current.pause();
    setVideoState(()=> 'paused');
  }
  const stopVideo = () => {
    if(videoRef.current && videoRef.current.srcObject instanceof MediaStream){
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setVideoState(()=> 'stopped');
    }
  }
  const toggleVideo = () => {
    !isPlaying ? playVideo() : pauseVideo();
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
      if(blob === null) return;
      const url = URL.createObjectURL(blob)
      codeReader.decodeFromImageUrl(url).then(found)
    })
  }

  const toggleDeviceId = () => {
    if(!deviceId) return;
    if(!devices || devices.length <= 1) return;
    
    const index = devices.findIndex(d=>d.deviceId === deviceId);
    const nextIndex = index + 1 >= devices.length ? 0 : index + 1;
    setDeviceId(()=>devices[nextIndex].deviceId);
  }

  const toggleTorch = () => {
    if(!mediaStreamTrack) return;
    applyConstraints({advanced:[{torch:!mediaStreamTrack.getSettings().torch}]});
  }
  const onChangeZoom: ChangeEventHandler<HTMLInputElement> = (e) => {
    applyConstraints({advanced:[{zoom:parseFloat(e.target.value)}]});
  }
  const applyConstraints = async (constraints:MediaTrackConstraints) => {
    if(!mediaStreamTrack) return;
    await mediaStreamTrack.applyConstraints(constraints);
    setTrackSetting(()=>mediaStreamTrack?.getSettings())
  }


  const found = (result:Result) => {
    console.log(result)
    onReadCode?.(result)
  }

  return (
    <>
      <RadioButtonGroup 
        options={devices?.map(d=>({label:d.label, value:d.deviceId})) || []}
        value={deviceId} 
        onChange={e=>setDeviceId(()=>e.target.value)}
      />
      <p>videoState:{videoState}</p>
      <p style={{wordSpacing:'pre'}}>{JSON.stringify(capabilities, null, 2)}</p>
      <p style={{wordSpacing:'pre'}}>{JSON.stringify(trackSetting, null, 2)}</p>

      <div style={{ position:'relative', width:"100%", height:'300px', backgroundColor:'#333'}}>
        <video ref={videoRef} style={{ width:'auto', maxWidth:'100%', height:'100%', position:'absolute', margin:'auto', left:0, right:0 }} playsInline />
        <div ref={frameRef} style={{ border: 'dashed red', position:'absolute', margin:'auto', left:0, right:0, top:0, bottom:0 }} />
        

        <div style={{position:'absolute', left:0, top:0, width:'100%', }}>
          <div style={{display:'flex', alignItems:'center', padding:'.5rem'}}>
            <div style={{flex:1, padding:'0 3rem'}}>
              {(capabilities && 'zoom' in capabilities) && 
                <input type="range" id="zoom" name="zoom" 
                  min={capabilities?.['zoom']['min']} 
                  max={capabilities?.['zoom']['max']} 
                  step={capabilities?.['zoom']['step']} 
                  value={trackSetting?.['zoom']} 
                  onChange={onChangeZoom} 
                  style={{width:'100%'}}
                />
              }
            </div>
            {!isStopped && <Button onClick={() => stopVideo()}><FaTimes /></Button>}
          </div>
        </div>
        <div style={{position:'absolute', left:0, bottom:0, width:'100%' }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'3rem', padding:'.5rem'}}>
            <Button onClick={()=>toggleDeviceId()} ><FaRotate /></Button>
            <Button size='lg' onClick={()=>toggleVideo()}>{isPlaying?<FaPause />:<FaPlay />}</Button>
            
            {(capabilities && 'torch' in capabilities) && 
              <Button onClick={()=>toggleTorch()}>{trackSetting?.['torch'] ? <MdFlashlightOff/> : <MdFlashlightOn/> }</Button>
            }
          </div>
        </div>
      </div>
      
      <canvas style={{ width:'100%' }}  ref={canvasRef} />
    </>
  )
}
