/**
 * @file DeviceFrame.tsx
 * @description Device frame wrapper that simulates phone/tablet appearance around chat content
 * 
 * @dependencies None
 * @usage Wraps ChatPreview content based on framePreset setting
 */

import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  preset: 'none' | 'phone' | 'tablet';
  children: React.ReactNode;
  className?: string;
}

export function DeviceFrame({ preset, children, className }: DeviceFrameProps) {
  if (preset === 'none') {
    return <div className={cn("h-full w-full", className)}>{children}</div>;
  }

  if (preset === 'phone') {
    return (
      <div className={cn("flex items-center justify-center p-4 h-full", className)}>
        <div className="relative flex flex-col bg-[#1a1a1a] rounded-[44px] p-2.5 shadow-2xl max-h-full" style={{ width: '380px', aspectRatio: '9/18' }}>
          {/* Phone bezel */}
          <div className="absolute inset-2.5 rounded-[36px] overflow-hidden bg-black">
            {/* Screen content */}
            <div className="h-full w-full overflow-hidden rounded-[36px]">
              {children}
            </div>
          </div>
          
          {/* Side buttons */}
          <div className="absolute -left-[3px] top-28 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-40 w-[3px] h-14 bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-56 w-[3px] h-14 bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -right-[3px] top-36 w-[3px] h-20 bg-[#2a2a2a] rounded-r-sm" />
          
          {/* Home indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-20" />
        </div>
      </div>
    );
  }

  if (preset === 'tablet') {
    return (
      <div className={cn("flex items-center justify-center p-4 h-full", className)}>
        <div className="relative flex bg-[#1a1a1a] rounded-[24px] p-2 shadow-2xl max-w-full max-h-full" style={{ width: '100%', maxWidth: '600px', aspectRatio: '4/3' }}>
          {/* Tablet bezel */}
          <div className="absolute inset-2 rounded-[16px] overflow-hidden bg-black">
            {/* Screen content */}
            <div className="h-full w-full overflow-hidden rounded-[16px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
