import React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../../utils/utils";

/**
 * Componente: Separator
 * ---------------------
 * Línea separadora horizontal o vertical.
 *
 * Props:
 * - className: clases adicionales de Tailwind
 * - orientation: "horizontal" | "vertical" (default: "horizontal")
 * - decorative: booleano que indica si es decorativa (default: true)
 * - ...props: cualquier otro prop que soporte Radix Separator
 *
 * Uso esperado:
 * <Separator className="my-6" />
 * <Separator orientation="vertical" className="mx-4" />
 */
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 " +
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full " +
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
