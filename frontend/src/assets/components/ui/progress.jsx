import React from "react";

// --- Mocks para Autoejecución ---

// Simulación de la utilidad 'cn' (clsx/tailwind-merge)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Simulación simplificada de Radix Progress
const ProgressPrimitive = {
  Root: ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  Indicator: ({ className, style }) => (
    <div className={className} style={style} />
  ),
};

// --- Componente Progress JSX Puro ---

export function Progress({
  className,
  value,
  ...props
}) {
  const progressValue = value || 0;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        // Clases para el contenedor (pista o background)
        "bg-gray-200 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      // Props originales de Radix, como max, etc.
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        // Clases para la barra de progreso (indicador). 
        // Nota: Cambié bg-primary a un color Tailwind neutral para el mock. 
        // En tu proyecto real, usa el color deseado (ej: bg-[#00B8D4]).
        className="bg-[#00B8D4] h-full flex-1 transition-all duration-500 ease-out"
        // La lógica de Radix usa translateX para ocultar la porción no completada.
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

// --- Demo de Uso ---

export default function App() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    // Simula el progreso cargando de 0 a 100
    const timer = setTimeout(() => setProgress(66), 500);
    const timer2 = setTimeout(() => setProgress(90), 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-lg space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Progreso de Lote</h1>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Producción de Croissants</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          
          {/* Componente Progress en uso */}
          <Progress value={progress} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Despacho a Sucursal Norte</span>
            <span className="font-semibold">30%</span>
          </div>
          <Progress value={30} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Verificación de Calidad</span>
            <span className="font-semibold">100%</span>
          </div>
          <Progress value={100} className="h-1 bg-green-200" />
        </div>
      </div>
    </div>
  );
}