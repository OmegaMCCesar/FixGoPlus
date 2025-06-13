// hooks/useLevelCompletion.js
import { useContext } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const useLevelCompletion = (levelId, lessonId, correctlyAnsweredQuestions, questionsInLesson) => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const completeLevel = async () => {
    try {
      if (!currentUser?.uid) return;

      const newLevelXP = 20;
      const repeatedLevelXP = 10;
      let xpEarned = newLevelXP;

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data();

      const completedLevels = userData.completedLevels || [];
      const alreadyCompleted = completedLevels.includes(levelId);
      if (alreadyCompleted) xpEarned = repeatedLevelXP;

      const newXP = (userData.xp || 0) + xpEarned;

      // --- ACTUALIZAR NIVEL COMO COMPLETADO ---
      const updatedCompletedLevels = alreadyCompleted
        ? completedLevels
        : [...completedLevels, levelId];

      // --- ACTUALIZAR LECCIÓN COMO ADIAMANTADA ---
      const adiamantadas = userData.adiamantadas || [];
      const isPerfect = questionsInLesson.length === correctlyAnsweredQuestions.size;
      const newAdiamantadas = isPerfect && !adiamantadas.includes(levelId)
        ? [...adiamantadas, levelId]
        : adiamantadas;

      const updatePayload = {
        xp: newXP,
        completedLevels: updatedCompletedLevels,
        adiamantadas: newAdiamantadas,
        [`levelProgress.${levelId}`]: null,
      };

      await updateDoc(userRef, updatePayload);

      // --- VERIFICAR SI EL MÓDULO ESTÁ COMPLETADO ---
      const levelRef = doc(db, 'levels', levelId);
      const levelSnap = await getDoc(levelRef);
      const levelData = levelSnap.data();
      const moduleId = levelData?.moduleId;
      if (!moduleId) return;

      const qLevels = collection(db, 'levels');
      const allLevelsSnap = await getDocs(qLevels);
      const levelsInModule = allLevelsSnap.docs
        .filter(doc => doc.data().moduleId === moduleId)
        .map(doc => doc.id);

      const allAdiamantados = levelsInModule.every(id => newAdiamantadas.includes(id));
      if (allAdiamantados) {
        await setDoc(doc(db, `users/${currentUser.uid}/completedModules/${moduleId}`), {
          completedAt: new Date().toISOString()
        });
      }

      setCurrentUser(prev => ({
        ...prev,
        xp: newXP,
        adiamantadas: newAdiamantadas,
        completedLevels: updatedCompletedLevels,
        levelProgress: {
          ...prev.levelProgress,
          [levelId]: null
        }
      }));

      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error("Error al completar nivel:", err);
    }
  };

  return { completeLevel };
};

export default useLevelCompletion;
