// src/pages/Profile/UserProfileEditPage.js (o donde prefieras guardarlo)
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Ajusta la ruta si es necesario
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../contexts/UserContext'; // Ajusta la ruta si es necesario
import Navbar from '../components/Navigation/Navbar'; // Ajusta la ruta si es necesario
import toast from 'react-hot-toast';

// Lista de países (puedes moverla a un archivo de constantes si la usas en varios lugares)
const countries = [
  "México", "Argentina", "Chile", "Colombia", "Perú", "Uruguay", "Venezuela",
  "Paraguay", "Ecuador", "Bolivia", "Costa Rica", "Cuba", "Honduras",
  "Guatemala", "Nicaragua", "El Salvador", "Panamá", "República Dominicana", "Puerto Rico", "España", "Estados Unidos", "Otro"
].sort();


const UserProfileEditPage = () => {
  const { currentUser, setCurrentUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        country: currentUser.country || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.displayName.trim()) {
      toast.error('El nombre de usuario no puede estar vacío.');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No estás autenticado. Por favor, inicia sesión de nuevo.');
        navigate('/login');
        setLoading(false);
        return;
      }

      // 1. Actualizar perfil de Firebase Auth (solo displayName)
      if (user.displayName !== formData.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
      }

      // 2. Actualizar documento en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        country: formData.country,
      });

      // 3. Actualizar UserContext
      setCurrentUser(prevUser => ({
        ...prevUser,
        displayName: formData.displayName,
        country: formData.country,
      }));

      toast.success('¡Perfil actualizado con éxito!');
      navigate('/profile'); // Redirigir a la página de visualización del perfil

    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error('No se pudo actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading && !currentUser) { // Muestra carga solo si no hay currentUser aún por el loading inicial del contexto
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
          <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary text-lg">Cargando datos del perfil...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) { // Si después de cargar no hay usuario, algo anda mal o no está logueado
    // Podrías redirigir a login, aquí se asume que useEffect en páginas protegidas lo haría.
    // Por ahora, un mensaje simple si se accede directamente sin usuario.
    return (
         <div className="min-h-screen bg-neutral-light">
            <Navbar />
            <div className="container mx-auto flex justify-center items-center h-[calc(100vh-80px)] p-4">
                <div className="text-center p-6 md:p-8 bg-neutral-white rounded-xl shadow-xl border border-neutral-medium">
                    <p className="text-accent-red text-xl font-semibold mb-4">Necesitas iniciar sesión para editar tu perfil.</p>
                    <button onClick={() => navigate('/login')} className="bg-brand-blue hover:bg-blue-700 text-neutral-white font-bold py-2.5 px-6 rounded-lg">Ir a Iniciar Sesión</button>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <div className="container mx-auto mt-6 mb-10 p-4 md:p-0">
        <div className="bg-neutral-white max-w-2xl mx-auto p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-medium">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-blue">
              Editar Mi Perfil
            </h1>
            <p className="text-text-secondary mt-2">Actualiza tu información personal.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-primary mb-1">
                Nombre de Usuario:
              </label>
              <input
                type="text"
                name="displayName"
                id="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm 
                           text-text-primary placeholder-text-secondary 
                           focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                placeholder="Tu nombre o apodo"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-1">
                País:
              </label>
              <select
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium bg-neutral-white rounded-lg shadow-sm 
                           text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              >
                <option value="">Selecciona tu país</option>
                {countries.map(countryName => (
                  <option key={countryName} value={countryName}>{countryName}</option>
                ))}
              </select>
            </div>

            {/* Aquí podrías añadir secciones para cambiar contraseña si decides hacerlo en la misma página */}

            <div className="flex flex-col sm:flex-row-reverse sm:items-center sm:justify-start gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto inline-flex justify-center items-center font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg 
                            transition-all duration-150 ease-in-out transform active:scale-95 
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${
                              loading
                                ? 'bg-orange-300 cursor-not-allowed text-neutral-white'
                                : 'bg-accent-orange hover:bg-orange-600 text-neutral-white focus:ring-accent-orange'
                            }`}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')} // Botón para cancelar y volver
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center font-medium py-3 px-8 rounded-lg 
                           border-2 border-neutral-medium text-text-secondary hover:bg-neutral-light hover:border-neutral-dark
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-dark
                           transition-colors duration-150 ease-in-out"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileEditPage;