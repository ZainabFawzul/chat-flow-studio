import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, User, MessageCircle, Play, Settings, AlertTriangle, MousePointerClick } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { BubbleBorderRadius, DEFAULT_BORDER_RADIUS } from "@/types/scenario";
import { Switch } from "@/components/ui/switch";
import { getContrastLevel } from "@/lib/contrast";
const DEFAULT_SENDER_RADIUS: BubbleBorderRadius = {
  topLeft: 16,
  topRight: 4,
  bottomRight: 16,
  bottomLeft: 16
};
const DEFAULT_RECEIVER_RADIUS: BubbleBorderRadius = {
  topLeft: 4,
  topRight: 16,
  bottomRight: 16,
  bottomLeft: 16
};
interface BorderRadiusControlProps {
  label: string;
  value: BubbleBorderRadius;
  onChange: (value: BubbleBorderRadius) => void;
}
function BorderRadiusControl({
  label,
  value,
  onChange
}: BorderRadiusControlProps) {
  const corners = [{
    key: "topLeft" as const,
    label: "TOP LEFT"
  }, {
    key: "topRight" as const,
    label: "TOP RIGHT"
  }, {
    key: "bottomLeft" as const,
    label: "BOTTOM LEFT"
  }, {
    key: "bottomRight" as const,
    label: "BOTTOM RIGHT"
  }];
  return <div>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        {corners.map(({
        key,
        label: cornerLabel
      }) => <div key={key} className="flex-1 flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground font-medium text-center truncate">{cornerLabel}</span>
            <Input type="number" min={0} max={32} value={value[key]} onChange={e => onChange({
          ...value,
          [key]: Number(e.target.value)
        })} className="h-8 w-full text-center text-sm rounded-lg border-border/50 bg-secondary/30" />
          </div>)}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>0 = sharp</span>
        <span>32 = round</span>
      </div>
    </div>;
}
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  id: string;
}
function Section({
  icon,
  title,
  children,
  id
}: SectionProps) {
  return <section aria-labelledby={id} className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 id={id} className="text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>;
}
export function ThemeTab() {
  const {
    scenario,
    updateTheme
  } = useScenario();
  const {
    theme
  } = scenario;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fallback for legacy scenarios without border radius
  const senderRadius = theme.senderBorderRadius ?? DEFAULT_SENDER_RADIUS;
  const receiverRadius = theme.receiverBorderRadius ?? DEFAULT_RECEIVER_RADIUS;
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      updateTheme({
        contactAvatar: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };
  const getInitials = (name: string) => {
    return name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
  };
  return <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Contact Info */}
        <Section icon={<User className="h-4 w-4" />} title="Contact Info" id="contact-heading">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="contact-name" className="mb-2 block text-sm font-medium">
                Display Name
              </Label>
              <Input id="contact-name" value={theme.contactName} onChange={e => updateTheme({
              contactName: e.target.value
            })} placeholder="Enter contact name" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>
            
            <div>
              <Label className="mb-2 block text-sm font-medium">Avatar</Label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-14 w-14 ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50">
                    {theme.contactAvatar ? <AvatarImage src={theme.contactAvatar} alt={theme.contactName} /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                      {getInitials(theme.contactName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} aria-label="Upload avatar image" />
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="gap-2 rounded-xl border-border/50 hover:bg-secondary/80">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Upload
                  </Button>
                  
                  {theme.contactAvatar && <Button variant="ghost" size="sm" onClick={() => updateTheme({
                  contactAvatar: null
                })} aria-label="Remove avatar" className="rounded-xl text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Start Screen */}
        <Section icon={<Play className="h-4 w-4" />} title="Start Screen" id="start-screen-heading">
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="start-title" className="mb-2 block text-sm font-medium">
                Title
              </Label>
              <Input id="start-title" value={theme.startScreenTitle ?? "Ready to Start"} onChange={e => updateTheme({
              startScreenTitle: e.target.value
            })} placeholder="Ready to Start" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>
            
            <div>
              <Label htmlFor="start-subtitle" className="mb-2 block text-sm font-medium">
                Subtitle
              </Label>
              <Input id="start-subtitle" value={theme.startScreenSubtitle ?? "Begin the conversation"} onChange={e => updateTheme({
              startScreenSubtitle: e.target.value
            })} placeholder="Begin the conversation" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>
            
            <div>
              <Label htmlFor="start-button" className="mb-2 block text-sm font-medium">
                Button Text
              </Label>
              <Input id="start-button" value={theme.startButtonText ?? "Start"} onChange={e => updateTheme({
              startButtonText: e.target.value
            })} placeholder="Start" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>

            {/* Button Colors */}
            <div className="flex gap-md">
              <ColorPicker 
                id="start-btn-bg" 
                label="Button Color" 
                value={theme.startButtonColor ?? "214 100% 65%"} 
                onChange={value => updateTheme({ startButtonColor: value })} 
              />
              <ColorPicker 
                id="start-btn-text" 
                label="Button Text" 
                value={theme.startButtonTextColor ?? "0 0% 100%"} 
                onChange={value => updateTheme({ startButtonTextColor: value })} 
              />
            </div>

            {/* Contrast Warning */}
            <ContrastWarning 
              bgColor={theme.startButtonColor ?? "214 100% 65%"} 
              textColor={theme.startButtonTextColor ?? "0 0% 100%"} 
            />

            {/* Button Shape */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="start-btn-radius" className="text-sm font-medium">
                  Button Corner Radius
                </Label>
                <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                  {theme.startButtonBorderRadius ?? 12}px
                </span>
              </div>
              <Slider 
                id="start-btn-radius" 
                min={0} 
                max={24} 
                step={1} 
                value={[theme.startButtonBorderRadius ?? 12]} 
                onValueChange={([value]) => updateTheme({ startButtonBorderRadius: value })} 
                aria-label="Button border radius" 
                className="py-2" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Square</span>
                <span>Round</span>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-2 flex justify-center">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 font-medium"
                style={{
                  backgroundColor: `hsl(${theme.startButtonColor ?? '214 100% 65%'})`,
                  color: `hsl(${theme.startButtonTextColor ?? '0 0% 100%'})`,
                  borderRadius: `${theme.startButtonBorderRadius ?? 12}px`,
                  boxShadow: `0 4px 12px hsl(${theme.startButtonColor ?? '214 100% 65%'} / 0.25)`,
                }}
              >
                <Play className="h-4 w-4" />
                {theme.startButtonText ?? "Start"}
              </button>
            </div>
          </div>
        </Section>
        {/* Sender Bubbles */}
        <Section icon={<MessageCircle className="h-4 w-4" />} title="Your Messages" id="sender-heading">
          <div className="flex flex-col gap-[20px]">
            <div className="flex gap-md">
              <ColorPicker id="sender-bg" label="Bubble" value={theme.senderBubbleColor} onChange={value => updateTheme({
              senderBubbleColor: value
            })} />
              <ColorPicker id="sender-text" label="Text" value={theme.senderTextColor} onChange={value => updateTheme({
              senderTextColor: value
            })} />
            </div>
            
            {/* Contrast Warning */}
            <ContrastWarning bgColor={theme.senderBubbleColor} textColor={theme.senderTextColor} />
            
            <BorderRadiusControl label="Corner Radius (px)" value={senderRadius} onChange={value => updateTheme({
            senderBorderRadius: value
          })} />
            
            {/* Preview */}
            <div className="mt-2 flex justify-end">
              <div className="max-w-[80%] px-4 py-2.5 shadow-sm" style={{
              backgroundColor: `hsl(${theme.senderBubbleColor})`,
              color: `hsl(${theme.senderTextColor})`,
              borderTopLeftRadius: `${senderRadius.topLeft}px`,
              borderTopRightRadius: `${senderRadius.topRight}px`,
              borderBottomRightRadius: `${senderRadius.bottomRight}px`,
              borderBottomLeftRadius: `${senderRadius.bottomLeft}px`
            }}>
                <span className="text-sm">Preview message</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Receiver Bubbles */}
        <Section icon={<MessageCircle className="h-4 w-4" />} title="Contact Messages" id="receiver-heading">
          <div className="flex flex-col gap-[20px]">
            <div className="flex gap-md">
              <ColorPicker id="receiver-bg" label="Bubble" value={theme.receiverBubbleColor} onChange={value => updateTheme({
              receiverBubbleColor: value
            })} />
              <ColorPicker id="receiver-text" label="Text" value={theme.receiverTextColor} onChange={value => updateTheme({
              receiverTextColor: value
            })} />
            </div>
            
            {/* Contrast Warning */}
            <ContrastWarning bgColor={theme.receiverBubbleColor} textColor={theme.receiverTextColor} />
            
            <BorderRadiusControl label="Corner Radius (px)" value={receiverRadius} onChange={value => updateTheme({
            receiverBorderRadius: value
          })} />
            
            {/* Preview */}
            <div className="mt-2 flex justify-start">
              <div className="max-w-[80%] px-4 py-2.5 shadow-sm" style={{
              backgroundColor: `hsl(${theme.receiverBubbleColor})`,
              color: `hsl(${theme.receiverTextColor})`,
              borderTopLeftRadius: `${receiverRadius.topLeft}px`,
              borderTopRightRadius: `${receiverRadius.topRight}px`,
              borderBottomRightRadius: `${receiverRadius.bottomRight}px`,
              borderBottomLeftRadius: `${receiverRadius.bottomLeft}px`
            }}>
                <span className="text-sm">Preview message</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Response Panel */}
        <Section icon={<MousePointerClick className="h-4 w-4" />} title="Response Panel" id="response-panel-heading">
          <div className="flex flex-col gap-5">
            {/* Label Text */}
            <div>
              <Label htmlFor="response-label" className="mb-2 block text-sm font-medium">
                Label Text
              </Label>
              <Input
                id="response-label"
                value={theme.responsePanelLabelText ?? "Choose a response"}
                onChange={e => updateTheme({ responsePanelLabelText: e.target.value })}
                placeholder="Choose a response"
                className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
              />
            </div>

            {/* Panel Background & Label Color */}
            <div className="flex gap-md">
              <ColorPicker
                id="response-panel-bg"
                label="Panel Background"
                value={theme.responsePanelBackground ?? "0 0% 100%"}
                onChange={value => updateTheme({ responsePanelBackground: value })}
              />
              <ColorPicker
                id="response-label-color"
                label="Label Color"
                value={theme.responsePanelLabelColor ?? "220 9% 46%"}
                onChange={value => updateTheme({ responsePanelLabelColor: value })}
              />
            </div>

            {/* Option Bubble & Text */}
            <div className="flex gap-md">
              <ColorPicker
                id="response-option-bg"
                label="Option Background"
                value={theme.responseOptionBackground ?? "0 0% 100%"}
                onChange={value => updateTheme({ responseOptionBackground: value })}
              />
              <ColorPicker
                id="response-option-text"
                label="Option Text"
                value={theme.responseOptionTextColor ?? "220 9% 20%"}
                onChange={value => updateTheme({ responseOptionTextColor: value })}
              />
            </div>

            {/* Contrast Warning */}
            <ContrastWarning
              bgColor={theme.responseOptionBackground ?? "0 0% 100%"}
              textColor={theme.responseOptionTextColor ?? "220 9% 20%"}
            />

            {/* Option Border Radius */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="response-option-radius" className="text-sm font-medium">
                  Option Corner Radius
                </Label>
                <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                  {theme.responseOptionBorderRadius ?? 12}px
                </span>
              </div>
              <Slider
                id="response-option-radius"
                min={0}
                max={24}
                step={1}
                value={[theme.responseOptionBorderRadius ?? 12]}
                onValueChange={([value]) => updateTheme({ responseOptionBorderRadius: value })}
                aria-label="Response option border radius"
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Square</span>
                <span>Round</span>
              </div>
            </div>

            {/* Preview */}
            <div
              className="mt-2 p-4 border border-border/30"
              style={{
                backgroundColor: `hsl(${theme.responsePanelBackground ?? '0 0% 100%'})`,
                borderRadius: '12px',
              }}
            >
              <p
                className="mb-3 text-xs font-medium uppercase tracking-wide"
                style={{ color: `hsl(${theme.responsePanelLabelColor ?? '220 9% 46%'})` }}
              >
                {theme.responsePanelLabelText ?? "Choose a response"}
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-1.5 text-sm font-medium border border-border/50"
                  style={{
                    backgroundColor: `hsl(${theme.responseOptionBackground ?? '0 0% 100%'})`,
                    color: `hsl(${theme.responseOptionTextColor ?? '220 9% 20%'})`,
                    borderRadius: `${theme.responseOptionBorderRadius ?? 12}px`,
                  }}
                >
                  Option 1
                </span>
                <span
                  className="px-3 py-1.5 text-sm font-medium border border-border/50"
                  style={{
                    backgroundColor: `hsl(${theme.responseOptionBackground ?? '0 0% 100%'})`,
                    color: `hsl(${theme.responseOptionTextColor ?? '220 9% 20%'})`,
                    borderRadius: `${theme.responseOptionBorderRadius ?? 12}px`,
                  }}
                >
                  Option 2
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* Settings - merged Background, Typography, Controls */}
        <Section icon={<Settings className="h-4 w-4" />} title="Settings" id="settings-heading">
          <div className="flex flex-col gap-5">
            {/* Chat Background */}
            <ColorPicker id="chat-bg" label="Chat Background" value={theme.chatBackground} onChange={value => updateTheme({
              chatBackground: value
            })} />
            
            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="font-size" className="text-sm font-medium">
                  Message Size
                </Label>
                <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                  {theme.fontSize}px
                </span>
              </div>
              <Slider id="font-size" min={12} max={20} step={1} value={[theme.fontSize]} onValueChange={([value]) => updateTheme({
                fontSize: value
              })} aria-label="Font size" className="py-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>
            
            {/* Show Reset Button */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="show-reset" className="text-sm font-medium">
                  Show Reset Button
                </Label>
                <span className="text-xs text-muted-foreground">
                  Allow users to restart the conversation
                </span>
              </div>
              <Switch id="show-reset" checked={theme.showResetButton ?? true} onCheckedChange={checked => updateTheme({
                showResetButton: checked
              })} />
            </div>
          </div>
        </Section>
      </div>
    </ScrollArea>;
}

// Contrast warning component
function ContrastWarning({ bgColor, textColor }: { bgColor: string; textColor: string }) {
  const { ratio, level } = getContrastLevel(bgColor, textColor);
  
  if (level === "aa" || level === "aaa") return null;
  
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-destructive">
          Low contrast ({ratio.toFixed(1)}:1)
        </p>
        <p className="text-xs text-muted-foreground">
          {level === "aa-large" 
            ? "Only meets WCAG AA for large text. Increase contrast for better accessibility."
            : "Does not meet WCAG 2.1 AA standards. Adjust colors for accessibility."}
        </p>
      </div>
    </div>
  );
}