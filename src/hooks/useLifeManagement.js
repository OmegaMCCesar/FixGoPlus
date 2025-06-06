// hooks/useLifeManagement.js
import { useContext, useCallback } from 'react'; // Importa useCallback
import { db } from '../firebaseConfig';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { UserContext } from '../contexts/UserContext'; // Asumo que esta es la ruta correcta

const LIFE_RECOVERY_INTERVAL = 30 * 60 * 1000; // 30 minutos en milisegundos
const MAX_LIVES = 5;

const useLifeManagement = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const handleLifeLoss = useCallback(async () => {
    if (!currentUser || !currentUser.uid || currentUser.lives <= 0) {
      console.log("handleLifeLoss: No hay vidas que perder o no hay usuario.");
      return;
    }

    const previousLives = currentUser.lives;
    const newLivesCount = previousLives - 1; // No es necesario Math.max(0, ...) aquí si ya verificamos lives <=0

    const updates = { lives: newLivesCount };
    let newNextLifeRecoveryTimeForState = currentUser.nextLifeRecoveryTime instanceof Timestamp ?
                                          currentUser.nextLifeRecoveryTime.toDate() :
                                          currentUser.nextLifeRecoveryTime; // Mantén el actual si ya está en formato Date

    // Solo se establece/reinicia el temporizador si:
    // 1. El usuario tenía el máximo de vidas (esta es la primera vida perdida que inicia el ciclo).
    // 2. O si no había un tiempo de recuperación programado (ej. de 0 vidas, compró, y ahora pierde una).
    if (newLivesCount < MAX_LIVES && (previousLives === MAX_LIVES || !currentUser.nextLifeRecoveryTime)) {
      const nextRecoveryMillis = Date.now() + LIFE_RECOVERY_INTERVAL;
      updates.nextLifeRecoveryTime = Timestamp.fromMillis(nextRecoveryMillis);
      newNextLifeRecoveryTimeForState = new Date(nextRecoveryMillis); // Para el estado local
      console.log(`handleLifeLoss: Vida perdida. Iniciando/reiniciando temporizador. Próxima vida en: ${newNextLifeRecoveryTimeForState}`);
    } else {
      console.log(`handleLifeLoss: Vida perdida. El temporizador de recuperación existente continúa. Vidas: ${newLivesCount}`);
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updates);

      setCurrentUser(prev => ({
        ...prev,
        lives: newLivesCount,
        // Actualiza nextLifeRecoveryTime en el estado local solo si se calculó uno nuevo
        nextLifeRecoveryTime: (updates.nextLifeRecoveryTime && newNextLifeRecoveryTimeForState) ? newNextLifeRecoveryTimeForState : prev.nextLifeRecoveryTime,
      }));
    } catch (error) {
      console.error('Error en handleLifeLoss al actualizar Firestore:', error);
    }
  }, [currentUser, setCurrentUser]); // Dependencias de useCallback


  const checkAndRecoverLife = useCallback(async () => {
    if (!currentUser || !currentUser.uid || currentUser.lives >= MAX_LIVES || !currentUser.nextLifeRecoveryTime) {
      // console.log("checkAndRecoverLife: No se necesita recuperación o datos insuficientes.");
      return false; // No se hizo recuperación
    }

    // Asegurarse de que trabajamos con un objeto Date para el tiempo de recuperación inicial
    let initialRecoveryTimeDateObj = currentUser.nextLifeRecoveryTime;
    if (initialRecoveryTimeDateObj instanceof Timestamp) {
      initialRecoveryTimeDateObj = initialRecoveryTimeDateObj.toDate();
    }

    // Si después de convertir sigue sin ser una fecha válida, no podemos continuar
    if (!(initialRecoveryTimeDateObj instanceof Date) || isNaN(initialRecoveryTimeDateObj.getTime())) {
        console.error("checkAndRecoverLife: nextLifeRecoveryTime no es una fecha válida en el estado actual:", currentUser.nextLifeRecoveryTime);
        return false;
    }

    const initialScheduledRecoveryMillis = initialRecoveryTimeDateObj.getTime();
    const now = Date.now();

    if (now < initialScheduledRecoveryMillis) {
      // Aún no es tiempo para la primera vida programada para recuperarse
      // console.log("checkAndRecoverLife: Aún no es tiempo para la recuperación programada.");
      return false;
    }

    // Calcular cuántos intervalos COMPLETOS han pasado desde que la primera vida estaba DENTRO del plazo de recuperación
    const timeDifferenceSinceScheduled = now - initialScheduledRecoveryMillis;
    const intervalsPassed = Math.floor(timeDifferenceSinceScheduled / LIFE_RECOVERY_INTERVAL) + 1; // +1 porque initialScheduledRecoveryMillis cuenta como un punto de recuperación

    const livesPossibleToRecoverBasedOnMax = MAX_LIVES - currentUser.lives;
    const actualLivesToRecover = Math.min(intervalsPassed, livesPossibleToRecoverBasedOnMax);

    if (actualLivesToRecover <= 0) {
      // console.log("checkAndRecoverLife: No hay vidas completas para recuperar en este ciclo.");
      return false;
    }

    const newTotalLives = currentUser.lives + actualLivesToRecover;
    let newNextRecoveryTimestampForFirestore = null; // Para Firestore (Timestamp o null)
    let newNextRecoveryDateForState = null;      // Para el estado local (Date o null)

    if (newTotalLives < MAX_LIVES) {
      // Si aún no se llenaron las vidas, calcular cuándo será la SIGUIENTE
      // Esto se basa en el tiempo original + el número de vidas que SÍ se recuperaron
      const nextDueTimeMillis = initialScheduledRecoveryMillis + (actualLivesToRecover * LIFE_RECOVERY_INTERVAL);
      newNextRecoveryTimestampForFirestore = Timestamp.fromMillis(nextDueTimeMillis);
      newNextRecoveryDateForState = new Date(nextDueTimeMillis);
    }
    // Si newTotalLives === MAX_LIVES, ambos 'newNext...' permanecen null, lo que significa que no hay más recuperaciones programadas.

    const updatesToFirestore = {
      lives: newTotalLives,
      nextLifeRecoveryTime: newNextRecoveryTimestampForFirestore, // Será null si las vidas están llenas
    };

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updatesToFirestore);

      // Actualiza el estado local
      setCurrentUser(prev => ({
        ...prev,
        lives: newTotalLives,
        nextLifeRecoveryTime: newNextRecoveryDateForState, // Será null si las vidas están llenas
      }));
      console.log(`checkAndRecoverLife: Se recuperaron ${actualLivesToRecover} vida(s). Total de vidas ahora: ${newTotalLives}. Próxima recuperación programada para: ${newNextRecoveryDateForState || 'N/A'}`);
      return true; // Se hizo recuperación
    } catch (error) {
      console.error("Error en checkAndRecoverLife al actualizar Firestore:", error);
      return false;
    }
  }, [currentUser, setCurrentUser]); // Dependencias de useCallback

  return { handleLifeLoss, checkAndRecoverLife, LIFE_RECOVERY_INTERVAL, MAX_LIVES };
};

export default useLifeManagement;