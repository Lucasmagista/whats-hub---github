import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Provider estável para modais
const StableTooltipProvider = TooltipPrimitive.Provider

// Componente de tooltip otimizado para uso em modais
const StableTooltip = TooltipPrimitive.Root

const StableTooltipTrigger = TooltipPrimitive.Trigger

const StableTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal container={document.body}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[99999] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md will-change-[transform,opacity] pointer-events-none select-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={{ 
        position: 'fixed',
        willChange: 'auto',
        contain: 'layout style size'
      }}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
StableTooltipContent.displayName = TooltipPrimitive.Content.displayName

export { 
  StableTooltip, 
  StableTooltipTrigger, 
  StableTooltipContent, 
  StableTooltipProvider 
}
