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
export interface VideoSize {
  video:Size
  client:Size
}


export interface Scanner {
  state: ScannerState|null;
  stream: MediaStream|null;
  videoSize: VideoSize|null;
  track: MediaStreamTrack|null;
  capabilities: MediaTrackAdvancedCapabilities|null;
  constraints: MediaTrackAdvancedConstraints|null;
  settings: MediaTrackAdvancedSettings|null;
  deviceId: string|null;
}
