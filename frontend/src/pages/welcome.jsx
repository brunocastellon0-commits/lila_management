import { Header } from '../assets/components/welcome/Header';
import { HeroSection } from '../assets/components/welcome/HeroSection';
import { CategoryCard } from '../assets/components/welcome/CategoryCard';
import { ProductCard } from '../assets/components/welcome/ProductCard';
import { ServiceCard } from '../assets/components/welcome/ServiceCard';
import { TestimonialCard } from '../assets/components/welcome/TestimonialCard';
import { BlogCard } from '../assets/components/welcome/BlogCard';
import { Newsletter } from '../assets/components/welcome/Newsletter';
import { Footer } from '../assets/components/welcome/Footer';
import { 
  Utensils,
  Coffee,
  Cake,
  IceCream,
  Pizza,
  Salad,
  Truck,
  Clock,
  HeartHandshake,
  Award,
  TrendingUp,
  Search
} from 'lucide-react';
import { Button } from '../assets/components/ui/button';
import { Input } from '../assets/components/ui/input';

export default function Welcome() {
  const categories = [
    { icon: Pizza, title: 'Pizzas Artesanales', itemCount: '20+ variedades', gradient: 'bg-gradient-to-br from-teal-400 to-cyan-500' },
    { icon: Coffee, title: 'Bebidas y Cafés', itemCount: '15+ opciones', gradient: 'bg-gradient-to-br from-cyan-400 to-sky-500' },
    { icon: Salad, title: 'Ensaladas Frescas', itemCount: '10+ combinaciones', gradient: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
    { icon: Cake, title: 'Postres Caseros', itemCount: '8+ delicias', gradient: 'bg-gradient-to-br from-pink-400 to-rose-500' },
    { icon: IceCream, title: 'Helados y Shakes', itemCount: '12+ sabores', gradient: 'bg-gradient-to-br from-sky-400 to-cyan-500' },
    { icon: Utensils, title: 'Platos Principales', itemCount: '25+ recetas', gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
  ];

  const products = [
    {
      image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1080&q=80',
      title: 'Pizza Mediterránea con masa artesanal',
      price: 45.00,
      rating: 5,
      reviews: 134,
      isNew: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1565958011705-44e211b7ba16?auto=format&fit=crop&w=1080&q=80',
      title: 'Hamburguesa Gourmet con papas rústicas',
      price: 38.00,
      rating: 5,
      reviews: 98,
    },
    {
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=1080&q=80',
      title: 'Ensalada Tropical con aderezo de mango',
      price: 30.00,
      rating: 4,
      reviews: 76,
    },
    {
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1080&q=80',
      title: 'Cheesecake de frutos rojos',
      price: 25.00,
      rating: 5,
      reviews: 210,
      discount: '-10%',
    },
  ];

  const services = [
    { icon: Truck, title: 'Entrega Rápida', description: 'Tu pedido llega caliente y a tiempo, siempre.', gradient: 'bg-gradient-to-br from-teal-400 to-cyan-500' },
    { icon: Clock, title: 'Abierto 24/7', description: 'Disfruta de tus platillos favoritos a cualquier hora.', gradient: 'bg-gradient-to-br from-sky-400 to-cyan-600' },
    { icon: HeartHandshake, title: 'Atención Cercana', description: 'Nuestro equipo te atiende con calidez y profesionalismo.', gradient: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
    { icon: Award, title: 'Calidad Garantizada', description: 'Ingredientes frescos y recetas de autor.', gradient: 'bg-gradient-to-br from-cyan-500 to-teal-700' },
  ];

  const testimonials = [
    { name: 'Laura Fernández', role: 'Cliente frecuente', avatar: 'LF', rating: 5, comment: 'La mejor pizza que he probado. El servicio es excelente y el ambiente muy acogedor.' },
    { name: 'Diego Morales', role: 'Cliente verificado', avatar: 'DM', rating: 5, comment: 'Los postres son una locura. Todo se siente fresco y casero.' },
    { name: 'Andrea Rojas', role: 'Comensal habitual', avatar: 'AR', rating: 5, comment: 'Me encanta pedir por delivery, llega rápido y la comida sigue deliciosa.' },
  ];

  const blogPosts = [
    { image: 'https://images.unsplash.com/photo-1601315576601-0a5b1b29c6e8?auto=format&fit=crop&w=1080&q=80', category: 'Cocina', title: 'Secretos de una masa perfecta para pizza', excerpt: 'Te contamos los trucos de nuestros chefs para lograr esa textura crujiente y esponjosa.', date: '15 Oct 2025', readTime: '4 min' },
    { image: 'https://images.unsplash.com/photo-1625944230944-9b8cb50e1e5f?auto=format&fit=crop&w=1080&q=80', category: 'Recetas', title: 'Cómo preparar una hamburguesa gourmet en casa', excerpt: 'Ingredientes, pasos y tips para lograr una experiencia 5 estrellas desde tu cocina.', date: '10 Oct 2025', readTime: '6 min' },
    { image: 'https://images.unsplash.com/photo-1618219485449-0f2a5e94e0e3?auto=format&fit=crop&w=1080&q=80', category: 'Experiencias', title: 'Los postres más populares del mes', excerpt: 'Nuestros clientes eligieron sus favoritos. ¿Ya probaste alguno?', date: '5 Oct 2025', readTime: '3 min' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />

        {/* Buscador */}
        <section className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-center">¿Qué te gustaría comer hoy?</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="text" placeholder="Buscar por nombre, tipo o ingrediente..." className="pl-12 pr-4 py-6 w-full bg-gray-50 border-border rounded-xl" />
              </div>
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 rounded-xl">
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Populares:</span>
              {['Pizza', 'Hamburguesas', 'Postres', 'Cafés'].map((term, i) => (
                <button key={i} className="px-3 py-1 bg-cyan-100 text-cyan-600 rounded-full text-sm hover:bg-cyan-600 hover:text-white transition-colors">{term}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Explora nuestro menú</h2>
              <p className="text-muted-foreground">Delicias para todos los gustos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {categories.map((category, index) => <CategoryCard key={index} {...category} />)}
          </div>
        </section>

        {/* Platos Destacados */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-teal-500" />
                <h2 className="text-3xl font-bold">Platos destacados</h2>
              </div>
              <p className="text-muted-foreground">Los favoritos de nuestros clientes</p>
            </div>
            <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white">Ver todos</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => <ProductCard key={index} {...product} />)}
          </div>
        </section>

        {/* Servicios */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6 text-teal-500" />
              <h2 className="text-3xl font-bold">¿Por qué elegirnos?</h2>
            </div>
            <p className="text-muted-foreground">Una experiencia culinaria que te encantará</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => <ServiceCard key={index} {...service} />)}
          </div>
        </section>

        {/* Testimonios */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-white to-cyan-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Lo que dicen nuestros clientes</h2>
            <p className="text-muted-foreground">Miles de personas disfrutan nuestros sabores</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => <TestimonialCard key={index} {...testimonial} />)}
          </div>
        </section>

        {/* Blog */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Blog gastronómico</h2>
              <p className="text-muted-foreground">Consejos, recetas y experiencias culinarias</p>
            </div>
            <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white">
              Ver todos los artículos
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => <BlogCard key={index} {...post} />)}
          </div>
        </section>

        {/* Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
