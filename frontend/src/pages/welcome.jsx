import { Header } from '../assets/components/welcome/Header';
import { HeroSection } from '../assets/components/welcome/HeroSection';
import { MomentsGallery } from '../assets/components/welcome/MomentsGallery';
import { CategoryCard } from '../assets/components/welcome/CategoryCard'; // Ojo: Asegúrate que este sea el nuevo MenuGallery
import { PromotionsCarousel } from '../assets/components/welcome/PromotionCarousel';
import { Newsletter } from '../assets/components/welcome/Newsletter';
import { Footer } from '../assets/components/welcome/Footer';

export default function Welcome() {
  return (
    // CAMBIO CLAVE: Fondo oscuro profundo (#0c0e12) en lugar de blanco
    <div className="min-h-screen bg-[#0c0e12] text-gray-100 selection:bg-[#2A9D8F] selection:text-white relative overflow-x-hidden">
      
      {/* --- FONDO AMBIENTAL (Glow Effects) --- */}
      {/* Estos orbes de luz hacen que el negro no se vea "muerto" sino vibrante */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Luz Teal arriba a la izquierda */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#1B4F55]/20 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
          {/* Luz Cyan abajo a la derecha */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2A9D8F]/10 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
      </div>

      {/* Header flotante (Asegúrate de que tu Header maneje transparencia o modo oscuro) */}
      <div className="relative z-50">
        <Header />
      </div>
      
      <main className="relative z-10">
        
        {/* 1. HERO: Ya tiene su propia imagen, así que cubre el fondo */}
        <HeroSection />

        {/* 2. SOCIAL: Galería */}
        <div className="relative">
            {/* Separador de degradado sutil */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0c0e12] to-transparent z-20" />
            <MomentsGallery />
        </div>

        {/* 3. MENÚ: Exploración */}
        {/* Fondo ligeramente más claro para diferenciar sección */}
        <section className="py-12 bg-[#11141a]/50 backdrop-blur-sm border-y border-[#1B4F55]/10">
            <CategoryCard />
        </section>

        {/* 4. MARKETING: Ofertas */}
        <div className="py-16">
            <PromotionsCarousel />
        </div>
        
        {/* 5. RRHH: Postulación */}
        {/* Un contenedor para centrar y dar aire antes del footer */}
        <div className="pb-24 px-4">
            <Newsletter />
        </div>

      </main>

      <Footer />
    </div>
  );
}