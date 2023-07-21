import { useEffect, useRef } from 'react';

type TimeoutRef = {
  start: () => void;
  clear: () => void;
  reset: () => void;
};

export default function useTimeout(callback: () => void, delay: number): TimeoutRef {
  const timeoutRef = useRef<number | null>(null);
  const savedCallback = useRef<() => void>(() => {return;});

  const start = () => {
    if (timeoutRef.current === null) {
      timeoutRef.current = window.setTimeout(() => {
        savedCallback.current();
        timeoutRef.current = null;
      }, delay);
    } else {
      throw new Error('Timeout already started');
    }
  };

  const clear = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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