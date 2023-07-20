import { formatSettings } from "../../constants/constants";
import { ScannerController } from "../../types";
import { Size } from "../../utils";

export type ScannerFrameProps = JSX.IntrinsicElements['div'] & {
  controller: ScannerController|null
  children?: React.ReactNode;
}

const ScannerFrame: React.FC<ScannerFrameProps> = ({controller, children, ...props}) => {
  if(!controller) return (<></>);
  const scanAreaEdgeRatio = controller.options.scanAreaEdgeRatio;
  const scanAreaAspectRatio = formatSettings.get(controller.options.format)?.aspectRatio || 1;

  
  if(!controller.sizes) return (<></>);
  const {video:videoSize, client:clientSize} = controller.sizes;

  const clipSize = new Size(videoSize.width, videoSize.height)
    .contain(clientSize.width*(1-scanAreaEdgeRatio), clientSize.height*(1-scanAreaEdgeRatio))
    .contain(scanAreaAspectRatio);
  
  const offsetX = Math.floor((clientSize.width - clipSize.width) / 2);
  const offsetY = Math.floor((clientSize.height - clipSize.height) / 2);
  
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
      {children}
    </div>
  )
}

export default ScannerFrame;