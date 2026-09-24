import React from 'react';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', imgClassName = '', showText = true, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: { img: 'h-8 w-auto', text: 'text-base' },
    md: { img: 'h-10 w-auto', text: 'text-xl' },
    lg: { img: 'h-14 w-auto', text: 'text-2xl' },
    xl: { img: 'h-20 w-auto', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/Firefly.png"
        alt="Logo Oficial Pro-Funcional"
        className={`object-contain filter drop-shadow-md transition-transform hover:scale-105 ${currentSize.img} ${imgClassName}`}
      />
      {showText && (
        <span className={`font-black tracking-tight text-white ${currentSize.text}`}>
          PRO<span className="text-[#00E676]">FUNCIONAL</span>
        </span>
      )}
    </div>
  );
}
