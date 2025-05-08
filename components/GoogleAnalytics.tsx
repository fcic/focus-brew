"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "";

  useEffect(() => {
    if (googleAnalyticsId && pathname) {
      // PageView tracking
      window.gtag?.("config", googleAnalyticsId, {
        page_path:
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams, googleAnalyticsId]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${googleAnalyticsId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
