import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
  collection, query, where, orderBy, getDocs,
  doc, getDoc
} from 'firebase/firestore';
import Navbar from '../components/Navigation/Navbar';
import { UserContext } from '../contexts/UserContext';

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const levelDoc = await getDoc(doc(db, 'levels', levelId));
        if (!levelDoc.exists()) throw new Error("Nivel no encontrado");

        const level = { id: levelDoc.id, ...levelDoc.data() };
        setLevelInfo(level);

        if (level.moduleId) {
          const moduleDoc = await getDoc(doc(db, 'modules', level.moduleId));
          if (moduleDoc.exists()) {
            setModuleInfo({ id: moduleDoc.id, ...moduleDoc.data() });
          }
        }

        const lessonsSnap = await getDocs(query(
          collection(db, 'lessons'),
          where('levelId', '==', levelId),
          orderBy('order', 'asc')
        ));

        const lessons = lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let firstUncompletedFound = false;

        const processed = lessons.map((lesson, index) => {
          const isCompleted = !!currentUser?.levelProgress?.[levelId]?.lessons?.[lesson.id];
          const hadErrors = currentUser?.levelProgress?.[levelId]?.lessons?.[lesson.id]?.hadErrors;
          const isPerfect = currentUser?.adiamantadas?.[lesson.id] === true;

          const isUnlocked =
            index === 0 ||
            !!currentUser?.levelProgress?.[levelId]?.lessons?.[lessons[index - 1]?.id];

          let isActive = false;
          if (isUnlocked && !isCompleted && !firstUncompletedFound) {
            isActive = true;
            firstUncompletedFound = true;
          }

          return {
            ...lesson,
            isUnlocked,
            isCompleted,
            isActive,
            isPerfect,
            hadErrors,
          };
        });

        setLessonsWithStatus(processed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (levelId && currentUser) {
      fetchData();
    }
  }, [levelId, currentUser]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex flex-col justify-center items-center">
        <Navbar />
        <div className="text-center mt-20">
          <div className="animate-spin h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Cargando lecciones del nivel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <p className="text-xl text-accent-red font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light pb-10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-brand-blue mb-4">{levelInfo?.title}</h1>
        {levelInfo?.description && (
          <p className="text-text-secondary mb-6">{levelInfo.description}</p>
        )}

        <div className="space-y-3 md:space-y-4">
          {lessonsWithStatus.map((lesson, index) => {
            const baseClass = "rounded-xl shadow-lg transition-all duration-300 ease-in-out border flex items-center justify-between p-4 sm:p-5 group";

            let className = baseClass;
            let label = "Empezar";
            let Icon = <ChevronRightIcon />;

            if (!lesson.isUnlocked) {
              className += " bg-neutral-medium border-gray-300 opacity-60 cursor-not-allowed";
              label = "Bloqueada";
              Icon = <LockClosedIcon />;
            } else if (lesson.isPerfect) {
              className += " bg-white border-[3px] border-dashed border-blue-400 ring-2 ring-blue-300 ring-offset-2 ring-offset-neutral-light cursor-pointer";
              label = "Perfecta";
              Icon = <CheckCircleIcon />;
            } else if (lesson.isCompleted) {
              className += " bg-neutral-white border-brand-green hover:shadow-xl cursor-pointer";
              label = "Repasar";
              Icon = <CheckCircleIcon />;
            } else if (lesson.isActive) {
              className += " bg-accent-yellow border-yellow-500 hover:shadow-xl cursor-pointer ring-2 ring-accent-yellow ring-offset-2 ring-offset-neutral-light";
              label = "Continuar";
            } else {
              className += " bg-neutral-white border-neutral-medium hover:shadow-xl hover:border-brand-blue cursor-pointer";
            }

            const content = (
              <>
                <div className="flex items-center flex-1 min-w-0">
                  <span className="mr-3 sm:mr-4 text-lg font-bold text-accent-orange">{index + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate text-brand-blue group-hover:text-accent-orange transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-sm truncate text-text-secondary mt-0.5">{lesson.description}</p>
                  </div>
                </div>
                <div className="flex items-center pl-2 ml-2 shrink-0 text-brand-blue group-hover:text-accent-orange transition-colors">
                  <span className="text-xs sm:text-sm font-medium mr-1 hidden sm:inline">{label}</span>
                  {Icon}
                </div>
              </>
            );

            return lesson.isUnlocked ? (
              <Link to={`/levels/${levelId}/lessons/${lesson.id}`} key={lesson.id} className={className}>
                {content}
              </Link>
            ) : (
              <div key={lesson.id} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelDetailPage;
