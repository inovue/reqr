import { useEffect, useMemo, useRef, useState } from "react";
import { MediaTrackAdvancedCapabilities, MediaTrackAdvancedConstraints, MediaTrackAdvancedSettings, ScannerController, ScannerSizes, ScannerState } from "../types";
import {BrowserMultiFormatReader} from '@zxing/browser'
import { Result } from "@zxing/library";
import { min } from "../utils";

const eventState:Partial<{[key in keyof HTMLVideoElementEventMap]:ScannerState}> = {
  'play': 'LOADING',
  'playing': 'PLAYING',
  'pause': 'PAUSED',
  'emptied': 'STOPPED',
  'loadedmetadata': 'PLAYING'
}

export type OnDecodedHandler = (text: Result|void) => void;
export type OnErrorHandler = (error: Error) => void;
export type UseScannerOptions = {
  prefix:string;
  facingMode:string;
  scanDelay:number;
  timeout:number;
  frameRate:number;
  disableArea: number;
}
export type UseScannerProps = {
  onDecoded: OnDecodedHandler;
  onError?: OnErrorHandler;
  options?:UseScannerOptions;
}

const defaultOptions: UseScannerOptions ={
  prefix:'reqr',
  facingMode:'environment',
  scanDelay:1000,
  timeout:30000,
  frameRate:200,
  disableArea:0.2
};

export const useScanner = (props:UseScannerProps):ScannerController => {
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

  const options = {...defaultOptions, ...props.options};

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]|null>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [state, setState] = useState<ScannerState|null>(null);
  const track = useMemo(()=> stream?.getTracks()?.[0] || null, [stream]);
  const capabilities = useMemo(()=> track?.getCapabilities() as (MediaTrackAdvancedCapabilities|null) || null, [track]);
  const constraints = useMemo(()=> track?.getConstraints() as (MediaTrackAdvancedConstraints|null) || null, [track]);
  const [settings, setSettings] = useState<MediaTrackAdvancedSettings|null>(null);
  const [sizes, setSizes] = useState<ScannerSizes|null>(null);
  
  const scanInterval = useRef<number>(0);
  const stopTimeout = useRef<number>(0);

  const play = async (constraints?:MediaTrackConstraints) => {
    const video = videoRef.current;
    if(!video) return;
    if(constraints){
      if(video.srcObject) stop();
      video.srcObject = await navigator.mediaDevices.getUserMedia({video:constraints});
    }
    await video.play();
    initCanvas();
  }

  const pause = () => {
    const video = videoRef.current;
    if(!video) return;
    if(video.paused) return;
    video.pause();
  }

  const stop = () => {
    const video = videoRef.current;
    if(!video) return;
    if(video.srcObject instanceof MediaStream){
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
  }

  const scanFrame = () => {
    const aspectRatio = 4/3

    if (canvasRef.current === null || videoRef.current === null ) return;
    const {videoWidth, videoHeight} = videoRef.current;
    const {width, height} = ((v)=>({width:v*disable, height:v*aspectRatio}))(min(videoWidth, videoHeight))
    

    canvasRef.current.getContext('2d')?.drawImage(
      videoRef.current,
      // source x, y, w, h:
      (videoWidth - videoWidth * options.disableArea) / 2,
      (videoHeight - videoHeight * options.disableArea) / 2,
      videoRef.current.videoWidth * scale,
      videoRef.current.videoHeight * scale,
      // dest x, y, w, h:
      0, 0, canvasRef.current.width, canvasRef.current.height
    )
    
    canvasRef.current.toBlob(blob => {
      if(!blob) return;
      codeReader.decodeFromImageUrl(URL.createObjectURL(blob)).then((result)=>{
        if(!result) return;
        window.clearTimeout(stopTimeout.current);
        stopTimeout.current = window.setTimeout(()=>stop(), props.options?.timeout);
        props.onDecoded?.(result);
      }).catch((error:Error)=>{
        props.onError?.(error);
      })
    })
  }
  
  const initCanvas = () => {
    if(!videoRef.current || !canvasRef.current) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
  }


  const setTorch = async (value:boolean) => {
    if(!track) return;
    if(!capabilities?.torch) return;
    await applyAdvancedConstraints(track, {advanced:[{torch:value}]});
  }
  const setZoom = async (value:number) => {
    if(!track) return;
    if(!capabilities?.zoom) return;
    await applyAdvancedConstraints(track, {advanced:[{zoom:value}]});
  }
  const applyAdvancedConstraints = async (track:MediaStreamTrack, constraints:MediaTrackAdvancedConstraints) => {
    await track.applyConstraints(constraints);
    setSettings(()=>track.getSettings() || null)
  }
  
  useEffect(() => {
    const video = videoRef.current;
    console.log(video)
    if(!video) return;

    (async () => {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(()=>videoInputDevices);
      if(videoInputDevices.length < 1)throw new Error("No video input devices available");
      await play({facingMode:options?.facingMode || 'environment'});
    })().catch((error:Error)=>{
      console.error(error);
    });

    const handleSrcObjectChange:EventListener = (event) => {
      console.log("useScanner", event.type, video.srcObject);
      const srcObject = video.srcObject as MediaStream|null;
      setStream(()=>srcObject);
      setSettings(()=>srcObject?.getTracks()?.[0].getSettings() || null);
      setState(()=>eventState?.[event.type]);
    };
    
    const handleResize:EventListener = () => {
      setSizes(()=>({
        video:{ width:video.videoWidth,  height:video.videoHeight },
        client:{ width:video.clientWidth, height:video.clientHeight }
      }));
    }

    video.addEventListener('play', handleSrcObjectChange);
    video.addEventListener('playing', handleSrcObjectChange);
    video.addEventListener('pause', handleSrcObjectChange);
    video.addEventListener('emptied', handleSrcObjectChange);
    video.addEventListener('loadedmetadata', handleSrcObjectChange);
    video.addEventListener('resize', handleResize);
    
    return () => {
      video.removeEventListener('play', handleSrcObjectChange);
      video.removeEventListener('playing', handleSrcObjectChange);
      video.removeEventListener('pause', handleSrcObjectChange);
      video.removeEventListener('emptied', handleSrcObjectChange);
      video.removeEventListener('loadedmetadata', handleSrcObjectChange);
      video.removeEventListener('resize', handleResize);
    };
  }, [videoRef]);

  
  useEffect(()=>{
    window.clearInterval(scanInterval.current);
    window.clearTimeout(stopTimeout.current);
    if(state==='PLAYING'){
      scanInterval.current = window.setInterval(()=>scanFrame(), options.frameRate || 100);
      if(options?.timeout){
        stopTimeout.current = window.setTimeout(()=>stop(), options.timeout);
      }
    }
    return () => { 
      window.clearInterval(scanInterval.current);
      window.clearTimeout(stopTimeout.current);
    };
  },[state]);



  const controller:ScannerController = {
    videoRef,
    canvasRef,
    devices,
    state,
    stream,
    track,
    capabilities,
    constraints,
    settings,
    sizes,
    options,

    play,
    pause,
    stop,
    setTorch,
    setZoom,
  }

  return controller
}

