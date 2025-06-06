// src/components/Profile/UserProfilePage.js
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext'; // Ajusta si la ruta es '../contexts/UserContext'
import Navbar from '../components/Navigation/Navbar'; // Ajusta si la ruta es '../components/Navigation/Navbar'
import { ReactComponent as TuerquitaLlenaIcon } from '../assets/icons/tuerquita-llenaa.svg'; // Ajusta la ruta
import { ReactComponent as XPIcon } from '../assets/icons/xp-svgrepo-com.svg'; // Ajusta la ruta
import { Link, useNavigate } from 'react-router-dom'; // Añadido useNavigate

const UserProfilePage = () => {
  const { currentUser, loading: userLoading } = useContext(UserContext); // Renombrado loading para claridad
  const navigate = useNavigate(); // Hook para navegación

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
          <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto flex justify-center items-center h-[calc(100vh-80px)] p-4">
          <div className="text-center p-6 md:p-8 bg-neutral-white rounded-xl shadow-xl border border-neutral-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-accent-orange mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-accent-red text-xl font-semibold mb-4">¡Acceso Denegado!</p>
            <p className="text-text-primary mb-6">Debes iniciar sesión para ver tu perfil.</p>
            <button
                onClick={() => navigate('/login')}
                className="bg-brand-green hover:bg-green-700 text-neutral-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
            >
                Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ProfileRow = ({ label, value, children, icon, valueColorClass = "text-text-primary" }) => (
    <div className="flex flex-col sm:flex-row sm:items-center border-b border-neutral-light py-4 last:border-b-0">
      <span className="font-medium w-full sm:w-48 text-text-secondary text-sm shrink-0 mb-1 sm:mb-0">{label}:</span>
      {children ? (
        <div className="flex items-center text-base md:text-lg font-semibold">{children}</div>
      ) : (
        <span className={`text-base md:text-lg font-semibold ${valueColorClass}`}>{value || 'No especificado'}</span>
      )}
    </div>
  );


  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <div className="container mx-auto mt-6 mb-10 p-4 md:p-0">
        <div className="bg-neutral-white max-w-2xl lg:max-w-3xl mx-auto p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-medium">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-blue mb-8 text-center">
            Mi Perfil
          </h1>

          <div className="space-y-3"> {/* Espacio entre filas reducido un poco */}
            <ProfileRow label="Nombre de Usuario" value={currentUser.displayName} />
            <ProfileRow label="Correo Electrónico" value={currentUser.email} />
            <ProfileRow label="País" value={currentUser.country} />
            
            <ProfileRow label="Tuerquitas">
              <TuerquitaLlenaIcon className="h-6 w-6 mr-1.5 fill-accent-orange" />
              <span className="text-accent-orange font-bold text-lg mr-2">{currentUser.tuerquitas ?? 0}</span>
              <Link to="/store" className="text-xs sm:text-sm text-brand-blue hover:text-blue-700 font-medium hover:underline">
                (Ir a la tienda)
              </Link>
            </ProfileRow>

            <ProfileRow label="Puntos de Experiencia (XP)">
              <XPIcon className="h-6 w-6 mr-1.5 fill-brand-purple" /> {/* Asume que brand-purple está en tu paleta */}
              <span className="text-brand-purple font-bold text-lg">{currentUser.xp ?? 0}</span>
            </ProfileRow>

            {/* Ejemplo de cómo podrías añadir más información */}
            {/* <ProfileRow label="Miembro Desde">
              {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'No disponible'}
            </ProfileRow>
            <ProfileRow label="Suscripción">
              {currentUser.isSubscribed ? 
                <span className="text-brand-green font-semibold">Activa</span> : 
                <span className="text-text-secondary font-semibold">No activa</span>
              }
              {!currentUser.isSubscribed && 
                <Link to="/subscribe" className="text-xs sm:text-sm text-brand-blue hover:text-blue-700 font-medium ml-2 hover:underline">(Ver planes)</Link>
              }
            </ProfileRow> */}
          </div>

          {/* Botón para editar perfil */}
          <div className="mt-10 text-center">
            <button 
              onClick={() => navigate('/profile/edit')} // Asume una ruta de edición
              className="bg-accent-orange hover:bg-orange-600 text-neutral-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;