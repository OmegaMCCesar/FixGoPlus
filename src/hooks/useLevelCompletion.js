import { useContext } from 'react';
import { db } from '../firebaseConfig';
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const useLevelCompletion = (levelId, lessonId, correctlyAnsweredQuestions, questionsInLesson) => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const completeLevel = async () => {
    try {
      if (!currentUser?.uid) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return;
      const userData = userDocSnap.data();

      const currentXP = userData?.xp || 0;
      const currentCompletedLevels = userData?.completedLevels || [];
      const alreadyCompleted = currentCompletedLevels.includes(levelId);
      const allCorrect = correctlyAnsweredQuestions.size === questionsInLesson.length;

      const adiamantadas = { ...(userData?.adiamantadas || {}) };
      const completedLevels = alreadyCompleted ? currentCompletedLevels : [...currentCompletedLevels, levelId];
      let tuerquitasToAdd = 0;
      let xpToAdd = alreadyCompleted ? 10 : 20;

      // Marcar lección como perfecta si aplica
      if (!adiamantadas[lessonId] && allCorrect) {
        adiamantadas[lessonId] = true;
        tuerquitasToAdd += 10;
      }

      // Verificar si todas las lecciones del nivel están perfectas
      const levelLessons = Object.keys(userData.levelProgress?.[levelId]?.lessons || {});
      const allLessonsPerfect = levelLessons.length > 0 && levelLessons.every(
        (lesson) => adiamantadas[lesson]
      );

      if (allLessonsPerfect && !adiamantadas[`nivel-${levelId}`]) {
        adiamantadas[`nivel-${levelId}`] = true;
        tuerquitasToAdd += 20;
      }

      // 🔍 Obtener el moduleId desde Firestore (colección levels)
      const levelRef = doc(db, 'levels', levelId);
      const levelSnap = await getDoc(levelRef);
      if (!levelSnap.exists()) {
        console.warn(`Nivel ${levelId} no encontrado en la colección levels`);
        return;
      }
      const moduleId = levelSnap.data().moduleId;

      // Verificar si todos los niveles del módulo están adiamantados
      const levelsQuery = query(collection(db, 'levels'), where('moduleId', '==', moduleId));
      const levelDocs = await getDocs(levelsQuery);
      const levelIdsOfModule = levelDocs.docs.map(doc => doc.id);

      const allLevelsAdiamantados = levelIdsOfModule.length > 0 &&
        levelIdsOfModule.every(id => adiamantadas[`nivel-${id}`]);

      let completedModule = false;
      if (allLevelsAdiamantados && !adiamantadas[`modulo-${moduleId}`]) {
        adiamantadas[`modulo-${moduleId}`] = true;
        tuerquitasToAdd += 50;
        completedModule = true;

        const completedModuleRef = doc(db, `users/${currentUser.uid}/completedModules/${moduleId}`);
        const completedSnap = await getDoc(completedModuleRef);
        if (!completedSnap.exists()) {
          await setDoc(completedModuleRef, {
            completedAt: new Date(),
            moduleId: moduleId,
          });
        }
      }

      const newXP = currentXP + xpToAdd;
      const newTuerquitas = (userData.tuerquitas || 0) + tuerquitasToAdd;

      await updateDoc(userDocRef, {
        completedLevels,
        [`levelProgress.${levelId}.lessons.${lessonId}`]: {
          attempts: 1,
          lastScore: 100,
          hadErrors: !allCorrect,
        },
        adiamantadas,
        xp: newXP,
        tuerquitas: newTuerquitas,
      });

      setCurrentUser((prev) => ({
        ...prev,
        completedLevels,
        xp: newXP,
        tuerquitas: newTuerquitas,
        adiamantadas,
        levelProgress: {
          ...(prev.levelProgress || {}),
          [levelId]: {
            ...(prev.levelProgress?.[levelId] || {}),
            lessons: {
              ...(prev.levelProgress?.[levelId]?.lessons || {}),
              [lessonId]: {
                attempts: 1,
                lastScore: 100,
                hadErrors: !allCorrect,
              },
            },
          },
        },
      }));

      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('❌ Error al completar el nivel:', error);
    }
  };

  return { completeLevel };
};

export default useLevelCompletion;
