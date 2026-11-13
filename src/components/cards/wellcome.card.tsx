'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { CustomImage } from '@/components/media/image.component';

export interface WelcomeBannerProps {
  message?: string;
}

export default function WelcomeBanner({
  message = 'Welcome back – the central hub for all your management data and tools.',
}: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { data: user } = useCurrentUser();
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white border border-gray-200/80 rounded-sm overflow-hidden shadow-sm transition-all duration-500 ease-in-out">
      <div className="flex flex-col md:flex-row items-center justify-between p-6">
        <div className="space-y-3 md:w-1/2 mb-6 md:mb-0">
          <h2
            className={`text-gray-900 font-bold text-2xl transform transition-all duration-700 ease-out ${isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
              }`}
          >
            Welcome back {user?.last_name} {user?.first_name}!!
          </h2>
          <p
            className={`text-gray-600 text-sm md:text-base max-w-md transform transition-all duration-700 delay-100 ease-out ${isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
              }`}
          >
            {message}
          </p>
        </div>
        <div
          className={`md:w-1/2 flex justify-center md:justify-end transform transition-all duration-700 delay-300 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
        >
          <div className="flex items-center gap-4 bg-white p-4 px-6 rounded-sm border border-gray-200 shadow-sm hover:scale-105 transition-transform duration-300">
            <div className="relative h-12 w-28 flex items-center justify-center">
              <CustomImage
                src="/icons/keng_logo.svg"
                alt="Keng Logo"
                width={100}
                height={40}
                className="max-h-10 w-auto object-contain"
              />
            </div>
            <span className="text-gray-400 font-semibold text-lg select-none">X</span>
            <div className="relative h-12 w-28 flex items-center justify-center">
              <CustomImage
                src="/icons/logo.svg"
                alt="Vietstrix Logo"
                width={100}
                height={40}
                className="max-h-10 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
