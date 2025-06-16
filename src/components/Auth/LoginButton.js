// src/components/LoginButton.js
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

const LoginButton = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName || '',
          email: user.email || '',
          xp: 0,
          tuerquitas: 0,
          lives: 3,
          isAdmin: false,
          isSubscribed: false,
          adiamantadas: {},
          completedLevels: [],
          levelProgress: {},
          createdAt: serverTimestamp(),
          country: user.reloadUserInfo?.locale || 'desconocido',
        });
        console.log("🆕 Usuario creado en Firestore:", user.uid);
      } else {
        console.log("✔️ Usuario ya existía:", user.uid);
      }

      // Obtener nuevamente los datos frescos
      const freshSnap = await getDoc(userRef);
      setCurrentUser({
        uid: user.uid,
        ...freshSnap.data()
      });

      navigate('/'); // Redirigir al dashboard

    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-white text-text-primary font-semibold py-3 px-4 border border-neutral-medium rounded hover:bg-neutral-light transition flex items-center justify-center"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
      Iniciar con Google
    </button>
  );
};

export default LoginButton;
