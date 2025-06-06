// hooks/useAnswerSubmission.js
import { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const useAnswerSubmission = (
  currentUser,
  currentQuestion,
  nextQuestion,
  handleLifeLoss,
  levelId,
  lessonId,
  correctlyAnsweredQuestions,
  setCorrectlyAnsweredQuestions,
  onShowFeedback // <--- NUEVO PROP: función para mostrar feedback
) => {
  const [userAnswer, setUserAnswer] = useState('');

  const handleAnswerSubmit = async () => {
    // ... (tus logs y validaciones iniciales como antes) ...
    if (!currentQuestion || !currentUser?.uid) { /* ... */ return; }
    const questionIdentifier = currentQuestion.id;
    if (!questionIdentifier) { /* ... */ return; }
    if (!(correctlyAnsweredQuestions instanceof Set)) { /* ... */ return; }

    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    let feedbackTitle = '';
    let feedbackExplanation = currentQuestion.explanation || '';

    if (isCorrect) {
      feedbackTitle = '¡Correcto!';
      // Llama a la función de feedback pasada como prop
      if (typeof onShowFeedback === 'function') {
        onShowFeedback(feedbackTitle, feedbackExplanation, 'success');
      }

      const alreadyAnswered = correctlyAnsweredQuestions.has(questionIdentifier);
      if (!alreadyAnswered) {
        const newCorrectlyAnsweredSet = new Set(correctlyAnsweredQuestions).add(questionIdentifier);
        setCorrectlyAnsweredQuestions(newCorrectlyAnsweredSet);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            [`levelProgress.${levelId}.correctlyAnswered`]: Array.from(newCorrectlyAnsweredSet)
          });
        } catch (dbError) {
          console.error("Error actualizando Firestore:", dbError);
          if (typeof onShowFeedback === 'function') { // También para errores de guardado
            onShowFeedback('Error', 'No se pudo guardar tu progreso.', 'error');
          }
        }
      }
      if (typeof nextQuestion === 'function') setTimeout(() => nextQuestion(), 1200); // Un poco más de tiempo para leer el toast

    } else { // Respuesta incorrecta
      feedbackTitle = '¡Incorrecto!';
      // Llama a la función de feedback pasada como prop
      if (typeof onShowFeedback === 'function') {
        onShowFeedback(feedbackTitle, feedbackExplanation, 'error');
      }

      if (typeof handleLifeLoss === 'function') {
        await handleLifeLoss();
      }
      if (typeof nextQuestion === 'function') setTimeout(() => nextQuestion(), 1500); // Un poco más de tiempo
    }
    setUserAnswer('');
  };

  return {
    userAnswer,
    setUserAnswer,
    handleAnswerSubmit,
  };
};

export default useAnswerSubmission;