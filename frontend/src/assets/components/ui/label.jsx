import React from "react";

// --- Mocks para Autoejecución ---

// Simulación de la utilidad 'cn' (clsx/tailwind-merge)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Simulación simplificada del componente Root de Radix Label
const LabelPrimitive = {
  Root: ({ children, className, ...props }) => (
    <label className={className} {...props}>
      {children}
    </label>
  ),
};

// --- Componente Label JSX Puro ---

export function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      // Las clases de Tailwind/Radix se mantienen para el estilo
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

// --- Demo de Uso ---

const Input = React.forwardRef(({ id, ...props }, ref) => (
  <input 
    id={id} 
    ref={ref}
    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B8D4]" 
    {...props} 
  />
));

export default function App() {
  const [value, setValue] = React.useState("ejemplo@mail.com");

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center font-sans">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-lg space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Formulario de Prueba</h1>
        <div className="space-y-2">
          {/* El componente Label en uso */}
          <Label htmlFor="email-input">Correo Electrónico</Label>
          <Input 
            id="email-input" 
            type="email" 
            placeholder="Ingrese su correo" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 opacity-50 pointer-events-none group data-[disabled=true]">
          {/* Ejemplo de un Label deshabilitado (simulado con opacidad) */}
          <Label htmlFor="disabled-input">Contraseña (Deshabilitada)</Label>
          <Input 
            id="disabled-input" 
            type="password" 
            disabled 
            placeholder="No se puede editar"
          />
        </div>
      </div>
    </div>
  );
}