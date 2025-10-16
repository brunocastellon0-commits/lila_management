// Card.jsx (reemplazar por este contenido)
import React from "react";
import { cn } from "../../../utils/utils";

const Card = ({ className = "", children }) => {
  return (
    <div
      data-slot="card"
      // w-full y h-full aseguran que la tarjeta ocupe todo el "grid cell"
      className={cn(
        "w-full h-full bg-card text-card-foreground flex flex-col gap-4 rounded-xl border",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className = "", children }) => {
  // Header simplificado: usa grid/flex estándar en lugar de container queries complejas
  return (
    <div
      data-slot="card-header"
      className={cn(
        "px-6 pt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-start",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ className = "", children }) => {
  return (
    <h4 data-slot="card-title" className={cn("text-lg font-semibold leading-tight", className)}>
      {children}
    </h4>
  );
};

const CardDescription = ({ className = "", children }) => {
  return (
    <p data-slot="card-description" className={cn("text-muted-foreground text-sm", className)}>
      {children}
    </p>
  );
};

const CardAction = ({ className = "", children }) => {
  return (
    <div data-slot="card-action" className={cn("self-start justify-self-end", className)}>
      {children}
    </div>
  );
};

const CardContent = ({ className = "", children }) => {
  // flex-1 permite que el contenido empuje la tarjeta para tener alturas homogéneas
  return (
    <div data-slot="card-content" className={cn("px-6 pb-6 flex-1", className)}>
      {children}
    </div>
  );
};

const CardFooter = ({ className = "", children }) => {
  return (
    <div data-slot="card-footer" className={cn("flex items-center px-6 pb-6 pt-4", className)}>
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
