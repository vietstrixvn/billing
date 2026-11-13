'use client';

import { HeaderProps } from '@/types';
import React from 'react';

export const Header: React.FC<HeaderProps> = ({ title, className }) => {
  return (
    <div
      className={`mb-6 rounded-none bg-linear-to-r from-secondary-900 via-secondary-500 to-secondary-300 text-white text-lg font-bold px-6 py-4 ${className}`}
    >
      {title}
    </div>
  );
};
