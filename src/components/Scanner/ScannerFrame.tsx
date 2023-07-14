import { ScannerController } from "../../types";
import { calculateContainSize, min } from "../../utils";

export type ScannerFrameProps = JSX.IntrinsicElements['div'] & {
  controller: ScannerController|null
  children?: React.ReactNode;
}

const ScannerFrame: React.FC<ScannerFrameProps> = ({controller, children, ...props}) => {
  const frameMargin = 30;
  const sizes = controller?.sizes;
  if(!sizes) return (<></>);

  const clipSize = ((v)=>min(v.height, v.width))(calculateContainSize(sizes.video, sizes.client));
  const offsetX = Math.floor((sizes.client.width - clipSize) / 2) + frameMargin;
  const offsetY = Math.floor((sizes.client.height - clipSize) / 2) + frameMargin;
  const frameStyle:React.CSSProperties = {
    width: sizes.client.width,
    height: sizes.client.height,
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

    display: sizes ? 'flex' : 'none',
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