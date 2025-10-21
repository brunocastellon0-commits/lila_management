"use client";

import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { buttonVariants } from "./button";

function AlertDialog(props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

function AlertDialogPortal(props) {
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      {...props}
    />
  );
}

function AlertDialogOverlay({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 ${className}`}
      {...props}
    />
  );
}

function AlertDialogContent({ className = "", ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        // CORRECCIÓN CLAVE: Uso de backticks (``)
        className={`bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-gray-200 p-6 shadow-lg duration-200 sm:max-w-lg ${className}`}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-dialog-header"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`flex flex-col gap-2 text-center sm:text-left ${className}`}
      {...props}
    />
  );
}

function AlertDialogFooter({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`flex flex-col-reverse gap-3 sm:flex-row sm:justify-end ${className}`}
      {...props}
    />
  );
}

function AlertDialogTitle({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`text-xl font-semibold text-gray-900 ${className}`}
      {...props}
    />
  );
}

function AlertDialogDescription({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`text-gray-600 text-base ${className}`}
      {...props}
    />
  );
}

function AlertDialogAction({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Action
      // CORRECCIÓN CLAVE: Uso de backticks (``) y llamada a función
      className={`${buttonVariants()} bg-purple-700 hover:bg-purple-800 text-white focus:ring-2 focus:ring-purple-700 ${className}`}
      {...props}
    />
  );
}

function AlertDialogCancel({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Cancel
      // CORRECCIÓN CLAVE: Uso de backticks (``) y llamada a función
      className={`${buttonVariants({ variant: "outline" })} border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-purple-700 ${className}`}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};