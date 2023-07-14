import { ScannerController } from "../../types";
import ScannerFrame from "./ScannerFrame";

export type ScannerScreenProps = JSX.IntrinsicElements['video'] & {
  controller: ScannerController|null;
  videoRef:React.RefObject<HTMLVideoElement>;
  canvasRef:React.RefObject<HTMLCanvasElement>;
  prefix?: string;
  children?: React.ReactNode;
}

const ScannerScreen: React.FC<ScannerScreenProps> = ({ controller, videoRef, canvasRef, prefix='reqr', children, ...props}) => {
  const videoStyle:React.CSSProperties = {
    width: 'auto',
    maxWidth: '100%',
    height: '100%',
    position: 'absolute',
    margin: 'auto',
    left: 0,
    right: 0,
  }
  
  return (
    <>
      <video ref={videoRef} className={`${prefix}-video`} style={videoStyle} playsInline {...props} />
      <ScannerFrame controller={controller} />
      <canvas ref={canvasRef} className={`${prefix}-canvas`} style={{display:'none'}} />
      {children}
    </>
  )
}

export default ScannerScreen;