// hooks/useLevelCompletion.js
import { useContext } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDoc, } from 'firebase/firestore'; // Asegúrate de importar Timestamp si lo usas aquí
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const useLevelCompletion = (levelId, correctlyAnsweredQuestions, questionsInLesson) => {
  // Nota: correctlyAnsweredQuestions y questionsInLesson no se usan actualmente aquí,
  // pero podrían usarse para calcular score o verificar completitud si es necesario.
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const completeLevel = async () => {
    try {
      if (!currentUser?.uid) {
        console.error("COMPLETE_LEVEL: No hay currentUser.uid");
        return;
      }

      console.log("COMPLETE_LEVEL: Iniciando completitud para nivel:", levelId);

      const newLevelExperience = 20; // XP por completar por primera vez
      const completedLevelExperience = 10; // XP por repetir nivel completado
      let experienceToAward = newLevelExperience;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
         console.error("COMPLETE_LEVEL: No existe el documento del usuario en Firestore.");
         return;
      }

      const userData = userDocSnapshot.data();
      const currentXP = userData?.xp || 0;
      const currentCompletedLevels = userData?.completedLevels || [];

      // Verifica si el nivel ya estaba completado para dar menos XP
      const alreadyCompleted = currentCompletedLevels.includes(levelId);
      if (alreadyCompleted) {
        experienceToAward = completedLevelExperience;
        console.log("COMPLETE_LEVEL: El nivel ya estaba completado, otorgando XP reducido:", experienceToAward);
      } else {
         console.log("COMPLETE_LEVEL: Primera vez completando el nivel, otorgando XP:", experienceToAward);
      }

      const newXP = currentXP + experienceToAward;
      const updatedCompletedLevels = alreadyCompleted ? currentCompletedLevels : [...currentCompletedLevels, levelId];

      // 1. Actualizar Firestore
      await updateDoc(userDocRef, {
        completedLevels: updatedCompletedLevels,
        [`levelProgress.${levelId}`]: null, // Limpiar progreso específico del nivel
        xp: newXP
      });
      console.log("COMPLETE_LEVEL: Firestore actualizado correctamente.");

      // --- LOGS DE DEPURACIÓN ANTES Y DENTRO DE SETCURRENTUSER ---

      // 2. Preparar el objeto para el estado local y loguearlo
      // Usamos los datos LEÍDOS de Firestore + los calculados aquí para mayor precisión
      const updatedLocalUser = {
          ...userData, // Copia los datos leídos de Firestore
          uid: currentUser.uid, // Asegura uid por si acaso
          email: currentUser.email, // Asegura email
          displayName: currentUser.displayName, // Asegura displayName
          // Asegura otros campos importantes del estado local que no cambian aquí
          lives: currentUser.lives,
          tuerquitas: currentUser.tuerquitas,
          country: currentUser.country,
          isSubscribed: currentUser.isSubscribed,
          subscriptionExpiry: currentUser.subscriptionExpiry,
          nextLifeRecoveryTime: currentUser.nextLifeRecoveryTime, // Mantén la fecha/null del estado local
          lastLifeRecharge: currentUser.lastLifeRecharge, // Mantén la fecha/null del estado local
          levelProgress: userData.levelProgress ? { ...userData.levelProgress, [levelId]: null } : { [levelId]: null }, // Copia el progreso y elimina el nivel actual
          incorrecQtQuestions: userData.incorrecQtQuestions, // Asegura este campo
          // Sobrescribe con los nuevos valores calculados
          completedLevels: updatedCompletedLevels,
          xp: newXP
      };
      console.log("COMPLETE_LEVEL: Estado local esperado después de la actualización:", updatedLocalUser);

      // 3. Llamada a setCurrentUser con logs internos
      setCurrentUser(prev => {
          console.log("COMPLETE_LEVEL: Estado 'prev' DENTRO de setCurrentUser:", prev);
          // Reconstruimos el estado basado en prev pero asegurando los campos clave
          // Esta versión es más segura si prev pudiera ser inesperado
          const newState = {
              ...(prev || {}), // Usa prev si existe, sino objeto vacío
              // Sobrescribe con los datos actualizados que calculamos
              completedLevels: updatedCompletedLevels,
              xp: newXP,
              // Actualiza también el levelProgress localmente
              levelProgress: prev?.levelProgress ? { ...prev.levelProgress, [levelId]: null } : { [levelId]: null },
              // Aseguramos campos esenciales por si 'prev' fuera incompleto
              uid: prev?.uid || currentUser?.uid,
              email: prev?.email || currentUser?.email,
              displayName: prev?.displayName || currentUser?.displayName,
              lives: prev?.lives ?? 5, // Valor por defecto si es null/undefined
              tuerquitas: prev?.tuerquitas ?? 0, // Valor por defecto
          };
          return newState;
      });

      // 4. Navegación
      setTimeout(() => {
          navigate('/');
      }, 1500); // Delay para que el usuario vea el mensaje de completado

    } catch (error) {
      console.error('Error al completar el nivel:', error);
      // Podrías añadir un feedback al usuario aquí si falla la actualización
    }
  };

  return { completeLevel };
};

export default useLevelCompletion;