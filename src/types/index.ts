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