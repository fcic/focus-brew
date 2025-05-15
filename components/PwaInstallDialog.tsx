"use client";

import { useEffect, useRef } from "react";

export default function PwaInstallDialog() {
  const pwaRef = useRef<HTMLElement & { showDialog: () => void }>(null);

  useEffect(() => {
    import("@khmyznikov/pwa-install");
  }, []);

  useEffect(() => {
    if (pwaRef.current) {
      // Expose to window for global access
      // @ts-ignore
      window.pwaInstallDialog = pwaRef.current;
    }
  }, []);

  return (
    <pwa-install
      ref={pwaRef}
      manifest-url="/manifest.json"
      use-local-storage="true"
    />
  );
}
