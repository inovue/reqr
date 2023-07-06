import {BrowserMultiFormatReader} from '@zxing/browser'
import { Result } from '@zxing/library'
import { ReactEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { RadioButtonGroup } from './RadioButtonGroup'


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
  const [currentDevideId, setCurrentDevideId] = useState<string>()
  
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
      setCurrentDevideId(()=>initialDeviceId);
    })();
  }, []);

  useEffect(()=>{
    (async () => { await playVideo(); })();

    return () => { stopVideo(); };
  },[currentDevideId]);

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
    if(!currentDevideId) return;

    if(!isPaused){
      streamRef.current = await navigator.mediaDevices.getUserMedia({video:{deviceId:currentDevideId}});
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
    if(streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if(videoRef.current) videoRef.current.srcObject = null;
    setVideoState(()=> 'stopped');
  }
  const toggleVideo = () => {
    isPaused ? playVideo() : pauseVideo();
  }



  const onClickFrame:ReactEventHandler<HTMLDivElement> = () => {
    toggleVideo();
    console.log('click frame!')
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

  const found = (result:Result) => {
    console.log(result)
    onReadCode?.(result)
  }

  return (
    <>
      <RadioButtonGroup 
        options={devices?.map(d=>({value:d.deviceId, label:d.label}))||[]} 
        value={currentDevideId} 
        onChange={(e)=>setCurrentDevideId(()=>e.target.value)}
      />
      <p>currentDevideId:{currentDevideId}</p>
      <p>videoState:{videoState}</p>
      
      <button onClick={() => stopVideo() }>stop</button>
      <button onClick={() => toggleVideo() }>{isPaused?'Play':'Pause'}</button>
      
      <div style={{ position:'relative', height:'250px', backgroundColor:'#333' }}>
        <video ref={videoRef} style={{ width:'auto', height:'100%', position:'absolute', margin:'auto', left:0, right:0 }} playsInline />
        <div ref={frameRef} style={{ border: 'dashed red', position:'absolute', margin:'auto', left:0, right:0, top:0, bottom:0 }} onClick={onClickFrame} />
      </div>
      <canvas style={{ width:'100%' }}  ref={canvasRef} />
    </>
  )
}
