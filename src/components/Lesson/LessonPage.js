// src/components/Lesson/LessonPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link} // Añadido useNavigate
from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../Navigation/Navbar';
import { UserContext } from '../../contexts/UserContext';
import useLessonData from '../../hooks/useLessonData';
import useAnswerSubmission from '../../hooks/useAnswerSubmission';
import useLifeManagement from '../../hooks/useLifeManagement';
import useLevelCompletion from '../../hooks/useLevelCompletion';
import useLessonContentNavigation from '../../hooks/useLessonContentNavigation';
import useLifeRecoveryCountdown from '../../hooks/useLifeRecoveryCountdown';
import QuestionDisplay from './QuestionDisplay'; // Estilos de este componente se manejan internamente
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Iconos (Ejemplos, puedes usar Heroicons u otros SVG)
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
  </svg>
);
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L11.44 10 7.21 6.29A.75.75 0 1 1 8.27 5.23l4.77 4.22a.75.75 0 0 1 0 1.1L8.27 14.77a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
    </svg>
);
const CheckCircleSolidIcon = () => ( // Para Lección Completada
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-brand-green mb-4">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);
const NoLivesIcon = () => ( // Ejemplo para pantalla Sin Vidas
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-accent-red mb-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);


const LessonPage = () => {
  const { levelId, lessonId } = useParams();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const { lessons: allLessonsForLevel, loading: loadingLessonsList, error: errorLoadingLessons } = useLessonData(levelId);
  const [currentLesson, setCurrentLesson] = useState(null);

  const {
    currentContentItem, advanceToNextContentItem, allQuestionsInLesson,
    currentContentDisplayIndex, totalContentItems, isLastContentItem,
    hasReachedEnd, isLoadingContent,
  } = useLessonContentNavigation(currentLesson);

  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState(new Set());
  const { handleLifeLoss, checkAndRecoverLife, MAX_LIVES } = useLifeManagement();
  const recoveryCountdown = useLifeRecoveryCountdown(currentUser, MAX_LIVES, checkAndRecoverLife);

  const displayToastFeedback = useCallback((title, explanation, type) => {
    // Lógica del toast sin cambios (estilos inline)
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

  useEffect(() => {
    if (!loadingLessonsList && allLessonsForLevel && lessonId) {
      const foundLesson = allLessonsForLevel.find(lesson => lesson.id === lessonId);
      if (foundLesson) {
        setCurrentLesson(foundLesson);
        setCorrectlyAnsweredQuestions(new Set());
      } else {
        setCurrentLesson(null);
        console.error(`LessonPage: Lección con ID ${lessonId} no encontrada.`);
      }
    }
  }, [loadingLessonsList, allLessonsForLevel, lessonId]);

  const { completeLevel, levelCompleted } = useLevelCompletion(
    levelId, lessonId, correctlyAnsweredQuestions, allQuestionsInLesson
  );

  const { handleAnswerSubmit, userAnswer, setUserAnswer } = useAnswerSubmission(
    currentUser,
    currentContentItem?.type === 'question' ? currentContentItem : null,
    advanceToNextContentItem, handleLifeLoss, levelId, lessonId,
    correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions, displayToastFeedback
  );

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
  }, [currentUser?.uid, currentUser?.lives, currentUser?.nextLifeRecoveryTime, checkAndRecoverLife]);

  useEffect(() => {
    if (currentUser?.nextLifeRecoveryTime instanceof Timestamp) {
      setCurrentUser(prev => ({ ...prev, nextLifeRecoveryTime: currentUser.nextLifeRecoveryTime.toDate() }));
    }
  }, [currentUser?.nextLifeRecoveryTime, setCurrentUser]);

  const LIFE_COSTS = { 1: 15, 2: 20, 5: 40 };
  const handleBuyLives = async (numLives) => {
    // Lógica de handleBuyLives sin cambios funcionales, solo estilos de toast.
    if (!currentUser?.uid) return;
    const cost = LIFE_COSTS[numLives];
    if (currentUser.tuerquitas >= cost) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const newLives = Math.min(currentUser.lives + numLives, MAX_LIVES);
      const newTuerquitas = currentUser.tuerquitas - cost;
      try {
        await updateDoc(userDocRef, {
          lives: newLives, tuerquitas: newTuerquitas,
          nextLifeRecoveryTime: newLives === MAX_LIVES ? null : currentUser.nextLifeRecoveryTime
        });
        setCurrentUser(prev => ({
          ...prev, lives: newLives, tuerquitas: newTuerquitas,
          nextLifeRecoveryTime: newLives === MAX_LIVES ? null : (prev.nextLifeRecoveryTime instanceof Timestamp ? prev.nextLifeRecoveryTime.toDate() : prev.nextLifeRecoveryTime)
        }));
        toast.success(`¡Compraste ${numLives} ${numLives > 1 ? 'vidas' : 'vida'}!`);
      } catch (error) { console.error("Error comprando vidas:", error); toast.error("No se pudieron comprar las vidas."); }
    } else { toast.error('No tienes suficientes tuerquitas.'); }
  };

  // ----- RENDERIZADO CON ESTILOS "DOPAMINA" -----

  // Estado de Carga Principal
  if (loadingLessonsList || !currentUser || (lessonId && !currentLesson && !errorLoadingLessons && !isLoadingContent)) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
          <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary text-lg">Cargando Lección...</p>
        </div>
      </div>
    );
  }

  // Estado de Error Principal
  if (errorLoadingLessons) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6">
          <div className="bg-red-100 border-l-4 border-accent-red text-accent-red p-4 rounded-md shadow-md" role="alert">
            <strong className="font-bold">¡Error al cargar!</strong>
            <span className="block sm:inline ml-1">{String(errorLoadingLessons)}</span>
            <div className="mt-3">
              <Link to={levelId ? `/levels/${levelId}` : '/'} className="text-sm font-medium text-accent-red hover:text-red-700 underline">
                &larr; Volver
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lección no encontrada
  if (!currentLesson && !loadingLessonsList && !isLoadingContent) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6 text-center">
          <div className="bg-neutral-white p-6 md:p-8 rounded-xl shadow-xl border border-neutral-medium">
            <h2 className="text-2xl font-bold text-accent-orange mb-3">Lección no Encontrada</h2>
            <p className="text-text-primary mb-4">La lección (ID: {lessonId}) no pudo ser cargada o no existe en este nivel.</p>
            {levelId && <Link to={`/levels/${levelId}`} className="text-brand-blue hover:text-blue-700 underline font-medium">Volver a la lista de lecciones</Link>}
          </div>
        </div>
      </div>
    );
  }
  
  // Pantalla "Sin Vidas"
  if (currentUser.lives < 1) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6">
          <div className="bg-neutral-white p-6 md:p-8 rounded-xl shadow-xl border border-neutral-medium text-center">
            <NoLivesIcon />
            <h1 className="text-3xl font-bold text-accent-red mb-4">¡Te quedaste sin vidas!</h1>
            <p className="text-text-primary mb-4 text-lg">
              No te preocupes, puedes esperar a que se recarguen o comprar más para seguir aprendiendo.
            </p>
            {recoveryCountdown ? (
              <p className="text-xl text-brand-blue mb-6 font-semibold">Próxima vida en: <span className="text-accent-orange">{recoveryCountdown}</span></p>
            ) : currentUser?.nextLifeRecoveryTime instanceof Date && currentUser.lives < MAX_LIVES ? (
              <p className="text-text-secondary mb-6">Calculando tiempo de recarga...</p>
            ) : (
              currentUser?.lives < MAX_LIVES && <p className="text-text-secondary mb-6">Tus vidas se recargarán automáticamente.</p>
            )}
            <div className="mt-6 space-y-3 md:space-y-0 md:flex md:flex-wrap md:justify-center md:gap-4">
              {Object.entries(LIFE_COSTS).map(([num, cost]) => (
                <button
                  key={num}
                  onClick={() => handleBuyLives(parseInt(num))}
                  className="w-full md:w-auto bg-brand-green hover:bg-green-700 text-neutral-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
                >
                  Comprar {num} {parseInt(num) > 1 ? 'vidas' : 'vida'} <span className="text-sm opacity-80">({cost} tuerquitas)</span>
                </button>
              ))}
            </div>
            <div className="mt-8">
              {levelId && <Link to={`/levels/${levelId}`} className="text-brand-blue hover:text-blue-700 underline font-medium">Volver a la lista de lecciones</Link>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla "Lección Completada"
  if (levelCompleted) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6">
            <div className="bg-neutral-white p-6 md:p-10 rounded-2xl shadow-xl border border-brand-green text-center">
                <CheckCircleSolidIcon />
                <h2 className="text-3xl font-bold text-brand-green mb-3">¡Lección Completada!</h2>
                <p className="text-xl text-text-primary mb-1">Has dominado:</p>
                <p className="text-2xl font-semibold text-accent-orange mb-6">{currentLesson?.title}</p>
                {/* Aquí podrías mostrar XP ganado, etc. */}
                {levelId && (
                    <Link 
                        to={`/levels/${levelId}`} 
                        className="inline-block bg-brand-blue hover:bg-blue-700 text-neutral-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                    >
                        Continuar al Nivel
                    </Link>
                )}
            </div>
        </div>
      </div>
    );
  }

  // Lección sin contenido
  if (currentLesson && totalContentItems === 0 && !isLoadingContent && !loadingLessonsList) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6 text-center">
          <div className="bg-neutral-white p-6 md:p-8 rounded-xl shadow-xl border border-neutral-medium">
            <h1 className="text-2xl font-bold text-text-primary mb-4">{currentLesson.title || 'Lección'}</h1>
            <p className="text-text-secondary mb-4">Esta lección no tiene contenido interactivo por el momento.</p>
            {levelId && <Link to={`/levels/${levelId}`} className="text-brand-blue hover:text-blue-700 underline font-medium">Volver a la lista de lecciones</Link>}
          </div>
        </div>
      </div>
    );
  }
  
  // Fin de lección, procesando
  if (hasReachedEnd && currentLesson && totalContentItems > 0 && !levelCompleted) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
          <svg className="animate-spin h-8 w-8 text-brand-blue mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-bold text-text-primary mb-3">Has llegado al final del contenido.</h2>
          <p className="text-text-secondary">Estamos guardando tu progreso...</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL DEL CONTENIDO DE LA LECCIÓN ---
  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-neutral-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-neutral-medium mt-6">
          <div className="mb-4">
            {levelId && (
              <Link to={`/levels/${levelId}`} className="text-sm text-brand-blue hover:text-blue-700 font-medium inline-flex items-center group transition-colors">
                <ArrowLeftIcon /> <span className="ml-1 group-hover:underline">Volver a lecciones del nivel</span>
              </Link>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-blue mb-1">{currentLesson?.title || 'Lección'}</h1>
          {totalContentItems > 0 && (
            <p className="text-sm text-text-secondary mb-6">
              Elemento {currentContentDisplayIndex} de {totalContentItems}
            </p>
          )}

          {isLoadingContent && !currentContentItem && ( // Muestra si está cargando el primer ítem o entre ítems
             <div className="flex flex-col justify-center items-center py-10">
                <svg className="animate-spin h-8 w-8 text-brand-blue mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-text-secondary">Cargando contenido...</p>
            </div>
          )}

          {currentContentItem && (
            <div className="content-item py-6 border-t border-b border-neutral-light"> {/* Separador visual para el contenido */}
              {currentContentItem.type === 'text' && (
                <div className="prose prose-lg max-w-none text-text-primary prose-headings:text-brand-blue prose-a:text-brand-blue hover:prose-a:text-accent-orange">
                  {currentContentItem.value.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">{paragraph}</p> // mb-3 para más espacio entre párrafos
                  ))}
                </div>
              )}
              {currentContentItem.type === 'image' && (
                <div className="my-4 text-center">
                  <img 
                    src={currentContentItem.url} 
                    alt={currentContentItem.caption || 'Imagen de la lección'} 
                    className="max-w-full md:max-w-2xl lg:max-w-3xl mx-auto h-auto rounded-lg shadow-lg border-2 border-neutral-medium" 
                  />
                  {currentContentItem.caption && (<p className="text-sm text-text-secondary mt-2 italic">{currentContentItem.caption}</p>)}
                </div>
              )}
              {currentContentItem.type === 'question' && (
                <QuestionDisplay
                  question={currentContentItem}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  handleAnswerSubmit={handleAnswerSubmit}
                  // Pasa aquí cualquier prop de estilo adicional si QuestionDisplay lo permite
                />
              )}
              {/* Botones de Navegación de Contenido (Siguiente / Finalizar) */}
              {currentContentItem.type !== 'question' && !isLastContentItem && (
                <div className="mt-8 text-right">
                  <button 
                    onClick={advanceToNextContentItem} 
                    className="inline-flex items-center bg-accent-orange hover:bg-orange-600 text-neutral-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange"
                  >
                    Siguiente <ArrowRightIcon />
                  </button>
                </div>
              )}
              {currentContentItem.type !== 'question' && isLastContentItem && !levelCompleted && (
                <div className="mt-8 text-right">
                  <button 
                    onClick={() => { if(typeof completeLevel === 'function') completeLevel(); }} 
                    className="inline-flex items-center bg-brand-green hover:bg-green-700 text-neutral-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
                  >
                    Finalizar Lección
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LessonPage;