import { useEffect, useRef, useState } from "react";

export function useCountdown() {
  const [remainingTime, setRemainingTime] = useState<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = (seconds: number) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRemainingTime(seconds);

    timerRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime && prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return undefined;
        }
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return { remainingTime, start };
}
