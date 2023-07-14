import Button, { ButtonProps } from "./Button";
import { MdFlashlightOn, MdFlashlightOff } from 'react-icons/md'
import { ScannerController } from "../../types";
import { useMemo } from "react";

export type TorchButtonProps = ButtonProps & {
  controller: ScannerController|null;
}

const TorchButton: React.FC<TorchButtonProps> = ({controller, ...props}) => {
  const isTorchCan = useMemo(()=>!(controller?.capabilities?.torch === undefined) , [controller?.capabilities?.torch]);
  const isTorchOn = useMemo(()=>controller?.settings?.torch ?? false, [controller?.settings?.torch]);
  const toggleTorch = () => {
    if(!isTorchCan) return;
    controller && controller.setTorch(!isTorchOn);
  }
  const onClick = () => toggleTorch();
  return (
    <Button onClick={onClick} disabled={!isTorchCan} {...props} >
      {isTorchOn ? <MdFlashlightOff/> : <MdFlashlightOn/> }
    </Button>
  )
}

export default TorchButton;