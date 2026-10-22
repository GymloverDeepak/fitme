import { useCallback, useEffect, useRef, useState } from 'react';

// Countdown timer based on wall-clock time, so it stays accurate even if the JS thread is busy
// or the app was briefly in the background. Only one interval can exist at a time, and it is
// always cleared on pause, reset, finish and unmount.
// To change the duration, remount the component that uses this hook (e.g. with a `key`).
// status: 'idle' | 'running' | 'paused' | 'finished'
export default function useCountdown(durationSeconds) {
  const durationMs = Math.max(1, Math.round(durationSeconds)) * 1000;
  const [status, setStatus] = useState('idle');
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const intervalRef = useRef(null);
  const endTimeRef = useRef(0);
  const remainingRef = useRef(durationMs);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const left = Math.max(0, endTimeRef.current - Date.now());
    remainingRef.current = left;
    setRemainingMs(left);
    if (left === 0) {
      stopInterval();
      setStatus('finished');
    }
  }, [stopInterval]);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return; // already running — never start a second interval
    const startFrom = remainingRef.current > 0 ? remainingRef.current : durationMs;
    remainingRef.current = startFrom;
    endTimeRef.current = Date.now() + startFrom;
    setRemainingMs(startFrom);
    setStatus('running');
    intervalRef.current = setInterval(tick, 250);
  }, [durationMs, tick]);

  const pause = useCallback(() => {
    if (intervalRef.current === null) return;
    stopInterval();
    const left = Math.max(0, endTimeRef.current - Date.now());
    remainingRef.current = left;
    setRemainingMs(left);
    setStatus(left === 0 ? 'finished' : 'paused');
  }, [stopInterval]);

  const reset = useCallback(() => {
    stopInterval();
    remainingRef.current = durationMs;
    setRemainingMs(durationMs);
    setStatus('idle');
  }, [durationMs, stopInterval]);

  // Stop ticking when the screen using the timer unmounts.
  useEffect(() => stopInterval, [stopInterval]);

  return {
    status,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    progress: 1 - remainingMs / durationMs,
    start,
    pause,
    reset,
  };
}
