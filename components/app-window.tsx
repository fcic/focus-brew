"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Minus, Square } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface AppWindowProps {
  id: string
  title: string
  children: React.ReactNode
  onClose: () => void
  onFocus: () => void
  zIndex: number
}

export function AppWindow({ id, title, children, onClose, onFocus, zIndex }: AppWindowProps) {
  const [position, setPosition] = useState({ x: 50 + zIndex * 20, y: 50 + zIndex * 20 })
  const [size, setSize] = useState({ width: 650, height: 450 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      onFocus()
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex + 10,
      }}
    >
      <Card
        ref={windowRef}
        className="h-full w-full shadow-xl rounded-xl overflow-hidden border border-zinc-200/30 dark:border-zinc-800/30 bg-background/90 backdrop-blur-md transition-shadow duration-200"
        onClick={onFocus}
      >
        <CardHeader
          className="p-0 cursor-move flex flex-row items-center h-9 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200/20 dark:border-zinc-800/20"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2 px-3 w-full">
            <div className="flex space-x-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-600 group"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                <X className="h-2 w-2 text-red-800 opacity-0 group-hover:opacity-100" />
                <span className="sr-only">Close</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-600 group"
              >
                <Minus className="h-2 w-2 text-yellow-800 opacity-0 group-hover:opacity-100" />
                <span className="sr-only">Minimize</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600 group"
              >
                <Square className="h-2 w-2 text-green-800 opacity-0 group-hover:opacity-100" />
                <span className="sr-only">Maximize</span>
              </Button>
            </div>
            <span className="text-xs font-medium text-center w-full">{title}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto" style={{ height: "calc(100% - 36px)" }}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}
