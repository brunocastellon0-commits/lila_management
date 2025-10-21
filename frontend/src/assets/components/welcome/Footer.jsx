import { Heart, Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-teal-900 to-cyan-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-xl font-semibold">Lila Management</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Gestión integral de tu restaurante, optimizando personal, horarios y operaciones.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-white/10 hover:bg-teal-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              {['Inicio', 'Empleados', 'Sucursales', 'Horarios', 'Reportes'].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              {['Gestión de nómina', 'Asignación de turnos', 'Control de asistencia', 'Reportes de desempeño', 'Notificaciones internas'].map((service, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">Av. Central 456, Ciudad, País</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-gray-300">+1 (555) 987-6543</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-gray-300">contacto@lilamanagement.com</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-gray-300">
                <strong className="text-white">Horario:</strong><br />
                Lun - Vie: 8:00 AM - 8:00 PM<br />
                Sáb - Dom: 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">
              © 2025 Lila Management. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              {['Términos y condiciones', 'Política de privacidad', 'Cookies'].map((text, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-sm text-gray-300 hover:text-teal-400 transition-colors"
                >
                  {text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
