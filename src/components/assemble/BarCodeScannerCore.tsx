import { ScannerController } from "../../types";

import { formatSettings } from "../../constants/constants";
import { Size } from "../../utils";


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
      <>
        <div style={containerStyle}>
          <video ref={controller.videoRef} className={`${controller.options.prefix}-video`} style={videoStyle} playsInline/>
          <canvas ref={controller.canvasRef} className={`${controller.options.prefix}-canvas`} style={cavasStyle} />
        </div>
        <ScannerFrame controller={controller} />
      </>
    )}
    </>
  )
}

export default ScannerCore;



type ScannerFrameProps = JSX.IntrinsicElements['div'] & {
  controller: ScannerController|null
}

const ScannerFrame: React.FC<ScannerFrameProps> = ({controller, ...props}) => {
  if(!controller) return (<></>);
  if(!controller.sizes) return (<></>);

  const {video:videoSize, client:clientSize} = controller.sizes;

  const formatSetting = formatSettings.get(controller.format);
  const scanAreaEdgeRatio = formatSetting?.edgeRatio || 0.2;
  const scanAreaAspectRatio = formatSetting?.aspectRatio || 1;
  const scanIcon = formatSetting?.icon;

  const scanAreaSize = new Size(videoSize.width, videoSize.height)
    .contain(clientSize.width*(1-scanAreaEdgeRatio), clientSize.height*(1-scanAreaEdgeRatio))
    .contain(scanAreaAspectRatio);
  
  const offsetX = Math.floor((clientSize.width - scanAreaSize.width) / 2);
  const offsetY = Math.floor((clientSize.height - scanAreaSize.height) / 2);
  
  const frameStyle:React.CSSProperties = {
    width: clientSize.width,
    height: clientSize.height,
    backgroundClip: 'padding-box',
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: `${offsetY}px`,
    borderRightWidth: `${offsetX}px`,
    borderBottomWidth: `${offsetY}px`,
    borderLeftWidth: `${offsetX}px`,
    boxSizing: 'border-box',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',

    display: controller.sizes ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems:'center',
    justifyContent: 'center',
  }
  return (
    <div style={frameStyle} {...props}>
      {scanIcon && scanIcon({fontSize:100, fill:'rgba(255,255,255,0.6)'})}
    </div>
  )
}
