/**
 * @file MobileBlocker.tsx
 * @description Displays a message on mobile devices indicating the app requires widescreen
 *
 * @dependencies @fortawesome/react-fontawesome, @fortawesome/free-solid-svg-icons
 * @usage Wraps the main app content in App.tsx
 */

import { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartCrack } from "@fortawesome/free-solid-svg-icons";

interface MobileBlockerProps {
  children: ReactNode;
}

export function MobileBlocker({ children }: MobileBlockerProps) {
  return (
    <>
      {/* Mobile blocker - shown only on small screens */}
      <div className="flex md:hidden flex-col items-center justify-center min-h-screen px-8 text-center bg-background">
        <FontAwesomeIcon icon={faHeartCrack} className="text-6xl text-muted-foreground mb-6" />
        <p className="text-lg text-muted-foreground font-medium">
          Womp womp. Chatatouille is built for desktop use. Come back soon!
        </p>
      </div>

      {/* Main app - hidden on small screens, shown on md and up */}
      <div className="hidden md:contents">{children}</div>
    </>
  );
}
