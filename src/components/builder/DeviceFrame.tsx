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
        <div className="relative flex flex-col bg-[#1a1a1a] rounded-[40px] p-2 shadow-2xl max-h-full" style={{ width: '320px', aspectRatio: '9/19.5' }}>
          {/* Phone bezel */}
          <div className="absolute inset-2 rounded-[32px] overflow-hidden bg-black">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
              <div className="w-24 h-7 bg-[#1a1a1a] rounded-b-2xl flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                <div className="w-3 h-3 rounded-full bg-[#2a2a2a] ring-1 ring-[#3a3a3a]" />
              </div>
            </div>
            
            {/* Screen content */}
            <div className="h-full w-full overflow-hidden rounded-[32px]">
              {children}
            </div>
          </div>
          
          {/* Side buttons */}
          <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
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
            {/* Camera */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a] ring-1 ring-[#3a3a3a]" />
            </div>
            
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
