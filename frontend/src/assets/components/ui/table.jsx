"use client";

import React from "react";

function Table({ className = "", ...props }) {
  return (
    <div
      data-slot="table-container"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`relative w-full overflow-x-auto ${className}`}
    >
      <table
        data-slot="table"
        // CORRECCIÓN CLAVE: Uso de backticks (``)
        className={`w-full caption-bottom text-sm bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className = "", ...props }) {
  return (
    <thead
      data-slot="table-header"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`[&_tr]:border-b bg-gray-100 ${className}`}
      {...props}
    />
  );
}

function TableBody({ className = "", ...props }) {
  return (
    <tbody
      data-slot="table-body"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`[&_tr:last-child]:border-0 ${className}`}
      {...props}
    />
  );
}

function TableFooter({ className = "", ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`bg-gray-100 border-t border-gray-200 font-medium [&>tr]:last:border-b-0 ${className}`}
      {...props}
    />
  );
}

function TableRow({ className = "", ...props }) {
  return (
    <tr
      data-slot="table-row"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`hover:bg-gray-50 data-[state=selected]:bg-gray-100 border-b border-gray-200 transition-colors duration-200 ${className}`}
      {...props}
    />
  );
}

function TableHead({ className = "", ...props }) {
  return (
    <th
      data-slot="table-head"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`text-gray-900 h-12 px-4 py-2 text-left align-middle font-semibold whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
      {...props}
    />
  );
}

function TableCell({ className = "", ...props }) {
  return (
    <td
      data-slot="table-cell"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-gray-900 font-medium ${className}`}
      {...props}
    />
  );
}

function TableCaption({ className = "", ...props }) {
  return (
    <caption
      data-slot="table-caption"
      // CORRECCIÓN CLAVE: Uso de backticks (``)
      className={`text-gray-600 mt-4 text-sm ${className}`}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};