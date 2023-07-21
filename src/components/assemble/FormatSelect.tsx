import { useMemo } from "react";
import { ScannerController, SupportedFormat } from "../../types";

export type FormatSelectProps = JSX.IntrinsicElements['select'] & {
  controller: ScannerController|null;
}

const FormatSelect: React.FC<FormatSelectProps> = ({controller, ...props}) => {
  const formats = useMemo(()=>controller?.options.formats || [], [controller?.options.formats]);
  const currentFormat = useMemo(()=>controller?.format, [controller?.format]);

  const onChannge = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as SupportedFormat;
    controller?.setFormat(newFormat);
  }
  return (
    <>
    { formats.length &&
      <select {...props} onChange={onChannge}>
        { formats.map((format)=>(
          <option key={format} value={format} selected={format===currentFormat}>{format}</option>
        ))}
      </select>
      }
    </>
  )
}

export default FormatSelect;