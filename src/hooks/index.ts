import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useMemo, useState } from "react";
import { MediaTrackAdvancedCapabilities, MediaTrackAdvancedConstraints, MediaTrackAdvancedSettings, ScannerState } from "../types";


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

  const track = useMemo(()=> stream?.getTracks()?.[0] || null, [stream]);
  const capabilities = useMemo(()=> track?.getCapabilities() as (MediaTrackAdvancedCapabilities|null) || null, [track]);
  const constraints = useMemo(()=> track?.getConstraints() as (MediaTrackAdvancedConstraints|null) || null, [track]);
  //const settings = useMemo(()=> track?.getSettings() as (MediaTrackAdvancedSettings|null) || null, [track]);
  const deviceId = useMemo(()=> capabilities?.deviceId || null,[capabilities])



  useEffect(() => {
    if(!videoElement) return;
    const handleSrcObjectChange:EventListener = (event) => {
      console.log("useScanner", event.type, videoElement.srcObject)
      
      const srcObject:MediaStream|null = videoElement.srcObject as MediaStream|null;
      setStream(()=>srcObject);
      setSettings(()=>srcObject?.getTracks()?.[0].getSettings() || null);
      if(event.type in eventState) setState(()=>eventState[event.type]);
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
  
  const scanner = { state, stream, track, capabilities, constraints, settings, setSettings, deviceId }
  return scanner
}







/*
export const useMediaStreamTrack = (mediaStream: MediaStream|null) => {
  return useMemo(()=> {
    if(!mediaStream) return null;
    const tracks = mediaStream.getTracks();
    return (0 < tracks.length) ? tracks[0] : null;
  }, [mediaStream]);
}

export const useCapabilities = (mediaStreamTrack: MediaStreamTrack|null) => {
  return useMemo(()=> {
    if(!mediaStreamTrack) return null;
    return mediaStreamTrack?.getCapabilities() as MediaTrackAdvancedCapabilities
  }, [mediaStreamTrack]);
}

export const useConstraints = (mediaStreamTrack: MediaStreamTrack|null) => {
  return useMemo(()=> {
    if(!mediaStreamTrack) return null;
    return mediaStreamTrack?.getConstraints() as MediaTrackAdvancedConstraints
  }, [mediaStreamTrack]);
}

export const useTrackSetting = (mediaStreamTrack: MediaStreamTrack|null) => {
  return useMemo(()=> {
    if(!mediaStreamTrack) return null;
    return mediaStreamTrack?.getSettings() as MediaTrackAdvancedSettings
  }, [mediaStreamTrack]);
}


export const useCanTorch = (capabilities: MediaTrackAdvancedCapabilities|null) => {
  return useMemo(()=> !!capabilities?.torch, [capabilities]);
}
export const useCanZoom = (capabilities: MediaTrackAdvancedCapabilities|null) => {
  return useMemo(()=> !!capabilities?.zoom, [capabilities]);
}
*/