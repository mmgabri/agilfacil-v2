import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useTimer({ timerControlSocket, userId }) {
  const [timeInput, setTimeInput] = useState("00:00");
  const [timer, setTimer] = useState(0);
  const [isRunningTimer, setIsRunningTimer] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);

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
    timerControlSocket({ timeInput, timer, isRunningTimer: true, userId });
    setIsRunningTimer(true);
  };

  const handlePauseTimer = () => {
    timerControlSocket({ timeInput, timer, isRunningTimer: false, userId });
    setIsRunningTimer(false);
  };

  const syncFromSocket = ({ timeInput: t, timer: s, isRunningTimer: r }) => {
    setIsRunningTimer(r);
    setTimeInput(t);
    setTimer(s);
  };

  return {
    timeInput,
    timer,
    isRunningTimer,
    isInvalidFormat,
    handleInputTimerChange,
    handleStartTimer,
    handlePauseTimer,
    syncFromSocket,
  };
}
