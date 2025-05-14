import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "pwa-install": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "manifest-url"?: string;
        "use-local-storage"?: boolean;
        "externalPromptEvent"?: any;
      };
    }
  }
} 