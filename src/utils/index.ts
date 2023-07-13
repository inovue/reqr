import { Size } from "../types";

export const calculateContainSize = (containerSize: Size, itemSize: Size): Size => {
  const itemSizeRatio = itemSize.width / itemSize.height;
  const containerSizeRatio = containerSize.width / containerSize.height;

  if (itemSizeRatio > containerSizeRatio) {
    return {
      width: containerSize.width,
      height: containerSize.width / itemSizeRatio
    };
  } else {
    return {
      width: containerSize.height * itemSizeRatio,
      height: containerSize.height
    };
  }
}

export const min = (a: number, b: number) => a < b ? a : b;