import { VideoSize, Size } from "../types";
import { calculateContainSize, min } from "../utils";

export type FrameProp = JSX.IntrinsicElements['div'] & {
  videoSize: VideoSize|null
  padding?: number;
  children?: React.ReactNode;
}

const Frame: React.FC<FrameProp> = ({videoSize, padding=30, children, ...props}) => {
  const clipSize = videoSize ? ((v)=>min(v.height, v.width))(calculateContainSize(videoSize.video, videoSize.client)) : 0;
  const offsetVertical = videoSize ? Math.floor((videoSize.client.height - clipSize) / 2) : 0;
  const offsetHolizontal = videoSize ? Math.floor((videoSize.client.width - clipSize) / 2) : 0;
  const framStyle:React.CSSProperties = {
    width: videoSize?.client.width,
    height: videoSize?.client.height,
    backgroundClip: 'padding-box',
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: `${offsetVertical+padding}px`,
    borderRightWidth: `${offsetHolizontal+padding}px`,
    borderBottomWidth: `${offsetVertical+padding}px`,
    borderLeftWidth: `${offsetHolizontal+padding}px`,
    boxSizing: 'border-box',
    position:'absolute',
    top:'50%',
    left:'50%',
    transform: 'translate(-50%, -50%)',

    display:videoSize ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems:'center',
    justifyContent: 'center',
  }
  return (
    <div style={framStyle} {...props}>
      {children}
    </div>
  )
}

export default Frame;