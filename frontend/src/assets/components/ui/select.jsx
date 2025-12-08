"use client";

import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Select(props) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className = "", size = "default", children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={`
        flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#13161C] px-3 py-2 text-sm text-white whitespace-nowrap transition-all duration-200 outline-none 
        focus-visible:border-[#2A9D8F] focus-visible:ring-1 focus-visible:ring-[#2A9D8F] 
        disabled:cursor-not-allowed disabled:opacity-50 
        [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 
        data-[placeholder]:text-gray-500 
        hover:border-white/20
        ${className}
      `}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 text-gray-400" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className = "", children, position = "popper", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={`
          relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-hidden rounded-xl border border-white/10 bg-[#13161C] text-white shadow-xl 
          data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
          data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 
          ${position === "popper" ? "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1" : ""} 
          ${className}
        `}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={`p-1 ${position === "popper" ? "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1" : ""}`}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className = "", ...props }) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={`py-1.5 pl-8 pr-2 text-sm font-semibold text-gray-400 ${className}`}
      {...props}
    />
  );
}

function SelectItem({ className = "", children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none transition-colors 
        text-gray-300
        focus:bg-white/10 focus:text-white 
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50 
        ${className}
      `}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-[#2A9D8F]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className = "", ...props }) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={`-mx-1 my-1 h-px bg-white/10 ${className}`}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className = "", ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={`flex cursor-default items-center justify-center py-1 text-gray-400 ${className}`}
      {...props}
    />
  );
}

function SelectScrollDownButton({ className = "", ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={`flex cursor-default items-center justify-center py-1 text-gray-400 ${className}`}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};