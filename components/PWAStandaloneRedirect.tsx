"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PWAStandaloneRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone && pathname !== "/app") {
      router.replace("/app");
    }
  }, [pathname, router]);

  return null;
} 