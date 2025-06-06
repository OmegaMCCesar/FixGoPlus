// src/components/Navigation/Footer.js (o donde prefieras guardarlo)
import React from 'react';
import { Link } from 'react-router-dom'; // Para los enlaces internos

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-dark text-neutral-light py-8 md:py-10"> {/* Fondo oscuro, texto claro */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          
          {/* Copyright */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-neutral-medium">
              &copy; {currentYear} FixGo. Todos los derechos reservados.
            </p>
            {/* Opcional: un pequeño eslogan o nombre de empresa */}
            {/* <p className="text-xs text-gray-400 mt-1">Hecho con <span className="text-accent-red">&hearts;</span> en TuCiudad</p> */}
          </div>

          {/* Enlaces del Footer */}
          <nav className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6">
            <Link 
              to="/terms-of-service" 
              className="text-sm text-neutral-light hover:text-brand-blue hover:underline transition-colors duration-200"
            >
              Términos y Condiciones
            </Link>
            <Link 
              to="/privacy-policy" 
              className="text-sm text-neutral-light hover:text-brand-blue hover:underline transition-colors duration-200"
            >
              Política de Privacidad
            </Link>
            <Link 
              to="/contact" // Asumiendo que tendrás una página de contacto
              className="text-sm text-neutral-light hover:text-brand-blue hover:underline transition-colors duration-200"
            >
              Contacto
            </Link>
            {/* Puedes añadir más enlaces aquí, como FAQ, Blog, etc. */}
          </nav>
        </div>

        {/* Opcional: Iconos de Redes Sociales (ejemplo comentado) */}
        {/* <div className="mt-8 pt-8 border-t border-neutral-custom-dark flex justify-center space-x-6"> // neutral-custom-dark sería un gris más oscuro que neutral-dark
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-neutral-medium hover:text-brand-blue transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"> // Path del icono de Facebook </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-neutral-medium hover:text-brand-blue transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"> // Path del icono de Twitter </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-neutral-medium hover:text-brand-blue transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"> // Path del icono de Instagram </svg>
          </a>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;