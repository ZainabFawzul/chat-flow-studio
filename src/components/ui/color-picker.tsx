import { useState, useRef, useEffect } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string; // HSL string like "214 100% 65%"
  onChange: (value: string) => void;
  id: string;
}

// Convert HSL string to hex
function hslToHex(hsl: string): string {
  const parts = hsl.split(" ");
  const h = parseFloat(parts[0]) || 0;
  const s = parseFloat(parts[1]?.replace("%", "") || "0") / 100;
  const l = parseFloat(parts[2]?.replace("%", "") || "0") / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex to HSL string
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ColorPicker({ label, value, onChange, id }: ColorPickerProps) {
  const hexValue = hslToHex(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (hex: string) => {
    onChange(hexToHsl(hex));
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            className={cn(
              "group flex items-center gap-3 rounded-full border border-border/50 bg-card px-3 py-1.5",
              "hover:border-primary/50 hover:shadow-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={`${label}: ${hexValue}`}
          >
            {/* Circular swatch */}
            <div
              className="h-6 w-6 rounded-full shadow-inner ring-1 ring-black/10"
              style={{ backgroundColor: hexValue }}
            />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide group-hover:text-foreground transition-colors">
              {hexValue}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-4 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl"
          align="end"
          sideOffset={8}
        >
          <div className="flex flex-col gap-4">
            <div className="color-picker-wrapper">
              <HexColorPicker 
                color={hexValue} 
                onChange={handleChange}
                style={{ width: '200px', height: '180px' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full shadow-md ring-1 ring-black/10 shrink-0"
                style={{ backgroundColor: hexValue }}
              />
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">#</span>
                <HexColorInput
                  color={hexValue}
                  onChange={handleChange}
                  prefixed={false}
                  className={cn(
                    "w-full h-9 pl-7 pr-3 rounded-lg border border-border bg-secondary/50",
                    "text-sm font-mono uppercase tracking-wider",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "placeholder:text-muted-foreground"
                  )}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
