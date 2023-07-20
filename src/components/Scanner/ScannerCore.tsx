import { ScannerController } from "../../types";

export type ScannerCoreProps = JSX.IntrinsicElements['video'] & {
  controller: ScannerController|null;
}

const ScannerCore: React.FC<ScannerCoreProps> = ({controller}) => {
  const containerStyle:React.CSSProperties = {
    width: 'auto',
    maxWidth: '100%',
    height: '100%',
    position: 'absolute',
    margin: 'auto',
    left: 0,
    right: 0,
  }
  const videoStyle:React.CSSProperties = {
    width: '100%',
    height: '100%',
  }
  const cavasStyle:React.CSSProperties = {
    //display: 'none',
  }
  
  return (
    <>
    {controller && (
      <div style={containerStyle}>
        <video ref={controller.videoRef} className={`${controller.options.prefix}-video`} style={videoStyle} playsInline/>
        <canvas ref={controller.canvasRef} className={`${controller.options.prefix}-canvas`} style={cavasStyle} />
      </div>
    )}
    </>
  )
}

export default ScannerCore;