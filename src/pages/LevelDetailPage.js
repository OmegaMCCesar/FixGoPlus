// src/pages/LevelDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Navigation/Navbar';
import { UserContext } from '../contexts/UserContext';

// Iconos
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L11.44 10 7.21 6.29A.75.75 0 1 1 8.27 5.23l4.77 4.22a.75.75 0 0 1 0 1.1L8.27 14.77a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand-green">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
  </svg>
);
const LockClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neutral-dark opacity-60">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
);

const LevelDetailPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: userLoading } = useContext(UserContext);

  const [levelInfo, setLevelInfo] = useState(null);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [lessonsWithStatus, setLessonsWithStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, userLoading, navigate]);
  
  useEffect(() => {
    if (currentUser && levelId) {
      const fetchLevelAndLessons = async () => {
        setLoading(true);
        setError(null);
        try {
          const levelDocRef = doc(db, 'levels', levelId);
          const levelSnap = await getDoc(levelDocRef);

          if (levelSnap.exists()) {
            const fetchedLevelInfo = { id: levelSnap.id, ...levelSnap.data() };
            setLevelInfo(fetchedLevelInfo);

            if (fetchedLevelInfo.moduleId) {
              const moduleDocRef = doc(db, 'modules', fetchedLevelInfo.moduleId);
              const moduleSnap = await getDoc(moduleDocRef);
              if (moduleSnap.exists()) {
                setModuleInfo({ id: moduleSnap.id, ...moduleSnap.data() });
              }
            }
          } else {
            throw new Error("Nivel no encontrado");
          }

          const lessonsRef = collection(db, 'lessons');
          const q = query(lessonsRef, where('levelId', '==', levelId), orderBy('order', 'asc'));
          const querySnapshot = await getDocs(q);
          const fetchedLessons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const completedLessonsRef = collection(db, `users/${currentUser.uid}/completedLessons`);
          const completedLessonsSnapshot = await getDocs(query(completedLessonsRef, where("levelId", "==", levelId)));
          const userCompletedLessonIdsInLevel = new Set(completedLessonsSnapshot.docs.map(doc => doc.data().lessonId));
          
          let firstUncompletedFound = false;
          const processedLessons = fetchedLessons.map((lesson, index) => {
            const isCompleted = userCompletedLessonIdsInLevel.has(lesson.id);
            let isUnlocked = false;

            if (index === 0) {
                isUnlocked = true;
            } else {
                const previousLesson = fetchedLessons[index - 1];
                if (previousLesson && userCompletedLessonIdsInLevel.has(previousLesson.id)) {
                    isUnlocked = true;
                }
            }
            
            let isActive = false;
            if(isUnlocked && !isCompleted && !firstUncompletedFound) {
                isActive = true;
                firstUncompletedFound = true;
            }

            return { ...lesson, isUnlocked, isCompleted, isActive };
          });
          setLessonsWithStatus(processedLessons);

        } catch (err) {
          console.error("Error fetching level details or lessons:", err);
          setError(err.message || "No se pudo cargar la información del nivel o las lecciones.");
        } finally {
          setLoading(false);
        }
      };
      fetchLevelAndLessons();
    } else if (!levelId) {
        setError("ID de nivel no especificado.");
        setLoading(false);
    }
  }, [levelId, currentUser, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
          <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary text-lg">Cargando lecciones del nivel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light">
       <Navbar />
       <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-6">
         <div className="bg-red-100 border-l-4 border-accent-red text-accent-red p-4 rounded-md shadow-md" role="alert">
           <strong className="font-bold">¡Error!</strong>
           <span className="block sm:inline ml-1">{error}</span>
           <div className="mt-3">
            <Link 
                to={levelInfo?.moduleId ? `/modules/${levelInfo.moduleId}` : '/'} 
                className="text-sm font-medium text-accent-red hover:text-red-700 underline"
            >
                &larr; Volver a la página anterior
            </Link>
           </div>
         </div>
       </div>
      </div>
    );
  }
  
  const backToLevelsPath = levelInfo?.moduleId ? `/modules/${levelInfo.moduleId}` : '/';
  // Corrección de la ruta del dashboard según tu nota:
  // const dashboardPath = '/'; 

  return (
    <div className="min-h-screen bg-neutral-light pb-10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6 md:mb-8">
            <button
                onClick={() => navigate(backToLevelsPath)}
                className="text-brand-blue hover:text-blue-700 transition-colors duration-200 ease-in-out text-sm font-medium inline-flex items-center group mb-3"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1 group-hover:-translate-x-0.5 transition-transform">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
                </svg>
                Volver a Niveles de "{moduleInfo?.title || 'Módulo'}"
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-blue">
                {levelInfo?.title || `Lecciones`}
            </h1>
            {levelInfo?.description && (
                <p className="text-text-secondary mt-1 md:text-lg">{levelInfo.description}</p>
            )}
        </div>

        {lessonsWithStatus.length === 0 ? (
            <div className="py-10 text-center bg-neutral-white border-2 border-dashed border-neutral-medium rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-neutral-medium mb-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              <p className="text-text-secondary text-xl font-medium">Este nivel aún no tiene lecciones.</p>
              <p className="text-sm text-text-secondary mt-1">¡Vuelve pronto para más contenido!</p>
            </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {lessonsWithStatus.map((lesson, index) => {
              const lessonItemBase = "rounded-xl shadow-lg transition-all duration-300 ease-in-out border flex items-center justify-between p-4 sm:p-5 group";
              let lessonItemClasses = "";
              let lessonActionText = "Empezar";
              let ActionIcon = <ChevronRightIcon />;

              if (!lesson.isUnlocked) {
                lessonItemClasses = `${lessonItemBase} bg-neutral-medium border-gray-300 opacity-70 cursor-not-allowed`;
                lessonActionText = "Bloqueada";
                ActionIcon = <LockClosedIcon/>;
              } else if (lesson.isCompleted) {
                lessonItemClasses = `${lessonItemBase} bg-neutral-white border-brand-green hover:shadow-xl cursor-pointer`;
                lessonActionText = "Repasar";
                ActionIcon = <CheckCircleIcon />;
              } else if (lesson.isActive) {
                lessonItemClasses = `${lessonItemBase} bg-accent-yellow border-yellow-500 hover:shadow-xl cursor-pointer ring-2 ring-accent-yellow ring-offset-2 ring-offset-neutral-light`;
                lessonActionText = "Continuar";
              }
              else {
                lessonItemClasses = `${lessonItemBase} bg-neutral-white border-neutral-medium hover:shadow-xl hover:border-brand-blue cursor-pointer`;
              }
              
              const lessonContent = (
                <>
                  <div className="flex items-center flex-1 min-w-0"> {/* Contenedor para el contenido izquierdo, permite que el título se trunque si es necesario */}
                    <span 
                        className={`mr-3 sm:mr-4 text-lg font-bold 
                            ${!lesson.isUnlocked ? 'text-text-secondary opacity-70' : (lesson.isCompleted ? 'text-brand-green' : 'text-accent-orange')}
                        `}
                    >
                        {index + 1}
                    </span>
                    <div className="min-w-0"> {/* Permite que el título se trunque */}
                      <h3 className={`text-lg font-semibold truncate ${!lesson.isUnlocked ? 'text-text-secondary opacity-80' : (lesson.isCompleted ? 'text-text-primary line-through' : 'text-brand-blue')} group-hover:text-accent-orange transition-colors`}>
                        {lesson.title || 'Lección sin título'}
                      </h3>
                      {lesson.description && (
                        <p className={`text-sm truncate ${!lesson.isUnlocked ? 'text-gray-500' : 'text-text-secondary'} mt-0.5`}>
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center pl-2 ml-2 shrink-0 ${!lesson.isUnlocked ? 'text-text-secondary opacity-70' : (lesson.isCompleted ? 'text-brand-green' : 'text-brand-blue')} group-hover:text-accent-orange transition-colors`}>
                      <span className="text-xs sm:text-sm font-medium mr-1 hidden sm:inline">{lessonActionText}</span>
                      {ActionIcon}
                  </div>
                </>
              );

              return lesson.isUnlocked ? (
                <Link
                  // ----- CORRECCIÓN AQUÍ -----
                  to={`/levels/${levelId}/lessons/${lesson.id}`} 
                  // ----- FIN DE CORRECCIÓN -----
                  key={lesson.id}
                  className={lessonItemClasses}
                >
                  {lessonContent}
                </Link>
              ) : (
                <div key={lesson.id} className={lessonItemClasses}>
                  {lessonContent}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelDetailPage;