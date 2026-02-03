/**
 * @file exportZip.ts
 * @description ZIP export functionality to generate standalone HTML chat scenarios for Articulate Rise
 *              and other authoring tools. Creates a self-contained package with embedded CSS/JS.
 *
 * @dependencies jszip, scenario types
 * @usage Called from TopBar when user clicks "Finalize" button
 */

import JSZip from "jszip";
import { ScenarioData } from "@/types/scenario";

export async function generateExportZip(scenario: ScenarioData): Promise<Blob> {
  const zip = new JSZip();

  // Generate the standalone HTML with embedded CSS and JS
  const html = generateStandaloneHTML(scenario);
  zip.file("index.html", html);

  // Add scenario data as JSON for reference
  zip.file("scenario.json", JSON.stringify(scenario, null, 2));

  // Add a readme file
  zip.file("README.txt", generateReadme(scenario.name));

  // If there's a custom avatar image, add it
  if (scenario.theme.contactAvatar) {
    // Extract base64 data and add as image file
    const avatarData = scenario.theme.contactAvatar;
    if (avatarData.startsWith("data:image")) {
      const [header, base64] = avatarData.split(",");
      const mimeMatch = header.match(/data:(image\/\w+);/);
      const extension = mimeMatch ? mimeMatch[1].split("/")[1] : "png";
      zip.file(`avatar.${extension}`, base64, { base64: true });
    }
  }

  return zip.generateAsync({ type: "blob" });
}

function generateReadme(scenarioName: string): string {
  return `${scenarioName} - Chat Scenario Export
=====================================

Thank you so much for using Chatatouille!

This folder contains a self-contained chat scenario that can be embedded in
Articulate Rise, Parta.io, or any authoring tool that lets you upload ZIP packages.

FILES INCLUDED:
- index.html: The complete interactive chat scenario. This is a standard template.
- scenario.json: Raw scenario data for reference or reimport. This file is the identity of your chat interaction.

HOW TO USE IN ARTICULATE RISE:
1. Upload this entire ZIP folder to the Rise code block.

HOW TO USE IN OTHER TOOLS:
- If they allow for ZIP folder uploads, do the same method as above.
- If not, you'll need to host the html and json files and link to them. 

NOTES:
- The chat is fully self-contained with no external dependencies.
- Works offline once loaded. 
- Responsive design adapts to container size. 

Made with ❤ by Chatatouille, a chat scenario builder tool created by Zainab Fawzul & Lovable. 
`;
}

function generateStandaloneHTML(scenario: ScenarioData): string {
  const { theme, messages, variables, rootMessageId, name } = scenario;

  // Start screen text with fallbacks
  const startTitle = theme.startScreenTitle ?? "Ready to Start";
  const startSubtitle = theme.startScreenSubtitle ?? "Begin the conversation";
  const startButtonText = theme.startButtonText ?? "Start";
  const startButtonColor = theme.startButtonColor ?? "214 100% 65%";
  const startButtonTextColor = theme.startButtonTextColor ?? "0 0% 100%";
  const startButtonBorderRadius = theme.startButtonBorderRadius ?? 12;
  const showResetButton = theme.showResetButton ?? true;

  // Conversation type and Rise integration
  const conversationType = theme.conversationType ?? "chat";
  const isRegularMode = conversationType === "regular";
  const enableRiseCompletion = theme.enableRiseCompletion ?? false;

  // Escape for safe JSON embedding in script
  const scenarioJSON = JSON.stringify({ messages, variables, rootMessageId, theme });

  // Response panel theming with fallbacks
  const responsePanelBackground = theme.responsePanelBackground ?? "0 0% 100%";
  const responsePanelLabelColor = theme.responsePanelLabelColor ?? "220 9% 46%";
  const responsePanelLabelText = theme.responsePanelLabelText ?? "Choose a response";
  const responseOptionBackground = theme.responseOptionBackground ?? "0 0% 100%";
  const responseOptionTextColor = theme.responseOptionTextColor ?? "220 9% 20%";
  const responseOptionBorderRadius = theme.responseOptionBorderRadius ?? 12;

  // Frame settings
  const framePreset = theme.framePreset ?? 'none';
  const frameBorderRadius = theme.frameBorderRadius ?? 16;
  const frameBorderWidth = theme.frameBorderWidth ?? 1;
  const frameBorderColor = theme.frameBorderColor ?? "220 13% 91%";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(name)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 100%;
    }

    body {
      font-family: ${theme.fontFamily};
      font-size: clamp(0.875rem, 2.5vw, 1.125rem);
      line-height: 1.6;
      background-color: transparent;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      ${framePreset !== 'none' ? 'align-items: center; justify-content: center; padding: 1rem;' : ''}
    }

    /* Skip link for keyboard navigation */
    .skip-link {
      position: absolute;
      top: -3rem;
      left: 0;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      z-index: 100;
      text-decoration: none;
      font-weight: 500;
      border-radius: 0 0 0.5rem 0;
    }
    .skip-link:focus {
      top: 0;
      outline: 2px solid #1d4ed8;
      outline-offset: 2px;
    }

    /* Screen reader only utility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Focus indicators for all interactive elements */
    *:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }

    /* Device frame wrapper */
    .device-frame {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .device-frame.phone {
      position: relative;
      background: #1a1a1a;
      border-radius: 44px;
      padding: 10px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 380px;
      max-width: 100%;
      aspect-ratio: 9 / 18;
      max-height: 100%;
    }

    .device-frame.phone .frame-inner {
      position: absolute;
      inset: 10px;
      border-radius: 36px;
      overflow: hidden;
      background: black;
    }

    .device-frame.phone .chat-container {
      height: 100%;
      width: 100%;
      border-radius: 36px;
    }

    /* Phone side buttons */
    .phone-button-left-1 {
      position: absolute;
      left: -3px;
      top: 112px;
      width: 3px;
      height: 32px;
      background: #2a2a2a;
      border-radius: 2px 0 0 2px;
    }
    .phone-button-left-2 {
      position: absolute;
      left: -3px;
      top: 160px;
      width: 3px;
      height: 56px;
      background: #2a2a2a;
      border-radius: 2px 0 0 2px;
    }
    .phone-button-left-3 {
      position: absolute;
      left: -3px;
      top: 224px;
      width: 3px;
      height: 56px;
      background: #2a2a2a;
      border-radius: 2px 0 0 2px;
    }
    .phone-button-right {
      position: absolute;
      right: -3px;
      top: 144px;
      width: 3px;
      height: 80px;
      background: #2a2a2a;
      border-radius: 0 2px 2px 0;
    }
    .phone-home-indicator {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: 112px;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      z-index: 20;
    }

    .device-frame.tablet {
      position: relative;
      background: #1a1a1a;
      border-radius: 24px;
      padding: 8px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 600px;
      aspect-ratio: 4 / 3;
      max-height: 100%;
    }

    .device-frame.tablet .frame-inner {
      position: absolute;
      inset: 8px;
      border-radius: 16px;
      overflow: hidden;
      background: black;
    }

    .device-frame.tablet .chat-container {
      height: 100%;
      width: 100%;
      border-radius: 16px;
    }

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      max-width: ${framePreset === 'none' ? '37.5rem' : '100%'};
      margin: 0 auto;
      width: 100%;
      background: hsl(${theme.chatBackground});
      box-shadow: ${framePreset === 'none' ? '0 0 1.25rem #0000001a' : 'none'};
      ${framePreset === 'none' ? `border-radius: ${frameBorderRadius / 16}rem; border: ${frameBorderWidth}px solid hsl(${frameBorderColor});` : ''}
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
    }

    .avatar {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      background: linear-gradient(135deg, hsl(${theme.avatarBackgroundColor ?? "214 100% 65%"}), hsl(${theme.avatarBackgroundColor ?? "214 100% 65%"} / 0.7));
      color: hsl(${theme.avatarTextColor ?? "0 0% 100%"});
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .header-info {
      flex: 1;
      min-width: 0;
    }

    .header-name {
      font-weight: 600;
      color: #1f2937;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-status {
      font-size: 0.75rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .status-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .reset-btn {
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      background: white;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .reset-btn:hover {
      background: #f3f4f6;
    }

    .reset-btn:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-row {
      display: flex;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(0.625rem); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-row.user {
      justify-content: flex-end;
    }

    .message-row.contact {
      justify-content: flex-start;
    }

    .message-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      margin-right: 0.75rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.6875rem;
      background: linear-gradient(135deg, hsl(${theme.avatarBackgroundColor ?? "214 100% 65%"}), hsl(${theme.avatarBackgroundColor ?? "214 100% 65%"} / 0.7));
      color: hsl(${theme.avatarTextColor ?? "0 0% 100%"});
    }

    .message-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .message-bubble {
      max-width: 75%;
      padding: 0.625rem 1rem;
      box-shadow: 0 1px 2px #0000000d;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .message-bubble.contact {
      background: hsl(${theme.receiverBubbleColor});
      color: hsl(${theme.receiverTextColor});
      border-top-left-radius: ${(theme.receiverBorderRadius?.topLeft ?? 4) / 16}rem;
      border-top-right-radius: ${(theme.receiverBorderRadius?.topRight ?? 16) / 16}rem;
      border-bottom-right-radius: ${(theme.receiverBorderRadius?.bottomRight ?? 16) / 16}rem;
      border-bottom-left-radius: ${(theme.receiverBorderRadius?.bottomLeft ?? 16) / 16}rem;
    }

    .message-bubble.user {
      background: hsl(${theme.senderBubbleColor});
      color: hsl(${theme.senderTextColor});
      border-top-left-radius: ${(theme.senderBorderRadius?.topLeft ?? 16) / 16}rem;
      border-top-right-radius: ${(theme.senderBorderRadius?.topRight ?? 4) / 16}rem;
      border-bottom-right-radius: ${(theme.senderBorderRadius?.bottomRight ?? 16) / 16}rem;
      border-bottom-left-radius: ${(theme.senderBorderRadius?.bottomLeft ?? 16) / 16}rem;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
    }

    .typing-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: hsl(${theme.receiverTextColor} / 0.5);
      animation: typingBounce 0.6s infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .typing-dot:nth-child(3) { animation-delay: 0.3s; }

    @keyframes typingBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-0.25rem); }
    }

    .end-indicator {
      text-align: center;
      padding: 1rem;
    }

    .end-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border-radius: 2rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .end-badge-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: #10b981;
    }

    .response-options {
      border-top: 1px solid #e5e7eb;
      padding: 1rem;
      background: hsl(${responsePanelBackground});
    }

    .options-label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: hsl(${responsePanelLabelColor});
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .options-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .option-btn {
      padding: 0.5rem 1rem;
      border-radius: ${responseOptionBorderRadius / 16}rem;
      border: 1px solid #e5e7eb;
      background: hsl(${responseOptionBackground});
      color: hsl(${responseOptionTextColor});
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .option-btn:hover {
      background: hsl(${theme.senderBubbleColor});
      color: hsl(${theme.senderTextColor});
      border-color: hsl(${theme.senderBubbleColor});
    }

    .option-btn:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    }

    .option-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .start-screen {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .start-content {
      text-align: center;
      max-width: 17.5rem;
    }

    .start-icon {
      width: 5rem;
      height: 5rem;
      border-radius: 1.5rem;
      background: #f3f4f6;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .start-icon svg {
      width: 2.5rem;
      height: 2.5rem;
      color: #9ca3af;
    }

    .start-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .start-text {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.25rem;
    }

    .start-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: ${startButtonBorderRadius / 16}rem;
      border: none;
      background: hsl(${startButtonColor});
      color: hsl(${startButtonTextColor});
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 0.25rem 0.75rem hsl(${startButtonColor} / 0.25);
      transition: all 0.2s;
    }

    .start-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 0.375rem 1rem hsl(${startButtonColor} / 0.3);
    }

    .start-btn:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    }

    .start-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Mobile responsive adjustments */
    @media (max-width: 480px) {
      .chat-header {
        padding: 0.625rem 0.75rem;
        gap: 0.625rem;
      }
      .chat-messages {
        padding: 0.75rem;
        gap: 0.75rem;
      }
      .response-options {
        padding: 0.75rem;
      }
      .message-bubble {
        max-width: 85%;
      }
      .avatar {
        width: 2.25rem;
        height: 2.25rem;
      }
      .message-avatar {
        width: 1.75rem;
        height: 1.75rem;
        margin-right: 0.5rem;
      }
      .start-content {
        padding: 1rem;
      }
      .reset-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
      }
    }

    /* Regular mode - minimal reset button */
    .regular-reset-bar {
      display: flex;
      justify-content: flex-end;
      padding: 0.5rem;
    }

    .regular-reset-btn {
      padding: 0.375rem 0.75rem;
      border-radius: 0.75rem;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      transition: all 0.2s;
    }

    .regular-reset-btn:hover {
      color: #1f2937;
      background: #f3f4f6;
    }

    .regular-reset-btn:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <!-- Skip link for keyboard users -->
  <a href="#messages-area" class="skip-link" id="skip-link">Skip to conversation</a>
  
  ${framePreset === 'phone' ? `
  <div class="device-frame phone">
    <div class="frame-inner">
      <div class="chat-container" id="app" role="region" aria-label="Interactive chat conversation with ${escapeHTML(theme.contactName)}"></div>
    </div>
    <div class="phone-button-left-1"></div>
    <div class="phone-button-left-2"></div>
    <div class="phone-button-left-3"></div>
    <div class="phone-button-right"></div>
    <div class="phone-home-indicator"></div>
  </div>
  ` : framePreset === 'tablet' ? `
  <div class="device-frame tablet">
    <div class="frame-inner">
      <div class="chat-container" id="app" role="region" aria-label="Interactive chat conversation with ${escapeHTML(theme.contactName)}"></div>
    </div>
  </div>
  ` : `
  <div class="chat-container" id="app" role="region" aria-label="Interactive chat conversation with ${escapeHTML(theme.contactName)}"></div>
  `}
  
  <!-- Hidden live region for screen reader announcements -->
  <div aria-live="assertive" aria-atomic="true" class="sr-only" id="status-announcer"></div>

  <script>
    (function() {
      const scenario = ${scenarioJSON};
      const { messages, variables, rootMessageId, theme } = scenario;

      let chatHistory = [];
      let currentMessageId = null;
      let isPlaying = false;
      let isTyping = false;
      let variableState = {};

      // Customizable text
      const startTitle = ${JSON.stringify(startTitle)};
      const startSubtitle = ${JSON.stringify(startSubtitle)};
      const startButtonText = ${JSON.stringify(startButtonText)};
      const showResetButton = ${JSON.stringify(showResetButton)};
      
      // Conversation type and Rise integration
      const isRegularMode = ${JSON.stringify(isRegularMode)};
      const enableRiseCompletion = ${JSON.stringify(enableRiseCompletion)};
      
      // Rise 360 completion notification
      function notifyRiseCompletion() {
        if (enableRiseCompletion) {
          try {
            window.parent.postMessage({ type: 'complete' }, '*');
          } catch (e) {
            console.log('Rise completion notification sent');
          }
        }
      }

      // Initialize variable state from defaults
      Object.values(variables || {}).forEach(v => {
        variableState[v.id] = v.defaultValue;
      });

      function getInitials(name) {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      }

      function checkCondition(condition) {
        if (!condition) return true;
        return variableState[condition.variableId] === condition.requiredValue;
      }

      function applyVariableAssignment(assignment) {
        if (assignment) {
          variableState[assignment.variableId] = assignment.value;
        }
      }

      function getVisibleOptions(message) {
        if (!message || !message.responseOptions) return [];
        return message.responseOptions.filter(opt => checkCondition(opt.condition));
      }

      // Frame preset
      const framePreset = ${JSON.stringify(framePreset)};

      // Announce status changes to screen readers
      function announceStatus(message) {
        const announcer = document.getElementById('status-announcer');
        if (announcer) {
          announcer.textContent = '';
          setTimeout(function() { announcer.textContent = message; }, 50);
        }
      }

      // Check for auto-advance (message with no responses but has direct connection)
      function checkAutoAdvance(msg, callback) {
        if (msg && msg.responseOptions.length === 0 && !msg.isEndpoint && msg.nextMessageId) {
          const nextMsg = messages[msg.nextMessageId];
          if (nextMsg && checkCondition(nextMsg.condition)) {
            setTimeout(function() {
              currentMessageId = msg.nextMessageId;
              addContactMessage(msg.nextMessageId, nextMsg.content, callback);
            }, isRegularMode ? 500 : 300);
            return true;
          }
        }
        return false;
      }

      // Focus management helper
      function focusElement(selector, fallbackSelector) {
        setTimeout(function() {
          const el = document.querySelector(selector);
          if (el) {
            el.focus();
          } else if (fallbackSelector) {
            const fallback = document.querySelector(fallbackSelector);
            if (fallback) fallback.focus();
          }
        }, 100);
      }

      function escapeForAriaLabel(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }

      function render() {
        const app = document.getElementById('app');
        const currentMessage = currentMessageId ? messages[currentMessageId] : null;
        const rootMessage = rootMessageId ? messages[rootMessageId] : null;

        const visibleOptions = getVisibleOptions(currentMessage);
        // Only ended if: endpoint OR (no visible responses AND no direct connection)
        const isEnded = isPlaying && currentMessage && !isTyping &&
          (currentMessage.isEndpoint || (visibleOptions.length === 0 && !currentMessage.nextMessageId));
        const isDeadEnd = isPlaying && !currentMessageId && chatHistory.length > 0 && !isTyping;

        // Update aria-label with contact name
        app.setAttribute('aria-label', 'Chat conversation with ' + theme.contactName);

        let html = '';

        // Header - only show in chat mode
        if (!isRegularMode) {
          html += '<header class="chat-header">';
          html += '<div class="avatar" aria-hidden="true">';
          if (theme.contactAvatar) {
            html += '<img src="' + theme.contactAvatar + '" alt="">';
          } else {
            html += getInitials(theme.contactName);
          }
          html += '</div>';
          html += '<div class="header-info">';
          html += '<div class="header-name">' + theme.contactName + '</div>';
          html += '<div class="header-status" aria-live="polite">';
          html += '<span class="status-dot" aria-hidden="true"></span>';
          html += '<span>' + (isPlaying ? 'Active now' : 'Click Start to begin') + '</span>';
          html += '</div></div>';
          if (isPlaying && showResetButton) {
            html += '<button class="reset-btn" onclick="handleReset()" aria-label="Reset conversation">↻ Reset</button>';
          }
          html += '</header>';
        } else if (isPlaying && showResetButton) {
          // Minimal reset button for regular mode
          html += '<div class="regular-reset-bar">';
          html += '<button class="regular-reset-btn" onclick="handleReset()" aria-label="Reset conversation">↻ Reset</button>';
          html += '</div>';
        }

        if (!isPlaying) {
          // Start screen
          html += '<main class="start-screen"><div class="start-content">';
          html += '<div class="start-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>';
          html += '<h1 class="start-title">' + (rootMessage ? startTitle : 'No Messages') + '</h1>';
          html += '<p class="start-text">' + (rootMessage ? startSubtitle : 'This scenario has no messages') + '</p>';
          html += '<button class="start-btn" id="start-btn" onclick="handleStart()" aria-label="Start conversation"' + (!rootMessage ? ' disabled aria-disabled="true"' : '') + '>';
          html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
          html += startButtonText;
          html += '</button></div></main>';
        } else {
          // Messages area with log role for screen readers
          html += '<main class="chat-messages" role="log" aria-live="polite" aria-atomic="false" aria-label="Conversation messages" tabindex="-1" id="messages-area">';
          chatHistory.forEach(function(bubble) {
            const senderName = bubble.isUser ? 'You' : theme.contactName;
            const bubbleContent = bubble.content || 'Empty message';
            const ariaLabel = senderName + ' said: ' + escapeForAriaLabel(bubbleContent);
            
            html += '<div class="message-row ' + (bubble.isUser ? 'user' : 'contact') + '" role="article" aria-label="' + ariaLabel + '">';
            // Show avatar only in chat mode
            if (!bubble.isUser && !isRegularMode) {
              html += '<div class="message-avatar" aria-hidden="true">';
              if (theme.contactAvatar) {
                html += '<img src="' + theme.contactAvatar + '" alt="">';
              } else {
                html += getInitials(theme.contactName);
              }
              html += '</div>';
            }
            html += '<div class="message-bubble ' + (bubble.isUser ? 'user' : 'contact') + '">';
            html += bubble.content || '<em style="opacity:0.6">Empty message</em>';
            html += '</div></div>';
          });

          // Typing indicator - only in chat mode
          if (isTyping && !isRegularMode) {
            html += '<div class="message-row contact" role="status" aria-label="' + theme.contactName + ' is typing">';
            html += '<div class="message-avatar" aria-hidden="true">';
            if (theme.contactAvatar) {
              html += '<img src="' + theme.contactAvatar + '" alt="">';
            } else {
              html += getInitials(theme.contactName);
            }
            html += '</div>';
            html += '<div class="message-bubble contact"><div class="typing-indicator" aria-hidden="true">';
            html += '<span class="typing-dot"></span>';
            html += '<span class="typing-dot"></span>';
            html += '<span class="typing-dot"></span>';
            html += '</div><span class="sr-only">' + theme.contactName + ' is typing</span></div></div>';
          }

          if (isEnded || isDeadEnd) {
            html += '<div class="end-indicator" role="status"><span class="end-badge">';
            html += '<span class="end-badge-dot" aria-hidden="true"></span>';
            html += isEnded ? 'Conversation Complete' : 'End of Branch';
            html += '</span></div>';
          }
          html += '</main>';

          // Response options (hide while typing)
          if (currentMessage && !currentMessage.isEndpoint && visibleOptions.length > 0 && !isTyping) {
            html += '<nav class="response-options" role="group" aria-labelledby="options-label" aria-describedby="options-instruction">';
            html += '<p class="options-label" id="options-label">' + ${JSON.stringify(responsePanelLabelText)} + '</p>';
            html += '<p class="sr-only" id="options-instruction">Use Tab to navigate between options, Enter or Space to select</p>';
            html += '<div class="options-container" role="list">';
            visibleOptions.forEach(function(opt, index) {
              html += '<button class="option-btn" role="listitem" id="option-' + opt.id + '" onclick="handleSelect(\\'' + opt.id + '\\')"' + (!opt.text ? ' disabled aria-disabled="true"' : '') + ' aria-label="Respond with: ' + escapeForAriaLabel(opt.text || 'Empty option') + '">';
              html += opt.text || 'Empty option';
              html += '</button>';
            });
            html += '</div></nav>';
          }
        }

        app.innerHTML = html;
      }

      function addContactMessage(messageId, content, callback) {
        const msg = messages[messageId];
        
        if (isRegularMode) {
          // In regular mode, show message immediately without typing indicator
          chatHistory.push({
            id: messageId,
            content: content,
            isUser: false
          });
          announceStatus('New message');
          render();
          
          // Check for auto-advance before calling callback
          if (!checkAutoAdvance(msg, callback)) {
            if (callback) callback();
            focusElement('.option-btn', '#messages-area');
          }
        } else {
          // In chat mode, show typing indicator first
          isTyping = true;
          announceStatus(theme.contactName + ' is typing');
          render();
          
          setTimeout(function() {
            chatHistory.push({
              id: messageId,
              content: content,
              isUser: false
            });
            isTyping = false;
            announceStatus('New message from ' + theme.contactName);
            render();
            
            // Check for auto-advance before calling callback
            if (!checkAutoAdvance(msg, callback)) {
              if (callback) callback();
              // Focus first option if available, otherwise focus messages area
              focusElement('.option-btn', '#messages-area');
            }
          }, 1000);
        }
      }

      window.handleStart = function() {
        if (!rootMessageId || !messages[rootMessageId]) return;
        
        // Reset variable state
        Object.values(variables || {}).forEach(function(v) {
          variableState[v.id] = v.defaultValue;
        });

        isPlaying = true;
        chatHistory = [];
        currentMessageId = rootMessageId;
        
        announceStatus('Conversation started with ' + theme.contactName);
        
        // Show typing indicator, then message
        addContactMessage(rootMessageId, messages[rootMessageId].content);
      };

      window.handleReset = function() {
        isPlaying = false;
        isTyping = false;
        chatHistory = [];
        currentMessageId = null;
        
        // Reset variable state
        Object.values(variables || {}).forEach(function(v) {
          variableState[v.id] = v.defaultValue;
        });
        
        announceStatus('Conversation reset');
        render();
        
        // Focus start button after reset
        focusElement('#start-btn');
      };

      window.handleSelect = function(optionId) {
        const currentMessage = messages[currentMessageId];
        if (!currentMessage) return;

        const option = currentMessage.responseOptions.find(function(o) { return o.id === optionId; });
        if (!option) return;

        // Apply variable assignment
        applyVariableAssignment(option.setsVariable);

        // Add user response immediately
        chatHistory.push({
          id: 'user-' + optionId,
          content: option.text,
          isUser: true
        });
        announceStatus('You said: ' + option.text);
        render();

        // Add next message with typing indicator if exists
        if (option.nextMessageId && messages[option.nextMessageId]) {
          const nextMsg = messages[option.nextMessageId];
          // Check if next message meets its condition
          if (checkCondition(nextMsg.condition)) {
            currentMessageId = option.nextMessageId;
            addContactMessage(option.nextMessageId, nextMsg.content, function() {
              // Check if this new message is an endpoint
              const newCurrentMessage = messages[option.nextMessageId];
              if (newCurrentMessage && (newCurrentMessage.isEndpoint || getVisibleOptions(newCurrentMessage).length === 0)) {
                notifyRiseCompletion();
              }
            });
          } else {
            currentMessageId = null;
            announceStatus('End of conversation branch');
            notifyRiseCompletion();
            render();
          }
        } else {
          currentMessageId = null;
          announceStatus('Conversation complete');
          notifyRiseCompletion();
          render();
        }
      };

      // Keyboard event handling
      document.addEventListener('keydown', function(e) {
        // Escape to reset conversation
        if (e.key === 'Escape' && isPlaying) {
          handleReset();
        }
      });

      // Skip link click handler - focus messages area
      document.getElementById('skip-link').addEventListener('click', function(e) {
        e.preventDefault();
        const messagesArea = document.getElementById('messages-area');
        if (messagesArea) {
          messagesArea.focus();
        } else {
          // If no messages yet, focus start button
          focusElement('#start-btn');
        }
      });

      render();
      
      // Set initial focus to start button
      focusElement('#start-btn');
    })();
  </script>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
