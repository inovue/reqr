import { BarcodeFormat } from "@zxing/library";
import { UseScannerOptions } from "../hooks/useScanner";

export type SupportedFormat = keyof typeof BarcodeFormat;

export type ScannerState = 'LOADING' | 'PLAYING' | 'PAUSED' | 'STOPPED'

export interface MediaTrackAdvancedCapabilities extends MediaTrackCapabilities {
  torch?:boolean;
  zoom?:DoubleRange & {step?:number};
}

export interface MediaTrackAdvancedConstraintSet extends MediaTrackConstraintSet {
  torch?:boolean;
  zoom?:ConstrainDouble;
}

export interface MediaTrackAdvancedConstraints extends MediaTrackConstraints {
  advanced?: MediaTrackAdvancedConstraintSet[];
}

export interface MediaTrackAdvancedSettings extends MediaTrackSettings {
  torch?:boolean;
  zoom?:number
}


export type Size = {
  width: number;
  height: number;
}
export interface ScannerSizes {
  video:Size
  client:Size
}


export interface ScannerController {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;

  devices: MediaDeviceInfo[]|null;
  state: ScannerState|null;
  stream: MediaStream|null;
  track: MediaStreamTrack|null;
  capabilities: MediaTrackAdvancedCapabilities|null;
  constraints: MediaTrackAdvancedConstraints|null;
  settings: MediaTrackAdvancedSettings|null;
  sizes: ScannerSizes|null,
  options: UseScannerOptions;
  format: SupportedFormat;

  play: (constraints?:MediaTrackConstraints)=>Promise<void>;
  pause: () => void;
  stop: () => void;
  setFormat: (format:SupportedFormat) => void;
  setTorch: (value:boolean) => Promise<void>;
  setZoom: (value:number) => Promise<void>;
}
