import React, { useEffect } from 'react';

interface CircularTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  onExpire?: () => void;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  totalSeconds,
  remainingSeconds,
  onExpire,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, remainingSeconds / totalSeconds);
  const strokeDashoffset = circumference - progress * circumference;

  useEffect(() => {
    if (remainingSeconds <= 0 && onExpire) {
      onExpire();
    }
  }, [remainingSeconds, onExpire]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isLow = remainingSeconds <= 20;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Animated Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={`transition-all duration-1000 ease-linear ${
            isLow ? 'stroke-rose-500' : 'stroke-sky-500'
          }`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-lg font-bold font-mono ${isLow ? 'text-rose-500 animate-pulse' : 'text-slate-800 dark:text-slate-100'}`}>
          {formattedTime}
        </span>
        <span className="text-[10px] uppercase font-semibold text-slate-400">Remaining</span>
      </div>
    </div>
  );
};
