// src/pages/Login.js (o donde lo tengas)
import React, { useState, useContext } from "react";
import { auth, db } from "../../firebaseConfig"; // Asegúrate que la ruta sea correcta
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext"; // Asegúrate que la ruta sea correcta
import toast from 'react-hot-toast'; // Usaremos toast para errores en lugar de <p>

// Opcional: Importa tu logo si quieres añadirlo
// import FixGoLogo from '../../assets/images/fixgo-logo.svg'; 

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  // setError ya no se usa para mostrar en <p>, se usará toast.error
  // const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError(''); // Ya no es necesario si usamos toasts
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, input.email, input.password);
      const userDocRef = doc(db, 'users', res.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const processedData = { ...userData };
        Object.keys(processedData).forEach((key) => {
          if (processedData[key] instanceof Timestamp) {
            processedData[key] = processedData[key].toDate();
          }
        });
        setCurrentUser(processedData);
        toast.success('¡Bienvenido de vuelta!');
        navigate(userData.isAdmin ? '/admin' : '/'); // Redirige según el rol
      } else {
        // setError('No se encontró información del usuario.'); // Usar toast
        toast.error('No se encontró información adicional del usuario.');
      }
    } catch (error) {
      // setError('Correo electrónico o contraseña incorrectos.'); // Usar toast
      toast.error('Correo electrónico o contraseña incorrectos.');
      console.error('Error de autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-light p-4 sm:p-6">
      <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-neutral-white rounded-2xl shadow-2xl border border-neutral-medium">
        {/* Opcional: Logo */}
        {/* <img src={FixGoLogo} alt="FixGo Logo" className="w-32 mx-auto mb-6" /> */}
        <h2 className="text-3xl font-bold text-center text-brand-blue">
          Iniciar Sesión
        </h2>
        
        {/* Los errores se mostrarán mediante toasts, ya no se necesita el <p> de error aquí */}
        {/* {error && <p className="text-sm text-center text-accent-red bg-red-100 p-3 rounded-md">{error}</p>} */}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
              Correo Electrónico:
            </label>
            <input
              type="email"
              id="email"
              value={input.email}
              onChange={(e) => setInput({ ...input, email: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm 
                         text-text-primary placeholder-text-secondary 
                         focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={input.password}
              onChange={(e) => setInput({ ...input, password: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm 
                         text-text-primary placeholder-text-secondary 
                         focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          <div className="text-right mt-2">
                <Link 
                  to="/reset-password" // Ruta a tu página de restablecimiento
                  className="text-sm font-medium text-brand-blue hover:text-blue-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
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
                             ? 'bg-orange-300 cursor-not-allowed' // Naranja más claro para deshabilitado
                             : 'bg-accent-orange hover:bg-orange-600 focus:ring-accent-orange'
                         }`}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-text-secondary">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="font-medium text-brand-blue hover:text-blue-700 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;