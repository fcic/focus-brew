import type React from "react"

interface DesktopProps {
  children: React.ReactNode
}

export function Desktop({ children }: DesktopProps) {
  return <div className="absolute inset-0 pt-7 pb-20 px-4 overflow-hidden">{children}</div>
}
