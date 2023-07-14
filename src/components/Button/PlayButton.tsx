import Button, { ButtonProps } from "./Button";
import { ScannerController, ScannerState } from "../../types";
import { useMemo } from "react";
import { FaPlay, FaPause } from 'react-icons/fa'

export type PlayButtonProps = ButtonProps & {
  controller: ScannerController|null;
}

const PlayButton: React.FC<PlayButtonProps> = ({controller, ...props}) => {
  
  const defaultFacingMode:ConstrainDOMString = 'environment';

  const disabled = useMemo(()=>{
    return !(controller?.state && (['STOPPED','PLAYING','PAUSED'] as ScannerState[]).includes(controller?.state))
  }, [controller?.state]);
  const deviceId = useMemo(()=>controller?.constraints?.deviceId, [controller?.constraints?.deviceId]);
  const isPlaying = useMemo(()=>controller?.state==='PLAYING', [controller?.state]);

  const togglePlay = () => {
    if(!controller) return;

    switch(controller?.state){
      case 'PLAYING':
        controller.pause(); break;
      case 'PAUSED':
        controller.play(); break;
      default:
        controller.play(deviceId ? {deviceId:deviceId} : {facingMode:defaultFacingMode}); break;
    }
  }

  const onClick = () => togglePlay();

  return (
    <Button size='lg' disabled={disabled} onClick={onClick} {...props}>{isPlaying?<FaPause />:<FaPlay />}</Button>
  )
}

export default PlayButton;