import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function ColorPicker({ 
  label, 
  value, 
  onChange,
  id,
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  id: string;
}) {
  // Convert HSL string to hex for the color picker
  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v.replace("%", "")));
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    
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
  };
  
  // Convert hex to HSL string
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return value;
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
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
  };

  return (
    <div className="flex items-center justify-between gap-md">
      <Label htmlFor={id} className="text-body text-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-sm">
        <input
          type="color"
          id={id}
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent"
          aria-label={label}
        />
        <span className="text-small text-muted-foreground w-24 truncate">
          {hslToHex(value)}
        </span>
      </div>
    </div>
  );
}

export function ThemeTab() {
  const { scenario, updateTheme } = useScenario();
  const { theme } = scenario;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateTheme({ contactAvatar: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-lg p-md">
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="mb-md text-heading-md text-foreground">
            Contact Info
          </h2>
          
          <div className="flex flex-col gap-md">
            <div>
              <Label htmlFor="contact-name" className="mb-xs block text-body">
                Contact Name
              </Label>
              <Input
                id="contact-name"
                value={theme.contactName}
                onChange={(e) => updateTheme({ contactName: e.target.value })}
                placeholder="Enter contact name"
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="mb-xs block text-body">Contact Avatar</Label>
              <div className="flex items-center gap-md">
                <Avatar className="h-12 w-12">
                  {theme.contactAvatar ? (
                    <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(theme.contactName)}
                  </AvatarFallback>
                </Avatar>
                
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  aria-label="Upload avatar image"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  className="gap-xs"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload
                </Button>
                
                {theme.contactAvatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateTheme({ contactAvatar: null })}
                    aria-label="Remove avatar"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        <section aria-labelledby="sender-heading">
          <h2 id="sender-heading" className="mb-md text-heading-md text-foreground">
            Sender Bubbles (You)
          </h2>
          
          <div className="flex flex-col gap-sm">
            <ColorPicker
              id="sender-bg"
              label="Background"
              value={theme.senderBubbleColor}
              onChange={(value) => updateTheme({ senderBubbleColor: value })}
            />
            <ColorPicker
              id="sender-text"
              label="Text Color"
              value={theme.senderTextColor}
              onChange={(value) => updateTheme({ senderTextColor: value })}
            />
          </div>
        </section>

        <hr className="border-border" />

        <section aria-labelledby="receiver-heading">
          <h2 id="receiver-heading" className="mb-md text-heading-md text-foreground">
            Receiver Bubbles (Contact)
          </h2>
          
          <div className="flex flex-col gap-sm">
            <ColorPicker
              id="receiver-bg"
              label="Background"
              value={theme.receiverBubbleColor}
              onChange={(value) => updateTheme({ receiverBubbleColor: value })}
            />
            <ColorPicker
              id="receiver-text"
              label="Text Color"
              value={theme.receiverTextColor}
              onChange={(value) => updateTheme({ receiverTextColor: value })}
            />
          </div>
        </section>

        <hr className="border-border" />

        <section aria-labelledby="chat-heading">
          <h2 id="chat-heading" className="mb-md text-heading-md text-foreground">
            Chat Background
          </h2>
          
          <ColorPicker
            id="chat-bg"
            label="Background Color"
            value={theme.chatBackground}
            onChange={(value) => updateTheme({ chatBackground: value })}
          />
        </section>

        <hr className="border-border" />

        <section aria-labelledby="font-heading">
          <h2 id="font-heading" className="mb-md text-heading-md text-foreground">
            Typography
          </h2>
          
          <div className="flex flex-col gap-md">
            <div>
              <div className="flex items-center justify-between mb-xs">
                <Label htmlFor="font-size" className="text-body">
                  Font Size
                </Label>
                <span className="text-small text-muted-foreground">
                  {theme.fontSize}px
                </span>
              </div>
              <Slider
                id="font-size"
                min={12}
                max={20}
                step={1}
                value={[theme.fontSize]}
                onValueChange={([value]) => updateTheme({ fontSize: value })}
                aria-label="Font size"
              />
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
