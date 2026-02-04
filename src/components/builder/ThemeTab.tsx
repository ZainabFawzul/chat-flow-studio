/**
 * @file ThemeTab.tsx
 * @description Theme customization panel for colors, typography, bubble styling, and start screen settings.
 *              Includes WCAG contrast warnings and live previews.
 * 
 * @dependencies ScenarioContext, contrast utilities, ColorPicker, UI components
 * @usage Rendered in LeftPanel Theme tab
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, User, MessageCircle, Play, AlertTriangle, MousePointerClick, Smartphone, Tablet, Square, MessageSquare, FileText, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
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
              <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} aria-label="Upload avatar image" />
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Avatar preview */}
                <div className="relative group shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-border/50 ring-offset-1 ring-offset-background transition-all group-hover:ring-primary/50">
                    {theme.contactAvatar ? <AvatarImage src={theme.contactAvatar} alt={theme.contactName} /> : null}
                    <AvatarFallback className="font-semibold text-sm" style={{
                    backgroundColor: `hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'})`,
                    color: `hsl(${theme.avatarTextColor ?? '0 0% 100%'})`
                  }}>
                      {getInitials(theme.contactName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Upload button */}
                <Button variant="secondary" size="sm" onClick={() => avatarInputRef.current?.click()} className="gap-1.5 rounded-lg h-8 px-2.5 shrink-0">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  Upload
                </Button>
                
                {/* Remove button (only when image uploaded) */}
                {theme.contactAvatar && <Button variant="ghost" size="sm" onClick={() => updateTheme({
                contactAvatar: null
              })} aria-label="Remove avatar" className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>}
                
                {/* Color pickers (only when no custom image) */}
                {!theme.contactAvatar && <>
                    <span className="text-xs font-medium text-muted-foreground mx-1 shrink-0">OR</span>
                    <ColorPicker id="avatar-bg" label="Background" value={theme.avatarBackgroundColor ?? "221 83% 40%"} onChange={value => updateTheme({
                  avatarBackgroundColor: value
                })} />
                    <ColorPicker id="avatar-text" label="Text" value={theme.avatarTextColor ?? "0 0% 100%"} onChange={value => updateTheme({
                  avatarTextColor: value
                })} />
                  </>}
              </div>
              
              {/* Contrast Warning */}
              {!theme.contactAvatar && <div className="mt-3">
                  <ContrastWarning bgColor={theme.avatarBackgroundColor ?? "221 83% 40%"} textColor={theme.avatarTextColor ?? "0 0% 100%"} />
                </div>}
            </div>
          </div>
        </Section>

        {/* Start Screen */}
        <Section icon={<Play className="h-4 w-4" />} title="Start Screen" id="start-screen-heading">
          <div className="flex flex-col gap-5">
            {/* Colors Row */}
            <div className="flex flex-wrap items-center gap-3">
              <ColorPicker id="chat-bg" label="Background" value={theme.chatBackground} onChange={value => updateTheme({
              chatBackground: value
            })} />
              <ColorPicker id="title-color" label="Title Text" value={theme.startScreenTitleColor ?? "222 47% 11%"} onChange={value => updateTheme({
              startScreenTitleColor: value
            })} />
              <ColorPicker id="subtitle-color" label="Subtitle Text" value={theme.startScreenSubtitleColor ?? "220 9% 46%"} onChange={value => updateTheme({
              startScreenSubtitleColor: value
            })} />
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="start-title" className="mb-2 block text-sm font-medium">
                Title
              </Label>
              <Input id="start-title" value={theme.startScreenTitle ?? "Ready to Start"} onChange={e => updateTheme({
              startScreenTitle: e.target.value
            })} placeholder="Ready to Start" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>
            
            {/* Subtitle */}
            <div>
              <Label htmlFor="start-subtitle" className="mb-2 block text-sm font-medium">
                Subtitle
              </Label>
              <textarea id="start-subtitle" value={theme.startScreenSubtitle ?? "Begin the conversation"} onChange={e => updateTheme({
              startScreenSubtitle: e.target.value
            })} placeholder="Begin the conversation" rows={2} className="w-full rounded-xl border border-border/50 bg-secondary/30 focus:bg-background transition-colors px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
            </div>
            
            {/* Button Label */}
            <div>
              <Label htmlFor="start-button" className="mb-2 block text-sm font-medium">
                Button Label
              </Label>
              <Input id="start-button" value={theme.startButtonText ?? "Start"} onChange={e => updateTheme({
              startButtonText: e.target.value
            })} placeholder="Start" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>

            {/* Button Style */}
            <div>
              <Label className="mb-3 block text-sm font-medium">Button Style</Label>
              <div className="flex flex-wrap items-center gap-3">
                <ColorPicker id="start-btn-bg" label="Fill" value={theme.startButtonColor ?? "221 83% 40%"} onChange={value => updateTheme({
                startButtonColor: value
              })} />
                <ColorPicker id="start-btn-text" label="Text" value={theme.startButtonTextColor ?? "0 0% 100%"} onChange={value => updateTheme({
                startButtonTextColor: value
              })} />
                <div className="flex items-center gap-2">
                  <Label htmlFor="start-btn-radius" className="text-sm font-medium whitespace-nowrap">Roundness</Label>
                  <input id="start-btn-radius" type="range" min={0} max={20} value={theme.startButtonBorderRadius ?? 12} onChange={e => updateTheme({
                  startButtonBorderRadius: Number(e.target.value)
                })} className="w-20 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                  <span className="text-xs text-muted-foreground w-6">{theme.startButtonBorderRadius ?? 12}</span>
                </div>
              </div>
              <ContrastWarning bgColor={theme.startButtonColor ?? "221 83% 40%"} textColor={theme.startButtonTextColor ?? "0 0% 100%"} />
            </div>

            {/* Preview */}
            
          </div>
        </Section>
        {/* Frame Settings */}
        <Section icon={<Smartphone className="h-4 w-4" />} title="Frame" id="frame-heading">
          <div className="flex flex-col gap-5">
            
            {/* Conversation Type */}
            <div>
              <Label className="mb-3 block text-sm font-medium">Conversation Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {[{
                value: 'chat' as const,
                label: 'Chat',
                icon: MessageCircle,
                description: 'Header & typing indicator'
              }, {
                value: 'regular' as const,
                label: 'Regular',
                icon: FileText,
                description: 'Clean, no header'
              }].map(({
                value,
                label,
                icon: Icon,
                description
              }) => <button key={value} onClick={() => updateTheme({
                conversationType: value
              })} className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center", (theme.conversationType ?? 'chat') === value ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-border hover:bg-secondary/30 text-muted-foreground")}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-[10px] opacity-70">{description}</span>
                  </button>)}
              </div>
            </div>

            {/* Device Frame */}
            <div>
              <Label className="mb-3 block text-sm font-medium">Device Frame</Label>
              <div className="grid grid-cols-3 gap-2">
                {[{
                value: 'none' as const,
                label: 'None',
                icon: Square
              }, {
                value: 'phone' as const,
                label: 'Phone',
                icon: Smartphone
              }, {
                value: 'tablet' as const,
                label: 'Tablet',
                icon: Tablet
              }].map(({
                value,
                label,
                icon: Icon
              }) => <button key={value} onClick={() => updateTheme({
                framePreset: value
              })} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all", (theme.framePreset ?? 'none') === value ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-border hover:bg-secondary/30 text-muted-foreground")}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>)}
              </div>
            </div>

            {/* Rise 360 Integration */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rise-completion" className="text-sm font-medium">
                    Rise 360 Completion
                  </Label>
                  
                </div>
                <span className="text-xs text-muted-foreground">Autocomplete the next Continue Button in Articulate Rise.</span>
              </div>
              <Switch id="rise-completion" checked={theme.enableRiseCompletion ?? false} onCheckedChange={checked => updateTheme({
              enableRiseCompletion: checked
            })} />
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

            {/* Message Size */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="font-size" className="text-sm font-medium">
                  Message Size (px)
                </Label>
                <span className="text-xs text-muted-foreground">
                  Font size for chat messages
                </span>
              </div>
              <Input id="font-size" type="number" min={12} max={20} value={theme.fontSize} onChange={e => updateTheme({
              fontSize: Number(e.target.value)
            })} className="h-10 w-20 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors text-center" />
            </div>

            {/* Custom Frame Options - only show when preset is 'none' */}
            {(theme.framePreset ?? 'none') === 'none' && <>
                {/* Corner Radius */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="frame-radius" className="text-sm font-medium">
                      Corner Radius (px)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Frame border radius
                    </span>
                  </div>
                  <Input id="frame-radius" type="number" min={0} max={32} value={theme.frameBorderRadius ?? 16} onChange={e => updateTheme({
                frameBorderRadius: Number(e.target.value)
              })} className="h-10 w-20 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors text-center" />
                </div>

                {/* Border Width */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="frame-border-width" className="text-sm font-medium">
                      Border Width (px)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Frame border thickness
                    </span>
                  </div>
                  <Input id="frame-border-width" type="number" min={0} max={4} value={theme.frameBorderWidth ?? 1} onChange={e => updateTheme({
                frameBorderWidth: Number(e.target.value)
              })} className="h-10 w-20 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors text-center" />
                </div>

                {/* Border Color */}
                <ColorPicker id="frame-border-color" label="Border Color" value={theme.frameBorderColor ?? "220 13% 91%"} onChange={value => updateTheme({
              frameBorderColor: value
            })} />
                
                {/* Preview */}
                <div className="mt-2">
                  <div className="h-24 bg-secondary/30 flex items-center justify-center" style={{
                borderRadius: `${theme.frameBorderRadius ?? 16}px`,
                border: (theme.frameBorderWidth ?? 1) > 0 ? `${theme.frameBorderWidth ?? 1}px solid hsl(${theme.frameBorderColor ?? '220 13% 91%'})` : 'none'
              }}>
                    <span className="text-xs text-muted-foreground">Frame Preview</span>
                  </div>
                </div>
              </>}
            
          </div>
        </Section>

        {/* Sender Bubbles */}
        <Section icon={<MessageCircle className="h-4 w-4" />} title="Your Messages" id="sender-heading">
          <div className="flex flex-col gap-[20px]">
            <div className="flex gap-4">
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
            <div className="flex gap-4">
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
              <Input id="response-label" value={theme.responsePanelLabelText ?? "Choose a response"} onChange={e => updateTheme({
              responsePanelLabelText: e.target.value
            })} placeholder="Choose a response" className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>

            {/* Panel Background & Label Color */}
            <div className="flex gap-4">
              <ColorPicker id="response-panel-bg" label="Panel Background" value={theme.responsePanelBackground ?? "0 0% 100%"} onChange={value => updateTheme({
              responsePanelBackground: value
            })} />
              <ColorPicker id="response-label-color" label="Label Color" value={theme.responsePanelLabelColor ?? "220 9% 35%"} onChange={value => updateTheme({
              responsePanelLabelColor: value
            })} />
            </div>

            {/* Contrast Warning for Panel Label */}
            <ContrastWarning bgColor={theme.responsePanelBackground ?? "0 0% 100%"} textColor={theme.responsePanelLabelColor ?? "220 9% 35%"} />

            {/* Option Bubble & Text */}
            <div className="flex gap-4">
              <ColorPicker id="response-option-bg" label="Option Background" value={theme.responseOptionBackground ?? "0 0% 100%"} onChange={value => updateTheme({
              responseOptionBackground: value
            })} />
              <ColorPicker id="response-option-text" label="Option Text" value={theme.responseOptionTextColor ?? "222 47% 11%"} onChange={value => updateTheme({
              responseOptionTextColor: value
            })} />
            </div>

            {/* Contrast Warning */}
            <ContrastWarning bgColor={theme.responseOptionBackground ?? "0 0% 100%"} textColor={theme.responseOptionTextColor ?? "222 47% 11%"} />

            {/* Option Border Radius */}
            <div>
              <Label htmlFor="response-option-radius" className="mb-2 block text-sm font-medium">
                Option Corner Radius (px)
              </Label>
              <Input id="response-option-radius" type="number" min={0} max={24} value={theme.responseOptionBorderRadius ?? 12} onChange={e => updateTheme({
              responseOptionBorderRadius: Number(e.target.value)
            })} className="h-10 w-24 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors" />
            </div>

            {/* Text Alignment */}
            <div>
              <Label className="mb-3 block text-sm font-medium">Option Text Alignment</Label>
              <div className="grid grid-cols-3 gap-2">
                {[{
                value: 'left' as const,
                label: 'Left',
                icon: AlignLeft
              }, {
                value: 'center' as const,
                label: 'Center',
                icon: AlignCenter
              }, {
                value: 'right' as const,
                label: 'Right',
                icon: AlignRight
              }].map(({
                value,
                label,
                icon: Icon
              }) => <button key={value} onClick={() => updateTheme({
                responseOptionTextAlign: value
              })} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all", (theme.responseOptionTextAlign ?? 'center') === value ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-border hover:bg-secondary/30 text-muted-foreground")}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>)}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-2 p-4 border border-border/30" style={{
            backgroundColor: `hsl(${theme.responsePanelBackground ?? '0 0% 100%'})`,
            borderRadius: '12px'
          }}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide" style={{
              color: `hsl(${theme.responsePanelLabelColor ?? '220 9% 46%'})`
            }}>
                {theme.responsePanelLabelText ?? "Choose a response"}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-sm font-medium border border-border/50" style={{
                backgroundColor: `hsl(${theme.responseOptionBackground ?? '0 0% 100%'})`,
                color: `hsl(${theme.responseOptionTextColor ?? '220 9% 20%'})`,
                borderRadius: `${theme.responseOptionBorderRadius ?? 12}px`,
                textAlign: theme.responseOptionTextAlign ?? 'center'
              }}>
                  Option 1
                </span>
                <span className="px-3 py-1.5 text-sm font-medium border border-border/50" style={{
                backgroundColor: `hsl(${theme.responseOptionBackground ?? '0 0% 100%'})`,
                color: `hsl(${theme.responseOptionTextColor ?? '220 9% 20%'})`,
                borderRadius: `${theme.responseOptionBorderRadius ?? 12}px`,
                textAlign: theme.responseOptionTextAlign ?? 'center'
              }}>
                  Option 2
                </span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </ScrollArea>;
}

// Contrast warning component
function ContrastWarning({
  bgColor,
  textColor
}: {
  bgColor: string;
  textColor: string;
}) {
  const {
    ratio,
    level
  } = getContrastLevel(bgColor, textColor);
  if (level === "aa" || level === "aaa") return null;
  return <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-destructive">
          Low contrast ({ratio.toFixed(1)}:1)
        </p>
        <p className="text-xs text-muted-foreground">
          {level === "aa-large" ? "Only meets WCAG AA for large text. Increase contrast for better accessibility." : "Does not meet WCAG 2.1 AA standards. Adjust colors for accessibility."}
        </p>
      </div>
    </div>;
}