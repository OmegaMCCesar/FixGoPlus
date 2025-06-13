import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link,} from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../contexts/UserContext';
import useLessonData from '../../hooks/useLessonData';
import useAnswerSubmission from '../../hooks/useAnswerSubmission';
import useLifeManagement from '../../hooks/useLifeManagement';
import useLevelCompletion from '../../hooks/useLevelCompletion';
import useLessonContentNavigation from '../../hooks/useLessonContentNavigation';
import Navbar from '../Navigation/Navbar';
import QuestionDisplay from './QuestionDisplay';
import { Timestamp } from 'firebase/firestore';

const LessonPage = () => {
  const { levelId, lessonId } = useParams();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const { lessons: allLessonsForLevel, loading: loadingLessonsList } = useLessonData(levelId);
  const [currentLesson, setCurrentLesson] = useState(null);

  const {
    currentContentItem,
    advanceToNextContentItem,
    allQuestionsInLesson,
    currentContentDisplayIndex,
    totalContentItems,
    isLastContentItem,
    hasReachedEnd,
  } = useLessonContentNavigation(currentLesson);

  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState(new Set());
  const { handleLifeLoss, checkAndRecoverLife, } = useLifeManagement();

  const { completeLevel, levelCompleted } = useLevelCompletion(
    levelId,
    lessonId,
    correctlyAnsweredQuestions,
    allQuestionsInLesson
  );

  // ✅ Feedback para respuestas
  const displayToastFeedback = useCallback((title, explanation, type) => {
    const toastContent = (
      <div style={{ textAlign: 'left', cursor: 'pointer' }} onClick={(t) => toast.dismiss(t.id)}>
        <b style={{ display: 'block', marginBottom: explanation ? '4px' : '0' }}>{title}</b>
        {explanation && <p style={{ fontSize: '0.9em', margin: 0 }}>{explanation}</p>}
      </div>
    );
    const options = { id: `feedback-toast-${Date.now()}`, duration: type === 'error' ? 4000 : 3000 };
    if (type === 'success') toast.success(toastContent, options);
    else if (type === 'error') toast.error(toastContent, options);
    else toast(toastContent, options);
  }, []);

  const { handleAnswerSubmit, userAnswer, setUserAnswer } = useAnswerSubmission(
    currentUser,
    currentContentItem?.type === 'question' ? currentContentItem : null,
    advanceToNextContentItem,
    handleLifeLoss,
    levelId,
    lessonId,
    correctlyAnsweredQuestions,
    setCorrectlyAnsweredQuestions,
    displayToastFeedback, // ✅ pasa el toast al hook
    allQuestionsInLesson.length
  );

  useEffect(() => {
    if (!loadingLessonsList && allLessonsForLevel && lessonId) {
      const foundLesson = allLessonsForLevel.find((lesson) => lesson.id === lessonId);
      if (foundLesson) {
        setCurrentLesson(foundLesson);
        setCorrectlyAnsweredQuestions(new Set());
      } else {
        setCurrentLesson(null);
      }
    }
  }, [loadingLessonsList, allLessonsForLevel, lessonId]);

  useEffect(() => {
    if (setUserAnswer) setUserAnswer('');
  }, [currentContentItem, setUserAnswer]);

  useEffect(() => {
    if (hasReachedEnd && currentLesson && !levelCompleted && typeof completeLevel === 'function') {
      completeLevel();
    }
  }, [hasReachedEnd, currentLesson, levelCompleted, completeLevel]);

  useEffect(() => {
    if (currentUser?.uid && typeof checkAndRecoverLife === 'function') {
      checkAndRecoverLife();
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.nextLifeRecoveryTime instanceof Timestamp) {
      setCurrentUser((prev) => ({
        ...prev,
        nextLifeRecoveryTime: currentUser.nextLifeRecoveryTime.toDate(),
      }));
    }
  }, [currentUser?.nextLifeRecoveryTime, setCurrentUser]);

  if (!currentUser || loadingLessonsList || !currentLesson) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-brand-blue">Cargando lección...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-neutral-medium">
          <div className="mb-4">
            <Link
              to={`/levels/${levelId}`}
              className="text-sm text-brand-blue hover:underline font-medium inline-flex items-center"
            >
              &larr; Volver a lecciones del nivel
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-blue mb-2">
            {currentLesson?.title || 'Lección'}
          </h1>
          {totalContentItems > 0 && (
            <p className="text-sm text-text-secondary mb-6">
              Elemento {currentContentDisplayIndex} de {totalContentItems}
            </p>
          )}

          {currentContentItem?.type === 'text' && (
            <div className="prose prose-lg text-text-primary">
              {currentContentItem.value.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {currentContentItem?.type === 'image' && (
            <div className="text-center my-4">
              <img
                src={currentContentItem.url}
                alt={currentContentItem.caption || 'Imagen'}
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
              {currentContentItem.caption && (
                <p className="text-sm text-gray-500 italic mt-2">
                  {currentContentItem.caption}
                </p>
              )}
            </div>
          )}

          {currentContentItem?.type === 'question' && (
            <QuestionDisplay
              question={currentContentItem}
              userAnswer={userAnswer}
              setUserAnswer={setUserAnswer}
              handleAnswerSubmit={handleAnswerSubmit}
            />
          )}

          {currentContentItem?.type !== 'question' && !isLastContentItem && (
            <div className="mt-8 text-right">
              <button onClick={advanceToNextContentItem} className="btn-primary">
                Siguiente
              </button>
            </div>
          )}

          {currentContentItem?.type !== 'question' && isLastContentItem && !levelCompleted && (
            <div className="mt-8 text-right">
              <button onClick={completeLevel} className="btn-success">
                Finalizar Lección
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
