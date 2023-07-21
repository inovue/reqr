import { ScannerController } from "../../types";
import { useMemo } from "react";

export type ZoomSliderProps = JSX.IntrinsicElements['input'] & {
  controller: ScannerController;
  children?: React.ReactNode;
}

const ZoomSlider: React.FC<ZoomSliderProps> = ({controller, children, ...props}) => {
  const zoom = useMemo(()=>({
    disabled: controller?.capabilities?.zoom === undefined,
    min: controller?.capabilities?.zoom?.min,
    max: controller?.capabilities?.zoom?.max,
    step: controller?.capabilities?.zoom?.step,
    value: controller?.settings?.zoom,
  }), [controller?.capabilities?.zoom, controller?.settings?.zoom]);

  const style:React.CSSProperties = {
    width: '100%',
  }

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = parseFloat(event.target.value);
    if(zoom.disabled) return;
    controller && controller.setZoom(value);
  }
  
  return (
    <input type="range" name="zoom" {...zoom} onChange={onChange} style={style} {...props}>
      {children} 
    </input>
  )
}

export default ZoomSlider;