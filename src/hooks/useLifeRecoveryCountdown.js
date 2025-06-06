// src/hooks/useLifeRecoveryCountdown.js
import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore'; // Necesario para la conversión

// MAX_LIVES podría ser importado de una constante global si la tienes,
// o podrías pasarla como prop si varía. Por ahora, la pasaremos.
// LIFE_RECOVERY_INTERVAL no se usa directamente aquí, pero checkAndRecoverLife sí.

const useLifeRecoveryCountdown = (currentUser, MAX_LIVES, checkAndRecoverLife) => {
  const [recoveryCountdown, setRecoveryCountdown] = useState('');

  useEffect(() => {
    let intervalId; // Para limpiar el intervalo

    let nextRecoveryTimeDate = currentUser?.nextLifeRecoveryTime;
    if (nextRecoveryTimeDate instanceof Timestamp) {
      nextRecoveryTimeDate = nextRecoveryTimeDate.toDate();
    }

    if (
      currentUser?.uid &&
      typeof currentUser.lives === 'number' && // Asegura que lives sea un número
      currentUser.lives < MAX_LIVES &&
      nextRecoveryTimeDate instanceof Date &&
      !isNaN(nextRecoveryTimeDate.getTime()) // Asegura que sea una fecha válida
    ) {
      const updateCountdown = () => {
        const now = Date.now(); // Usar Date.now() es más directo que new Date().getTime()
        const recoveryTimeMillis = nextRecoveryTimeDate.getTime();
        const difference = Math.max(0, recoveryTimeMillis - now);

        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setRecoveryCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);

        if (difference <= 0) {
          clearInterval(intervalId);
          setRecoveryCountdown(''); // Limpiar inmediatamente
          if (typeof checkAndRecoverLife === 'function') {
            console.log("useLifeRecoveryCountdown: Countdown finished, calling checkAndRecoverLife.");
            checkAndRecoverLife();
          }
        }
      };

      updateCountdown(); // Llamada inicial para establecer el valor sin esperar 1 segundo
      intervalId = setInterval(updateCountdown, 1000);
    } else {
      // Si no se cumplen las condiciones, asegurar que el countdown esté vacío
      setRecoveryCountdown('');
    }

    // Función de limpieza para el useEffect
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // Las dependencias deben reflejar cuándo necesita recalcularse el intervalo o el estado
  }, [
    currentUser?.uid,
    currentUser?.lives,
    currentUser?.nextLifeRecoveryTime, // Esta dependencia es clave
    MAX_LIVES,
    checkAndRecoverLife // Es una función, debería estar memoizada (useCallback) donde se define
  ]);

  return recoveryCountdown;
};

export default useLifeRecoveryCountdown;