// hooks/useAnswerSubmission.js
import { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const useAnswerSubmission = (
  currentUser,
  currentQuestion,
  nextQuestion,
  handleLifeLoss,
  levelId,
  lessonId,
  correctlyAnsweredQuestions,
  setCorrectlyAnsweredQuestions,
  onShowFeedback,
  totalQuestions,
  onLevelCompleted
) => {
  const [userAnswer, setUserAnswer] = useState('');

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !currentUser?.uid) return;
    const questionIdentifier = currentQuestion.id;
    if (!questionIdentifier) return;
    if (!(correctlyAnsweredQuestions instanceof Set)) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    let feedbackTitle = '';
    let feedbackExplanation = currentQuestion.explanation || '';

    let lessonHadErrors = false;

    if (isCorrect) {
      feedbackTitle = '¡Correcto!';
      if (typeof onShowFeedback === 'function') {
        onShowFeedback(feedbackTitle, feedbackExplanation, 'success');
      }

      const alreadyAnswered = correctlyAnsweredQuestions.has(questionIdentifier);
      if (!alreadyAnswered) {
        const newCorrectlyAnsweredSet = new Set(correctlyAnsweredQuestions).add(questionIdentifier);
        setCorrectlyAnsweredQuestions(newCorrectlyAnsweredSet);

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          const userData = userSnap.data();

          const previousHadErrors = userData?.levelProgress?.[levelId]?.lessons?.[lessonId]?.hadErrors;

          await updateDoc(userDocRef, {
            [`levelProgress.${levelId}.lessons.${lessonId}.correctlyAnswered`]: Array.from(newCorrectlyAnsweredSet),
            [`levelProgress.${levelId}.lessons.${lessonId}.hadErrors`]: previousHadErrors === true ? true : false
          });
        } catch (dbError) {
          console.error("Error actualizando Firestore:", dbError);
          if (typeof onShowFeedback === 'function') {
            onShowFeedback('Error', 'No se pudo guardar tu progreso.', 'error');
          }
        }
      }
      setTimeout(() => nextQuestion && nextQuestion(), 1200);
    } else {
      feedbackTitle = '¡Incorrecto!';
      lessonHadErrors = true;
console.log(lessonHadErrors, 'lessonHadErrors');

      if (typeof onShowFeedback === 'function') {
        onShowFeedback(feedbackTitle, feedbackExplanation, 'error');
      }

      if (typeof handleLifeLoss === 'function') {
        await handleLifeLoss();
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          [`levelProgress.${levelId}.lessons.${lessonId}.hadErrors`]: true
        });
      } catch (dbError) {
        console.error("Error registrando error en Firestore:", dbError);
      }

      setTimeout(() => nextQuestion && nextQuestion(), 1500);
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
