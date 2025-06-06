// src/components/Navigation/Navbar.js
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import toast from 'react-hot-toast'; // Asegúrate que toast esté importado si lo usas en handleLogout
import { ReactComponent as TuerquitaLlenaIcon } from '../../assets/icons/tuerquita-llena.svg';
import { ReactComponent as TuerquitaVaciaIcon } from '../../assets/icons/tuerquita-vacia.svg';
import { ReactComponent as FlamesIcon } from '../../assets/icons/tuerquita-llenaa.svg';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Navbar = () => {
  const MAX_LIVES = 5;
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // console.log("Sesión cerrada exitosamente");
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión. Inténtalo de nuevo.");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinkBaseStyle = "px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ease-in-out";
  const desktopNavLinkStyle = `${navLinkBaseStyle} text-neutral-white hover:bg-blue-700 hover:text-neutral-white`;
  const adminNavLinkStyle = `${navLinkBaseStyle} text-accent-yellow hover:text-yellow-300 hover:bg-blue-700`;
  
  const mobileNavLinkBaseStyle = "block w-full text-left px-4 py-3 rounded-md text-base font-medium transition-colors duration-150 ease-in-out";
  const mobileNavLinkStyle = `${mobileNavLinkBaseStyle} text-neutral-white hover:bg-blue-700 hover:text-neutral-white`;
  const mobileAdminNavLinkStyle = `${mobileNavLinkBaseStyle} text-accent-yellow hover:text-yellow-300 hover:bg-blue-700`;

  return (
    <nav className="bg-brand-blue shadow-xl py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={currentUser ? "/" : "/"} className="text-neutral-white text-2xl font-bold flex items-center flex-shrink-0 hover:opacity-90 transition-opacity">
          FixGo
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {currentUser && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center" title={`Vidas: ${currentUser.lives ?? 0}`}>
                {Array.from({ length: Math.max(0, currentUser.lives || 0) }).map((_, index) => (
                  <TuerquitaLlenaIcon key={`live-${index}`} className="h-5 w-5 sm:h-6 sm:w-6 fill-accent-yellow" />
                ))}
                {Array.from({ length: Math.max(0, MAX_LIVES - (currentUser.lives || 0)) }).map((_, index) => (
                  <TuerquitaVaciaIcon key={`empty-${index}`} className="h-5 w-5 sm:h-6 sm:w-6 fill-blue-300 opacity-70" />
                ))}
              </div>
              <span className="text-blue-300 text-xl sm:hidden">|</span>
              <div className="flex items-center" title={`Tuerquitas (XP): ${currentUser.tuerquitas ?? 0}`}>
                <FlamesIcon className="h-5 w-5 sm:h-6 sm:w-6 fill-accent-orange mr-1" />
                <span className="text-neutral-white font-bold text-sm">{currentUser.tuerquitas ?? 0}</span>
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-1">
            {currentUser && (
              <>
                {currentUser.isAdmin && (
                  <Link to="/admin" className={adminNavLinkStyle}>
                    Panel Admin
                  </Link>
                )}
                <Link to="/" className={desktopNavLinkStyle}>Dashboard</Link>
                <Link to="/profile" className={desktopNavLinkStyle}>Perfil</Link>
                <Link to="/store" className={desktopNavLinkStyle}>Tienda</Link>
              </>
            )}
            {currentUser ? (
              <button
                onClick={handleLogout}
                // CORRECCIÓN AQUÍ: Removidas comillas simples innecesarias
                className={`${navLinkBaseStyle} bg-accent-red hover:bg-red-700 text-neutral-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-white`}
              >
                Salir
              </button>
            ) : (
              <Link
                to="/login"
                // CORRECCIÓN AQUÍ: Removidas comillas simples innecesarias
                className={`${navLinkBaseStyle} bg-brand-green hover:bg-green-700 text-neutral-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-white`}
              >
                Ingresar
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-neutral-white p-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-white transition-colors">
              <span className="sr-only">Abrir menú principal</span>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-blue shadow-2xl rounded-b-lg border-t border-blue-400 z-40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentUser ? (
              <>
                {currentUser.isAdmin && (
                  <Link to="/admin" className={mobileAdminNavLinkStyle} onClick={toggleMobileMenu}>
                    Panel Admin
                  </Link>
                )}
                <Link to="/" className={mobileNavLinkStyle} onClick={toggleMobileMenu}>Dashboard</Link>
                <Link to="/profile" className={mobileNavLinkStyle} onClick={toggleMobileMenu}>Perfil</Link>
                <Link to="/store" className={mobileNavLinkStyle} onClick={toggleMobileMenu}>Tienda</Link>
                <hr className="border-blue-400 my-2"/>
                <button
                  onClick={() => { handleLogout(); toggleMobileMenu(); }}
                  // CORRECCIÓN AQUÍ: Removidas comillas simples innecesarias
                  className={`${mobileNavLinkBaseStyle} w-full text-left bg-accent-red hover:bg-red-700 text-neutral-white`}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                // CORRECCIÓN AQUÍ: Removidas comillas simples innecesarias
                className={`${mobileNavLinkBaseStyle} w-full text-center bg-brand-green hover:bg-green-700 text-neutral-white`}
                onClick={toggleMobileMenu}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;