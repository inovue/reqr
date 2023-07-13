import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useMemo, useState } from "react";
import { MediaTrackAdvancedCapabilities, MediaTrackAdvancedConstraints, MediaTrackAdvancedSettings, ScannerState, VideoSize } from "../types";


export const useVideoInputDevices = () => {
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>();

  useEffect(()=>{
    (async () => {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      setVideoInputDevices(()=>devices);
      if(devices.length<1) throw new Error("No video input devices available");
    })();
  }, []);

  return videoInputDevices;
}


const eventState:Partial<{[key in keyof HTMLVideoElementEventMap]:ScannerState|null}> = {
  'play': 'LOADING',
  'playing': 'PLAYING',
  'pause': 'PAUSED',
  'emptied': 'STOPPED',
  'loadedmetadata': 'PLAYING'
}

export const useScanner = (videoElement: HTMLVideoElement|null) => {
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [state, setState] = useState<ScannerState|null>(null);
  const [settings, setSettings] = useState<MediaTrackAdvancedSettings|null>(null);

  const [videoSize, setVideoSize] = useState<VideoSize|null>(null);
  
  const track = useMemo(()=> stream?.getTracks()?.[0] || null, [stream]);
  const capabilities = useMemo(()=> track?.getCapabilities() as (MediaTrackAdvancedCapabilities|null) || null, [track]);
  const constraints = useMemo(()=> track?.getConstraints() as (MediaTrackAdvancedConstraints|null) || null, [track]);
  //const settings = useMemo(()=> track?.getSettings() as (MediaTrackAdvancedSettings|null) || null, [track]);
  const deviceId = useMemo(()=> capabilities?.deviceId || null,[capabilities])

  

  useEffect(() => {
    if(!videoElement) return;
    const handleSrcObjectChange:EventListener = (event) => {
      console.log("useScanner", event.type, videoElement.srcObject)
      
      const srcObject = videoElement.srcObject as MediaStream|null;
      setStream(()=>srcObject);
      setSettings(()=>srcObject?.getTracks()?.[0].getSettings() || null);
      
      if(event.type in eventState){
        setState(()=>eventState[event.type]);
      }
      
      if(event.type === 'playing'){
        setVideoSize(()=>({
          video:{
            width:videoElement.videoWidth, 
            height:videoElement.videoHeight,
          },
          client:{
            width:videoElement.clientWidth,
            height:videoElement.clientHeight
          }
        }));
      }else if(event.type === 'emptied'){
        setVideoSize(()=>null);
      }

    };
    videoElement.addEventListener('play', handleSrcObjectChange);
    videoElement.addEventListener('playing', handleSrcObjectChange);
    videoElement.addEventListener('pause', handleSrcObjectChange);
    videoElement.addEventListener('emptied', handleSrcObjectChange);
    videoElement.addEventListener('loadedmetadata', handleSrcObjectChange);
    
    return () => {
      videoElement.addEventListener('play', handleSrcObjectChange);
      videoElement.addEventListener('playing', handleSrcObjectChange);
      videoElement.addEventListener('pause', handleSrcObjectChange);
      videoElement.removeEventListener('emptied', handleSrcObjectChange);
      videoElement.addEventListener('loadedmetadata', handleSrcObjectChange);
    };
  }, [videoElement]);
  
  const scanner = { state, stream, track, capabilities, constraints, settings, setSettings, deviceId, videoSize }
  return scanner
}
