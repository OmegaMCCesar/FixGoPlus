// src/components/Auth/Register.js
import React, { useState, useContext } from "react";
import { auth, db } from "../../firebaseConfig"; // Asegúrate que la ruta sea correcta
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext"; // Asegúrate que la ruta sea correcta
import toast from 'react-hot-toast';

// Opcional: Importa tu logo si quieres añadirlo
// import FixGoLogo from '../../assets/images/fixgo-logo.svg';

const Register = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    displayName: "",
    country: "",
  });
  // setError ya no se usa para mostrar en <p>, se usará toast.error
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError(''); // Ya no es necesario si usamos toasts
    setLoading(true);

    if (input.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }
    if (!input.displayName.trim()) {
        toast.error("Por favor, ingresa un nombre de usuario.");
        setLoading(false);
        return;
    }
    if (!input.country) {
        toast.error("Por favor, selecciona tu país.");
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
      const user = userCredential.user;

      if (input.displayName.length > 0) {
        await updateProfile(user, { displayName: input.displayName });
      }

      const userDataForDb = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || input.displayName, // Asegura que displayName se guarde
        country: input.country,
        progress: {},
        lives: 5, // Valor inicial de vidas
        tuerquitas: 0, // Valor inicial de tuerquitas/moneda
        xp: 0, // Valor inicial de XP
        isSubscribed: false,
        subscriptionExpiry: null,
        completedLevels: [],
        levelProgress: {},
        currentLevel: null,
        incorrectQuestions: [], // Corregido el typo de 'incorrecQtQuestions'
        lastLifeRecharge: Timestamp.now(),
        nextLifeRecoveryTime: null,
        isAdmin: false,
        createdAt: Timestamp.now(), // Añadir fecha de creación
      };

      await setDoc(doc(db, 'users', user.uid), userDataForDb);

      const userDataForState = {
        ...userDataForDb,
        lastLifeRecharge: userDataForDb.lastLifeRecharge.toDate(),
        createdAt: userDataForDb.createdAt.toDate(), // Convertir createdAt también
        // Si subscriptionExpiry fuera un Timestamp, también se convertiría aquí
      };

      setCurrentUser(userDataForState);
      toast.success(`¡Bienvenido, ${userDataForState.displayName}! Registro exitoso.`);
      setInput({ email: "", password: "", displayName: "", country: "" }); // Limpiar formulario
      navigate('/'); // Redirigir al dashboard después del registro

    } catch (registerError) {
      console.error('Error de registro:', registerError);
      if (registerError.code === 'auth/email-already-in-use') {
        toast.error('Este correo electrónico ya está en uso.');
      } else if (registerError.code === 'auth/invalid-email') {
        toast.error('El correo electrónico no es válido.');
      } else if (registerError.code === 'auth/weak-password') {
        toast.error('La contraseña es demasiado débil.');
      } else {
        toast.error('Error al registrar la cuenta.');
      }
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
          Regístrate en FixGo
        </h2>

        {/* Los errores se mostrarán mediante toasts */}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-text-primary mb-1">
              Nombre de Usuario:
            </label>
            <input
              type="text"
              id="displayName"
              value={input.displayName}
              onChange={(e) => setInput({ ...input, displayName: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="Tu nombre o apodo"
            />
          </div>
          <div>
            <label htmlFor="emailR" className="block text-sm font-medium text-text-primary mb-1">
              Correo Electrónico:
            </label>
            <input
              type="email"
              id="emailR" // Usando el id que tenías
              value={input.email}
              onChange={(e) => setInput({ ...input, email: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label htmlFor="passwordR" className="block text-sm font-medium text-text-primary mb-1">
              Contraseña (mín. 6 caracteres):
            </label>
            <input
              type="password"
              id="passwordR" // Usando el id que tenías
              value={input.password}
              onChange={(e) => setInput({ ...input, password: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium rounded-lg shadow-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-1">
              País:
            </label>
            <select
              id="country"
              value={input.country}
              onChange={(e) => setInput({ ...input, country: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2.5 border border-neutral-medium bg-neutral-white rounded-lg shadow-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
            >
              <option value="">Selecciona tu país</option>
              <option value="México">México</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Colombia">Colombia</option>
              <option value="Perú">Perú</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Cuba">Cuba</option>
              <option value="Honduras">Honduras</option>
              <option value="Guatemala">Guatemala</option>
              <option value="Nicaragua">Nicaragua</option>
              <option value="El Salvador">El Salvador</option>
              <option value="Panamá">Panamá</option>
              <option value="República Dominicana">República Dominicana</option>
              <option value="Puerto Rico">Puerto Rico</option>
              {/* Puedes añadir más países o cargarlos dinámicamente */}
            </select>
          </div>
          <div className="pt-2"> {/* Un poco más de espacio antes del botón */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-neutral-white 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         transition-all duration-150 ease-in-out transform active:scale-95
                         ${
                           loading
                             ? 'bg-green-300 cursor-not-allowed' // Verde más claro para deshabilitado
                             : 'bg-brand-green hover:bg-green-700 focus:ring-brand-green'
                         }`}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-text-secondary pt-2">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-blue hover:text-blue-700 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;