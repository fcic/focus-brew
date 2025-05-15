/// <reference types="react" />

declare global {
  interface Window {
    pwaInstallDialog?: HTMLElement & {
      showDialog: (forced?: boolean) => void;
      install: () => void;
    };
    showPWAInstallDialog?: () => void;
    defferedPromptEvent?: any;
    _firefoxInstallHandler?: (e: MouseEvent) => void;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    "pwa-install": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "manifest-url"?: string;
      "use-local-storage"?: string;
      "disable-android-fallback"?: string;
      "manual-apple"?: string;
      "manual-chrome"?: string;
    };
  }
}

export {};
