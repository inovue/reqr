import Button, { ButtonProps } from "./Button";
import { ScannerController } from "../../types";
import { useMemo } from "react";
import { FaRotate } from "react-icons/fa6";

export type RotateButtonProps = ButtonProps & {
  controller: ScannerController|null;
}

const RotateButton: React.FC<RotateButtonProps> = ({controller, ...props}) => {
  const devices = useMemo(()=>controller?.devices, [controller?.devices]);
  const devicesLength = useMemo(()=>controller?.devices?.length||0 , [controller?.devices]);
  const deviceId = useMemo(()=>controller?.constraints?.deviceId, [controller?.constraints?.deviceId]);
  
  const rotateDevice = () => {
    if(!controller) return;
    if(!deviceId) return;
    if(!devices || devicesLength<1) return;
    
    const index = devices.findIndex(device=>device.deviceId === deviceId);
    const nextIndex = index + 1 >= devicesLength ? 0 : index + 1;
    controller.play({deviceId:devices[nextIndex].deviceId});
  }
  
  const onClick = () => rotateDevice();
  
  return (
    <Button disabled={devicesLength<2} onClick={onClick} {...props} ><FaRotate /></Button>
  )
}

export default RotateButton;