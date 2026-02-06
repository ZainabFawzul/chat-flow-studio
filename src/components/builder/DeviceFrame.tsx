/**
 * @file DeviceFrame.tsx
 * @description Device frame wrapper that simulates phone/tablet appearance around chat content.
 *              Supports vertical and horizontal orientations.
 * 
 * @dependencies None
 * @usage Wraps ChatPreview content based on framePreset and frameOrientation settings
 */

import { cn } from "@/lib/utils";
import { FrameOrientation } from "@/types/scenario";

interface DeviceFrameProps {
  preset: 'none' | 'phone' | 'tablet';
  orientation?: FrameOrientation;
  children: React.ReactNode;
  className?: string;
}

export function DeviceFrame({ preset, orientation = 'vertical', children, className }: DeviceFrameProps) {
  if (preset === 'none') {
    return <div className={cn("h-full w-full", className)}>{children}</div>;
  }

  const isHorizontal = orientation === 'horizontal';

  if (preset === 'phone') {
    return (
      <div className={cn("flex items-center justify-center p-4 h-full", className)}>
        <div
          className="relative flex flex-col bg-[#1a1a1a] shadow-2xl max-h-full"
          style={{
            width: isHorizontal ? undefined : '380px',
            height: isHorizontal ? '380px' : undefined,
            maxWidth: isHorizontal ? '100%' : undefined,
            aspectRatio: isHorizontal ? '16/9' : '9/16',
            borderRadius: isHorizontal ? '28px' : '44px',
            padding: '10px',
          }}
        >
          {/* Phone bezel */}
          <div
            className="absolute overflow-hidden bg-black"
            style={{
              inset: '10px',
              borderRadius: isHorizontal ? '20px' : '36px',
            }}
          >
            {/* Screen content */}
            <div
              className="h-full w-full overflow-hidden"
              style={{ borderRadius: isHorizontal ? '20px' : '36px' }}
            >
              {children}
            </div>
          </div>
          
          {/* Side buttons - adjust for orientation */}
          {isHorizontal ? (
            <>
              <div className="absolute top-[-3px] left-28 h-[3px] w-8 bg-[#2a2a2a] rounded-t-sm" />
              <div className="absolute top-[-3px] left-40 h-[3px] w-14 bg-[#2a2a2a] rounded-t-sm" />
              <div className="absolute bottom-[-3px] left-36 h-[3px] w-20 bg-[#2a2a2a] rounded-b-sm" />
            </>
          ) : (
            <>
              <div className="absolute -left-[3px] top-28 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-40 w-[3px] h-14 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -left-[3px] top-56 w-[3px] h-14 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute -right-[3px] top-36 w-[3px] h-20 bg-[#2a2a2a] rounded-r-sm" />
            </>
          )}
          
          {/* Home indicator */}
          {isHorizontal ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-28 w-1 bg-white/20 rounded-full z-20" />
          ) : (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-20" />
          )}
        </div>
      </div>
    );
  }

  if (preset === 'tablet') {
    return (
      <div className={cn("flex items-center justify-center p-4 h-full", className)}>
        <div
          className="relative flex bg-[#1a1a1a] shadow-2xl max-w-full max-h-full"
          style={{
            width: '100%',
            maxWidth: isHorizontal ? '700px' : '600px',
            aspectRatio: isHorizontal ? '4/3' : '3/4',
            borderRadius: '24px',
            padding: '8px',
          }}
        >
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
