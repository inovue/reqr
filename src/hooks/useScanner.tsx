import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { MediaTrackAdvancedCapabilities, MediaTrackAdvancedConstraints, MediaTrackAdvancedSettings, ScannerController, ScannerSizes, ScannerState } from "../types";
import ScannerScreen from "../components/Scanner/ScannerScreen";
import {BrowserMultiFormatReader} from '@zxing/browser'

const eventState:Partial<{[key in keyof HTMLVideoElementEventMap]:ScannerState}> = {
  'play': 'LOADING',
  'playing': 'PLAYING',
  'pause': 'PAUSED',
  'emptied': 'STOPPED',
  'loadedmetadata': 'PLAYING'
}

export type UseScannerOptions = {
  facingMode?:string
}

export const useScanner = (options?:UseScannerOptions):[ScannerController, ReactNode] => {
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
  

  const play = async (constraints?:MediaTrackConstraints) => {
    const video = videoRef.current;
    if(!video) return;
    if(constraints){
      if(video.srcObject) stop();
      video.srcObject = await navigator.mediaDevices.getUserMedia({video:constraints});
    }
    await video.play();
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



  const controller:ScannerController = {
    devices,
    state,
    stream,
    track,
    capabilities,
    constraints,
    settings,
    sizes,
    play,
    pause,
    stop,
    setTorch,
    setZoom,
  }
  const container = ScannerScreen({controller, videoRef, canvasRef})

  return [controller, container]
}

