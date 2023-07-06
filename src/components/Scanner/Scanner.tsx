import {BrowserMultiFormatReader} from '@zxing/browser'
import { Result } from '@zxing/library'
import { ReactEventHandler, useEffect, useMemo, useRef, useState } from 'react'
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

export const Scanner = ({ timeout=30000, interval=500, scale=0.5, constraints, onReadCode }: ScannerProps) => {
  
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), [])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream|null>(null)

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDeviceId, setcurrentDeviceId] = useState<string>()
  
  const [videoState, setVideoState] = useState<VideoState>('stopped');
  const isPlaying = useMemo(()=>videoState === 'playing', [videoState]);
  const isPaused = useMemo(()=>videoState === 'paused', [videoState]);
  const isStopped = useMemo(()=>videoState === 'stopped', [videoState]);
  
  const scanInterval = useRef<number>(0);
  const stopTimeout = useRef<number>(0);

  useEffect(()=>{
    (async () => {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(()=>devices);
      
      const initialDeviceId = (await navigator.mediaDevices.getUserMedia(constraints || {video:{facingMode:'environment'}})).getVideoTracks()?.[0].getSettings().deviceId;
      setcurrentDeviceId(()=>initialDeviceId);
    })();
  }, []);

  useEffect(()=>{
    (async () => { await playVideo(); })();

    return () => { stopVideo(); };
  },[currentDeviceId]);

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

  const playVideo = async () => {
    if(!videoRef.current) return;
    if(!currentDeviceId) return;

    if(!isPaused){
      streamRef.current = await navigator.mediaDevices.getUserMedia({video:{deviceId:currentDeviceId}});
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      initCanvas();
      initFrame();
    }else{
      await videoRef.current.play();
    }
    
    setVideoState(()=> 'playing');
  }

  const initCanvas = () => {
    if(!videoRef.current || !canvasRef.current) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
  }
  const initFrame = () => {
    if(!videoRef.current || !frameRef.current) return;
    frameRef.current.style.width = `${videoRef.current.clientWidth * scale}px`;
    frameRef.current.style.height = `${videoRef.current.clientHeight * scale}px`;
    //frameRef.current.style.left = `${(window.innerWidth - videoRef.current.clientWidth * scale) / 2}px`;
    //frameRef.current.style.top = `${(window.innerHeight - videoRef.current.clientHeight * scale) / 2}px`;
  }
  const pauseVideo = () => {
    if(!videoRef.current) return;
    if(!isPlaying) return;
    
    videoRef.current.pause();
    setVideoState(()=> 'paused');
  }
  const stopVideo = () => {
    console.log('stop video');
    if(streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if(videoRef.current) videoRef.current.srcObject = null;
    setVideoState(()=> 'stopped');
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

  const toggleCurrentDeviceId = () => {
    if(!currentDeviceId) return;
    if(devices.length <= 1) return;
    
    const index = devices.findIndex(d=>d.deviceId === currentDeviceId);
    const nextIndex = index + 1 >= devices.length ? 0 : index + 1;
    setcurrentDeviceId(()=>devices[nextIndex].deviceId);
  }

  const found = (result:Result) => {
    console.log(result)
    onReadCode?.(result)
  }

  return (
    <>
      <RadioButtonGroup 
        options={devices?.map(d=>({value:d.deviceId, label:d.label}))||[]} 
        value={currentDeviceId} 
        onChange={(e)=>setcurrentDeviceId(()=>e.target.value)}
      />
      <p>videoState:{videoState}</p>
      
      <div style={{ position:'relative', height:'300px', backgroundColor:'#333' }}>
        <video ref={videoRef} style={{ width:'auto', height:'100%', position:'absolute', margin:'auto', left:0, right:0 }} playsInline />
        <div ref={frameRef} style={{ border: 'dashed red', position:'absolute', margin:'auto', left:0, right:0, top:0, bottom:0 }} />
        
        <div style={{position:'absolute', left:0, top:0, width:'100%', }}>
          <div style={{display:'flex', alignItems:'center', padding:'.5rem'}}>
            <div style={{flex:1, color:'#fff'}}>QRコードを読み取ってください</div>
            {!isStopped && <Button onClick={() => stopVideo()}><FaTimes /></Button>}
          </div>
        </div>
        <div style={{position:'absolute', left:0, bottom:0, width:'100%' }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'3rem', padding:'.5rem'}}>
            <Button onClick={()=>toggleCurrentDeviceId()} ><FaRotate /></Button>
            <Button size='lg' onClick={()=>toggleVideo()}>{isPlaying?<FaPause />:<FaPlay />}</Button>
            <Button><MdFlashlightOn /></Button>
          </div>
        </div>
      </div>
      
      <canvas style={{ width:'100%' }}  ref={canvasRef} />
    </>
  )
}
