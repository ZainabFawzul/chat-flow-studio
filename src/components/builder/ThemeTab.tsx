import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, User, Palette, MessageCircle, Type } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { BubbleBorderRadius } from "@/types/scenario";

interface BorderRadiusControlProps {
  label: string;
  value: BubbleBorderRadius;
  onChange: (value: BubbleBorderRadius) => void;
}

function BorderRadiusControl({ label, value, onChange }: BorderRadiusControlProps) {
  const corners = [
    { key: "topLeft" as const, label: "TL" },
    { key: "topRight" as const, label: "TR" },
    { key: "bottomRight" as const, label: "BR" },
    { key: "bottomLeft" as const, label: "BL" },
  ];

  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-4 gap-2">
        {corners.map(({ key, label: cornerLabel }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">{cornerLabel}</span>
            <Input
              type="number"
              min={0}
              max={32}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
              className="h-8 w-full text-center text-sm rounded-lg border-border/50 bg-secondary/30"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>0 = sharp</span>
        <span>32 = round</span>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  id: string;
}

function Section({ icon, title, children, id }: SectionProps) {
  return (
    <section 
      aria-labelledby={id}
      className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 id={id} className="text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
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
      <div className="flex flex-col gap-4 p-4">
        {/* Contact Info */}
        <Section icon={<User className="h-4 w-4" />} title="Contact Info" id="contact-heading">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="contact-name" className="mb-2 block text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="contact-name"
                value={theme.contactName}
                onChange={(e) => updateTheme({ contactName: e.target.value })}
                placeholder="Enter contact name"
                className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
              />
            </div>
            
            <div>
              <Label className="mb-2 block text-sm font-medium">Avatar</Label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-14 w-14 ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50">
                    {theme.contactAvatar ? (
                      <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                      {getInitials(theme.contactName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  aria-label="Upload avatar image"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    className="gap-2 rounded-xl border-border/50 hover:bg-secondary/80"
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
                      className="rounded-xl text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Sender Bubbles */}
        <Section icon={<MessageCircle className="h-4 w-4" />} title="Your Messages" id="sender-heading">
          <div className="flex flex-col gap-4">
            <ColorPicker
              id="sender-bg"
              label="Bubble Color"
              value={theme.senderBubbleColor}
              onChange={(value) => updateTheme({ senderBubbleColor: value })}
            />
            <ColorPicker
              id="sender-text"
              label="Text Color"
              value={theme.senderTextColor}
              onChange={(value) => updateTheme({ senderTextColor: value })}
            />
            <BorderRadiusControl
              label="Corner Radius (px)"
              value={theme.senderBorderRadius}
              onChange={(value) => updateTheme({ senderBorderRadius: value })}
            />
            
            {/* Preview */}
            <div className="mt-2 flex justify-end">
              <div
                className="max-w-[80%] px-4 py-2.5 shadow-sm"
                style={{
                  backgroundColor: `hsl(${theme.senderBubbleColor})`,
                  color: `hsl(${theme.senderTextColor})`,
                  borderTopLeftRadius: `${theme.senderBorderRadius.topLeft}px`,
                  borderTopRightRadius: `${theme.senderBorderRadius.topRight}px`,
                  borderBottomRightRadius: `${theme.senderBorderRadius.bottomRight}px`,
                  borderBottomLeftRadius: `${theme.senderBorderRadius.bottomLeft}px`,
                }}
              >
                <span className="text-sm">Preview message</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Receiver Bubbles */}
        <Section icon={<MessageCircle className="h-4 w-4" />} title="Contact Messages" id="receiver-heading">
          <div className="flex flex-col gap-4">
            <ColorPicker
              id="receiver-bg"
              label="Bubble Color"
              value={theme.receiverBubbleColor}
              onChange={(value) => updateTheme({ receiverBubbleColor: value })}
            />
            <ColorPicker
              id="receiver-text"
              label="Text Color"
              value={theme.receiverTextColor}
              onChange={(value) => updateTheme({ receiverTextColor: value })}
            />
            <BorderRadiusControl
              label="Corner Radius (px)"
              value={theme.receiverBorderRadius}
              onChange={(value) => updateTheme({ receiverBorderRadius: value })}
            />
            
            {/* Preview */}
            <div className="mt-2 flex justify-start">
              <div
                className="max-w-[80%] px-4 py-2.5 shadow-sm"
                style={{
                  backgroundColor: `hsl(${theme.receiverBubbleColor})`,
                  color: `hsl(${theme.receiverTextColor})`,
                  borderTopLeftRadius: `${theme.receiverBorderRadius.topLeft}px`,
                  borderTopRightRadius: `${theme.receiverBorderRadius.topRight}px`,
                  borderBottomRightRadius: `${theme.receiverBorderRadius.bottomRight}px`,
                  borderBottomLeftRadius: `${theme.receiverBorderRadius.bottomLeft}px`,
                }}
              >
                <span className="text-sm">Preview message</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Chat Background */}
        <Section icon={<Palette className="h-4 w-4" />} title="Background" id="chat-heading">
          <ColorPicker
            id="chat-bg"
            label="Chat Background"
            value={theme.chatBackground}
            onChange={(value) => updateTheme({ chatBackground: value })}
          />
        </Section>

        {/* Typography */}
        <Section icon={<Type className="h-4 w-4" />} title="Typography" id="font-heading">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="font-size" className="text-sm font-medium">
                Message Size
              </Label>
              <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
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
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </Section>
      </div>
    </ScrollArea>
  );
}
