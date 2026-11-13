'use client';

import { LoaderProps } from '@/types';
import { useEffect, useState } from 'react';
import { cn } from '@/utils';

export function Loader({ onLoadingComplete }: LoaderProps) {
  const [squares, setSquares] = useState([
    { id: 1, x: 0, y: 0, visible: true },
    { id: 2, x: 1, y: 0, visible: true },
    { id: 3, x: 2, y: 0, visible: true },
    { id: 4, x: 0, y: 1, visible: true },
    { id: 5, x: 1, y: 1, visible: true },
    { id: 6, x: 2, y: 1, visible: true },
    { id: 7, x: 0, y: 2, visible: true },
    { id: 8, x: 1, y: 2, visible: true },
    { id: 9, x: 2, y: 2, visible: true },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSquares((prev) => {
        return prev.map((square) => {
          const visibleCount = prev.filter((s) => s.visible).length;
          if (visibleCount <= 4 && square.visible) return square;

          return {
            ...square,
            visible: Math.random() > 0.3,
          };
        });
      });
    }, 150);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      onLoadingComplete?.();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center bg-main justify-center text-white bg-cover bg-center overflow-hidden">
      <div className="relative w-24 h-24">
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          {squares.map((square) => (
            <div
              key={square.id}
              className={cn(
                'w-7 h-7 bg-white transition-all duration-200 ease-in-out',
                square.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
