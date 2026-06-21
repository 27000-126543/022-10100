import { useEffect, useRef } from "react";
import { X, Minus, Maximize2, Wind as WindowIcon, type LucideIcon } from "lucide-react";
import type { WindowKey } from "../../types";
import { useAppStore } from "../../stores/useAppStore";
import { cn } from "../../lib/utils";
import * as Icons from "lucide-react";

interface WindowFrameProps {
  windowKey: WindowKey;
  title: string;
  iconName: keyof typeof Icons;
  children: React.ReactNode;
}

export function WindowFrame({ windowKey, title, iconName, children }: WindowFrameProps) {
  const windows = useAppStore((s) => s.windows);
  const win = windows.find((w) => w.key === windowKey);
  const closeWindow = useAppStore((s) => s.closeWindow);
  const minimizeWindow = useAppStore((s) => s.minimizeWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const updateWindowPosition = useAppStore((s) => s.updateWindowPosition);

  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      updateWindowPosition(
        windowKey,
        Math.max(0, dragRef.current.winX + deltaX),
        Math.max(0, dragRef.current.winY + deltaY)
      );
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [windowKey, updateWindowPosition]);

  if (!win || !win.isOpen || win.isMinimized) return null;

  const IconComp = ((Icons as unknown) as Record<string, LucideIcon>)[iconName] || WindowIcon;

  return (
    <div
      className="window-container absolute animate-fade-in"
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex + 100,
      }}
      onMouseDown={() => focusWindow(windowKey)}
    >
      <div
        className="window-header cursor-move select-none"
        onMouseDown={(e) => {
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            winX: win.position.x,
            winY: win.position.y,
          };
        }}
        onDoubleClick={() => {}}
      >
        <div className="window-title">
          <IconComp size={16} className="text-primary-600" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-neutral-100 text-neutral-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowKey);
            }}
            title="最小化"
          >
            <Minus size={14} />
          </button>
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-neutral-100 text-neutral-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="最大化"
          >
            <Maximize2 size={14} />
          </button>
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowKey);
            }}
            title="关闭"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className={cn("overflow-auto", "h-[calc(100%-49px)]")}>{children}</div>
    </div>
  );
}
