import { ReactComponent as IconQR } from '../assets/symbols/qr.svg'
import { SupportedFormat } from '../types'

export type FormatOptions = {
  icon: typeof IconQR,
  aspectRatio: number,
  edgeRatio: number,
}

export const formatSettings = new Map<SupportedFormat, FormatOptions>([
  ["QR_CODE", {icon:IconQR, aspectRatio:1, edgeRatio:0.2}],
  ["AZTEC", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["CODABAR", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["CODE_39", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["CODE_93", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["CODE_128", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["DATA_MATRIX", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["MAXICODE", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["ITF", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["EAN_13", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["EAN_8", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["PDF_417", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["RSS_14", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["RSS_EXPANDED", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["UPC_A", {icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["UPC_E",{icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
  ["UPC_EAN_EXTENSION",{icon:IconQR, aspectRatio:4/3, edgeRatio:0.2}],
])