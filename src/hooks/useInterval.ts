import { useEffect, useRef } from 'react';

type UseIntervalFunctions = {
  start: () => void;
  clear: () => void;
  reset: () => void;
};

export default function useInterval(callback: () => void, delay: number): UseIntervalFunctions {
  const intervalRef = useRef<number | null>(null);
  const savedCallback = useRef<() => void>(() => {return;});

  const start = () => {
    if (intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        savedCallback.current();
      }, delay);
    } else {
      throw new Error('Interval already started');
    }
  };

  const clear = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    clear();
    start();
  };

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    start();
    return clear;
  }, []);

  return { start, clear, reset };
}