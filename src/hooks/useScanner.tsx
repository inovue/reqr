import { useEffect, useMemo, useRef, useState } from "react";
import { MediaTrackAdvancedCapabilities, MediaTrackAdvancedConstraints, MediaTrackAdvancedSettings, ScannerController, ScannerSizes, ScannerState } from "../types";
import {BrowserMultiFormatReader} from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, Result } from "@zxing/library";
import { Size } from "../utils";
import type {SupportedFormat} from '../types';
import { formatSettings } from "../constants/constants";
import useInterval from "./useInterval";
import useTimeout from "./useTimeout";

const eventStateMap = new Map<keyof HTMLVideoElementEventMap, ScannerState>([
  ['play', 'LOADING'],
  ['playing', 'PLAYING'],
  ['pause', 'PAUSED'],
  ['emptied', 'STOPPED'],
  ['loadedmetadata', 'PLAYING']
]);


export type OnDecodedHandler = (text: Result|void) => void;
export type OnErrorHandler = (error: Error) => void;
export type UseScannerOptions = {
  formats: SupportedFormat[];
  prefix:string;
  facingMode:string;
  scanDelay:number;
  timeout:number;
  frameRate:number;
  scanAreaEdgeRatio: number;
}
export type UseScannerProps = {
  onDecoded: OnDecodedHandler;
  onError?: OnErrorHandler;
  options?:UseScannerOptions;
}

const defaultOptions: UseScannerOptions ={
  formats: ['QR_CODE', "EAN_13"],
  prefix:'reqr',
  facingMode:'environment',
  scanDelay:1000,
  timeout:30000,
  frameRate:500,
  scanAreaEdgeRatio:0.2
};



export const useScanner = (props:UseScannerProps):ScannerController => {
  
  const codeReaderRef = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader());
  const options = useMemo(()=>({...defaultOptions, ...props.options}),[props.options]);
  const [format, setFormat] = useState<SupportedFormat>(options.formats[0]);

  useEffect(() => {
    codeReaderRef.current.setHints(new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat[format]]]]));
  }, [format]);

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

  
  

  const scanInterval = useInterval(()=>scanFrame(), options.scanDelay);
  const stopTimeout = useTimeout(()=>stop(), options.timeout);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const lockTimeout = useTimeout(()=>setIsLocked(false), 3000);
  useEffect(()=>{
    if(!isLocked) return;
    lockTimeout.start();
  },[isLocked]);
  

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
    if(video.srcObject){
      const srcObject = video.srcObject as MediaStream;
      srcObject.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
  }

  const scanFrame = () => {
    const formatSetting = formatSettings.get(format);
    const scanAreaEdgeRatio = formatSetting?.edgeRatio || 0.2;
    const scanAreaAspectRatio = formatSetting?.aspectRatio || 1;

    if (canvasRef.current === null || videoRef.current === null ) return;
    const {videoWidth, videoHeight} = videoRef.current;
    const {width, height} = new Size(videoWidth, videoHeight)
      .contain(videoWidth*(1-scanAreaEdgeRatio), videoHeight*(1-scanAreaEdgeRatio))
      .contain(scanAreaAspectRatio)
    
    canvasRef.current.getContext('2d')?.drawImage(
      videoRef.current,
      // source x, y, w, h:
      (videoWidth - width) / 2, (videoHeight - height) / 2, width, height,
      // dest x, y, w, h:
      0, 0, canvasRef.current.width, canvasRef.current.height
    )
    
    canvasRef.current.toBlob(blob => {
      if(!blob) return;
      if(isLocked) return;
      codeReaderRef.current.decodeFromImageUrl(URL.createObjectURL(blob)).then((result)=>{
        if(!result) return;
        stopTimeout.reset();
        setIsLocked(true);
        props.onDecoded?.(result);
      }).catch((error:Error)=>{
        props.onError?.(error);
      })
    })
  }
  
  const initCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if(!video || !canvas) return;

    const formatSetting = formatSettings.get(format);
    const scanAreaEdgeRatio = formatSetting?.edgeRatio || 0.2;
    const scanAreaAspectRatio = formatSetting?.aspectRatio || 1;

    const {width, height} = new Size(video.videoWidth, video.videoHeight)
    .contain(video.videoWidth*(1-scanAreaEdgeRatio), video.videoHeight*(1-scanAreaEdgeRatio))
    .contain(scanAreaAspectRatio);

    canvas.width = width;
    canvas.height = height;
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
      const srcObject = video.srcObject as MediaStream|null;
      setStream(()=>srcObject);
      setSettings(()=>srcObject?.getTracks()?.[0].getSettings() || null);
      setState(()=>eventStateMap.get(event.type as keyof HTMLVideoElementEventMap) || null);
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
    if(state==='PLAYING'){
      scanInterval.reset();
      if(0 < options.timeout){
        stopTimeout.reset();
      }
    }else{
      scanInterval.clear();
      stopTimeout.clear();
    }
    return () => { 
      scanInterval.clear();
      stopTimeout.clear();
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
    format,
    options,

    play,
    pause,
    stop,
    setFormat,
    setTorch,
    setZoom,
  }

  return controller
}

