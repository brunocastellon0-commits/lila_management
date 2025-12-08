"use client";

import React from "react";

function Table({ className = "", ...props }) {
  return (
    <div
      data-slot="table-container"
      className={`relative w-full overflow-x-auto ${className}`}
    >
      <table
        data-slot="table"
        // CAMBIO: Fondo oscuro, borde sutil, texto blanco base
        className={`w-full caption-bottom text-sm bg-[#13161C] rounded-2xl border border-white/10 text-gray-200 shadow-lg ${className}`}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className = "", ...props }) {
  return (
    <thead
      data-slot="table-header"
      // CAMBIO: Fondo oscuro (igual que la tabla) y borde inferior sutil
      className={`[&_tr]:border-b border-white/10 bg-[#13161C] ${className}`}
      {...props}
    />
  );
}

function TableBody({ className = "", ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={`[&_tr:last-child]:border-0 ${className}`}
      {...props}
    />
  );
}

function TableFooter({ className = "", ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      // CAMBIO: Fondo oscuro y textos claros
      className={`bg-[#13161C] border-t border-white/10 font-medium text-gray-400 [&>tr]:last:border-b-0 ${className}`}
      {...props}
    />
  );
}

function TableRow({ className = "", ...props }) {
  return (
    <tr
      data-slot="table-row"
      // CAMBIO: Hover sutil blanco (white/5) y borde casi invisible
      className={`hover:bg-white/5 data-[state=selected]:bg-white/5 border-b border-white/5 transition-colors duration-200 ${className}`}
      {...props}
    />
  );
}

function TableHead({ className = "", ...props }) {
  return (
    <th
      data-slot="table-head"
      // CAMBIO: Texto gris medio para los títulos
      className={`text-gray-400 h-12 px-4 py-2 text-left align-middle font-bold text-xs uppercase tracking-wider whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
      {...props}
    />
  );
}

function TableCell({ className = "", ...props }) {
  return (
    <td
      data-slot="table-cell"
      // CAMBIO: Texto blanco/gris claro para el contenido
      className={`p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-gray-300 font-medium ${className}`}
      {...props}
    />
  );
}

function TableCaption({ className = "", ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={`text-gray-500 mt-4 text-sm ${className}`}
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