// src/pages/NotFoundPage.js (o donde prefieras guardarlo)
import React, { useContext } from 'react'; // useContext para el currentUser
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar'; // Ajusta la ruta si es necesario
import { UserContext } from '../contexts/UserContext'; // Ajusta la ruta si es necesario

// Un icono simple y amigable para la página 404
const LostAstronautIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32 md:w-40 md:h-40 text-brand-blue opacity-80 mx-auto mb-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25M5.25 6.006a7.5 7.5 0 0 1 13.5 0M5.25 17.994a7.5 7.5 0 0 1 13.5 0" /> {/* Líneas simplificadas para un look 'perdido' o 'brújula rota' */}
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5c-.987 0-1.928-.14-2.805-.405M3.284 14.253L3.284 14.253" /> {/* Planeta o estrellas */}
    </svg>
);


const NotFoundPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext); // Para decidir a dónde redirigir

  // Determinar a dónde enviar al usuario: al dashboard si está logueado, si no al login.
  // Si el dashboard es '/', y el login es '/login'
  const goHomePath = currentUser ? '/' : '/login';
  const goHomeText = currentUser ? 'Volver al Dashboard' : 'Ir a Iniciar Sesión';


  return (
    <div className="min-h-screen bg-neutral-light flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 -mt-16"> {/* -mt-16 para compensar altura de navbar si es necesario */}
        
        <LostAstronautIcon />

        <h1 className="text-6xl md:text-8xl font-extrabold text-brand-blue tracking-tighter">
          404
        </h1>
        <p className="mt-3 text-2xl md:text-3xl font-semibold text-text-primary">
          ¡Houston, tenemos un problema!
        </p>
        <p className="mt-2 text-base md:text-lg text-text-secondary max-w-md">
          Parece que la página que buscas se ha perdido en la inmensidad del ciberespacio. No te preocupes, podemos ayudarte a encontrar el camino de regreso.
        </p>
        <div className="mt-8">
          <button
            onClick={() => navigate(goHomePath)}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg 
                       text-neutral-white bg-accent-orange hover:bg-orange-600 
                       transition-all duration-150 ease-in-out transform active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange shadow-lg hover:shadow-xl"
          >
            {goHomeText}
          </button>
        </div>
        <p className="mt-10 text-sm text-text-secondary">
            Si crees que esto es un error, puedes <Link to="/contact" className="font-medium text-brand-blue hover:underline">contactarnos</Link>. {/* Asume una página de contacto */}
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;