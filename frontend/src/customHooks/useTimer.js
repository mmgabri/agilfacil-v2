import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Toca um alarme curto (3 beeps) via Web Audio API — sem depender de nenhum
// arquivo de áudio externo.
const playAlarmSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [0, 0.25, 0.5].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.22);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch (err) {
    // Ambiente sem suporte a Web Audio — ignora silenciosamente
  }
};

export function useTimer({ timerControlSocket, userId }) {
  const [timeInput, setTimeInput] = useState("00:00");
  const [timer, setTimer] = useState(0);
  const [isRunningTimer, setIsRunningTimer] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);
  const [hasTimeEnded, setHasTimeEnded] = useState(false);

  useEffect(() => {
    if (!isRunningTimer) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) {
          const minutes = String(Math.floor((prev - 1) / 60)).padStart(2, "0");
          const seconds = String((prev - 1) % 60).padStart(2, "0");
          setTimeInput(`${minutes}:${seconds}`);
          return prev - 1;
        } else {
          setIsRunningTimer(false);
          setHasTimeEnded(true);
          playAlarmSound();
          toast.info("⏰ Tempo esgotado!", {
            position: 'top-center',
            autoClose: 4000,
            hideProgressBar: false,
            closeButton: true,
            draggable: true,
            pauseOnHover: true,
          });
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunningTimer]);

  const validateTimeFormat = (value) => /^([0-5]?[0-9]):([0-5]?[0-9])$/.test(value);

  const handleInputTimerChange = (e) => {
    if (isRunningTimer) return;
    const value = e.target.value;
    if (!validateTimeFormat(value)) {
      setIsInvalidFormat(true);
      setTimeInput(value);
      return;
    }
    setIsInvalidFormat(false);
    setTimeInput(value);
    setHasTimeEnded(false);
    const [minutes, seconds] = value.split(":").map(Number);
    setTimer((minutes || 0) * 60 + (seconds || 0));
  };

  const handleStartTimer = () => {
    if (isInvalidFormat) {
      toast.error("Informe o tempo no formato MM:SS", {
        position: 'top-center',
        autoClose: 1000,
        hideProgressBar: false,
        closeButton: false,
        draggable: true,
        pauseOnHover: true,
      });
      return;
    }
    setHasTimeEnded(false);
    timerControlSocket({ timeInput, timer, isRunningTimer: true, userId });
    setIsRunningTimer(true);
  };

  const handlePauseTimer = () => {
    timerControlSocket({ timeInput, timer, isRunningTimer: false, userId });
    setIsRunningTimer(false);
  };

  const syncFromSocket = ({ timeInput: t, timer: s, isRunningTimer: r }) => {
    if (r) setHasTimeEnded(false);
    setIsRunningTimer(r);
    setTimeInput(t);
    setTimer(s);
  };

  return {
    timeInput,
    timer,
    isRunningTimer,
    isInvalidFormat,
    hasTimeEnded,
    handleInputTimerChange,
    handleStartTimer,
    handlePauseTimer,
    syncFromSocket,
  };
}
