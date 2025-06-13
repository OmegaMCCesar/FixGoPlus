// hooks/useAdiamantadoStatus.js
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Marca como "adiamantado" una lección, nivel o módulo si se cumple la condición de perfección.
 * @param {string} userId - UID del usuario.
 * @param {string} moduleId - ID del módulo.
 * @param {string} levelId - ID del nivel.
 * @param {string} lessonId - ID de la lección completada.
 * @param {number} totalQuestions - Número total de preguntas.
 * @param {Set<string>} correctlyAnsweredQuestions - Preguntas correctas en esta lección.
 */
const useAdiamantadoStatus = async (userId, moduleId, levelId, lessonId, totalQuestions, correctlyAnsweredQuestions) => {
  if (!userId || !levelId || !lessonId) return;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();

    const currentLevelProgress = userData.levelProgress || {};
    const currentXp = userData.xp || 0;
    const tuerquitas = userData.tuerquitas || 0;

    let updates = {};
    let tuerquitasEarned = 0;

    // Verifica si la lección fue perfecta
    if (correctlyAnsweredQuestions.size === totalQuestions) {
      updates[`levelProgress.${levelId}.lessons.${lessonId}.adiamantada`] = true;
      tuerquitasEarned += 10;
    }

    // Verifica si todas las lecciones del nivel están adiamantadas
    const allLessons = currentLevelProgress[levelId]?.lessons || {};
    const updatedLessons = {
      ...allLessons,
      [lessonId]: {
        ...(allLessons[lessonId] || {}),
        adiamantada: correctlyAnsweredQuestions.size === totalQuestions,
      },
    };
    const allLessonsAdiamantadas = Object.values(updatedLessons).every(l => l.adiamantada);
    if (allLessonsAdiamantadas) {
      updates[`levelProgress.${levelId}.adiamantado`] = true;
    }

    // Verifica si todos los niveles del módulo están adiamantados
    const userLevels = userData.levels || [];
    const levelsOfModule = userLevels.filter(l => l.moduleId === moduleId);
    const allLevelsAdiamantados = levelsOfModule.every(l => currentLevelProgress[l.id]?.adiamantado === true);
    if (allLevelsAdiamantados) {
      updates[`modulesAdiamantados.${moduleId}`] = true;
    }

    // Actualiza XP y tuerquitas
    updates['xp'] = currentXp;
    updates['tuerquitas'] = tuerquitas + tuerquitasEarned;

    // Aplica los cambios en Firestore
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error en useAdiamantadoStatus:', error);
  }
};

export default useAdiamantadoStatus;
