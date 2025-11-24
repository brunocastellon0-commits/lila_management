import React from 'react';

const Textarea = React.forwardRef(({ 
  className, 
  label, 
  error, 
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {/* 1. Label (Opcional) */}
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* 2. El área de texto */}
      <textarea
        ref={ref}
        className={`
          flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-colors
          placeholder:text-gray-400 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50
          ${error 
            ? 'border-red-500 focus-visible:ring-red-500' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${className}
        `}
        {...props}
      />

      {/* 3. Mensaje de Ayuda (Opcional) */}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}

      {/* 4. Mensaje de Error (Opcional) */}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
          {/* Icono de advertencia simple SVG inline */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };