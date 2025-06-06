// src/pages/Auth/PasswordResetPage.js (o donde prefieras guardarlo)
import React, { useState } from 'react';
import { Link,} from 'react-router-dom';
import { auth } from '../../firebaseConfig'; // Ajusta la ruta si es necesario
import { sendPasswordResetEmail } from 'firebase/auth';
import Navbar from '../../components/Navigation/Navbar'; // Ajusta la ruta si es necesario
import toast from 'react-hot-toast';

// Icono opcional
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-brand-blue mb-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);


const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error('Por favor, ingresa tu dirección de correo electrónico.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña. ¡Revisa tu bandeja de entrada y spam!', {
        duration: 6000, // Duración más larga para este mensaje importante
      });
      // Opcionalmente, redirigir o limpiar el campo después de un tiempo
      setTimeout(() => {
        setEmail('');
        // navigate('/login'); // Podrías redirigir a login
      }, 6000);
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      // Firebase devuelve errores específicos, pero un mensaje genérico puede ser mejor para la UI
      if (error.code === 'auth/invalid-email') {
        toast.error('El formato del correo electrónico no es válido.');
      } else if (error.code === 'auth/user-not-found') {
        // Es buena práctica de seguridad no confirmar si un usuario existe o no.
        // Por eso el mensaje de éxito es genérico.
        // Pero si quieres dar feedback más directo (menos seguro):
        // toast.error('No se encontró ninguna cuenta con este correo electrónico.');
        // Por ahora, mantenemos el mensaje de éxito genérico y solo logueamos el error.
         toast.success('Si existe una cuenta con este correo, recibirás un enlace. ¡Revisa tu bandeja de entrada y spam!', { duration: 6000 });
      }
      else {
        toast.error('Ocurrió un error al intentar enviar el correo. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="bg-neutral-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-neutral-medium">
            <div className="text-center">
                <MailIcon />
                <h2 className="text-3xl font-bold text-brand-blue">
                    Restablecer Contraseña
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                    Ingresa tu correo electrónico y te enviaremos un enlace para que puedas volver a acceder a tu cuenta.
                </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-reset" className="block text-sm font-medium text-text-primary mb-1">
                  Correo Electrónico:
                </label>
                <input
                  id="email-reset"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm 
                             text-text-primary placeholder-text-secondary 
                             focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-neutral-white 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 
                             transition-all duration-150 ease-in-out transform active:scale-95
                             ${
                               loading 
                                 ? 'bg-orange-300 cursor-not-allowed'
                                 : 'bg-accent-orange hover:bg-orange-600 focus:ring-accent-orange'
                             }`}
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm">
                <Link to="/login" className="font-medium text-brand-blue hover:text-blue-700 hover:underline">
                  Volver a Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;