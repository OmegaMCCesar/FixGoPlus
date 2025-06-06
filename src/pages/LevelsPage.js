import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import Navbar from '../components/Navigation/Navbar';
import { UserContext } from '../contexts/UserContext';

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M6.75 21h10.5A2.25 2.25 0 0020 18.75v-6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 12v6.75A2.25 2.25 0 006.75 21z" />
  </svg>
);

const LevelsPage = () => {
  const { moduleId } = useParams();
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [moduleDetails, setModuleDetails] = useState(null);
  const [levels, setLevels] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [justUnlockedLevelId, setJustUnlockedLevelId] = useState(null);

console.log(userData);


  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, userLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Módulo
        const moduleSnap = await getDoc(doc(db, 'modules', moduleId));
        if (!moduleSnap.exists()) throw new Error('Módulo no encontrado');
        setModuleDetails({ id: moduleSnap.id, ...moduleSnap.data() });

        // Niveles
        const qLevels = query(
          collection(db, 'levels'),
          where('moduleId', '==', moduleId),
          orderBy('order', 'asc')
        );
        const levelSnapshot = await getDocs(qLevels);
        const levelsData = levelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Usuario
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        const user = userSnap.exists() ? userSnap.data() : {};
        setUserData(user);

        const completed = new Set(user.completedLevels || []);
        let foundFirstUnlocked = false;

        const levelsWithStatus = levelsData.map((level, i) => {
          const isFirst = i === 0;
          const prevLevelId = levelsData[i - 1]?.id;
          const isUnlocked = isFirst || completed.has(prevLevelId);
          const isCompleted = completed.has(level.id);

          const progress = user.levelProgress?.[level.id] || null;
          const isPerfect = progress?.lastScore === 10 && progress?.hadErrors === false;

          if (isUnlocked && !isCompleted && !foundFirstUnlocked) {
            setJustUnlockedLevelId(level.id);
            foundFirstUnlocked = true;
          }

          return {
            ...level,
            isUnlocked,
            isCompleted,
            isPerfect,
          };
        });

        setLevels(levelsWithStatus);
      } catch (err) {
        console.error('Error al cargar niveles:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && moduleId) fetchData();
  }, [moduleId, currentUser]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando niveles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light pb-10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-brand-blue mb-2">
          {moduleDetails?.title || 'Módulo'}
        </h1>
        <p className="text-gray-600 mb-6">{moduleDetails?.description}</p>

        <h2 className="text-2xl font-semibold text-text-primary mb-4">Niveles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {levels.map(level => {
            const isJustUnlocked = level.id === justUnlockedLevelId;

            const baseCard = 'rounded-2xl shadow-lg p-4 flex flex-col h-full border transition';
            const lockedCard = `${baseCard} bg-gray-200 border-gray-300 opacity-70 cursor-not-allowed`;
            const unlockedCard = `${baseCard} bg-white border-neutral-300 hover:shadow-xl hover:-translate-y-1 transform`;
            const diamantadoCard = `${baseCard} bg-gradient-to-br from-blue-100 via-purple-200 to-indigo-300 border-2 border-purple-600 shadow-xl`;

            const cardClass = !level.isUnlocked
              ? lockedCard
              : level.isPerfect
              ? diamantadoCard
              : unlockedCard;

            const card = (
              <div className={cardClass}>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xl font-semibold ${level.isUnlocked ? 'text-brand-blue' : 'text-gray-500'}`}>
                      {level.title}
                    </h3>
                    {level.isPerfect && <span className="text-purple-800 text-xl">💎</span>}
                  </div>
                  <p className={`text-sm mt-1 ${level.isUnlocked ? 'text-gray-600' : 'text-gray-500'}`}>
                    {level.description}
                  </p>
                </div>

                {!level.isUnlocked && (
                  <div className="mt-3 text-gray-500 flex items-center gap-1">
                    <LockIcon />
                    <span>Bloqueado</span>
                  </div>
                )}

                {level.isCompleted && (
                  <span className={`mt-3 font-medium text-sm ${level.isPerfect ? 'text-purple-800' : 'text-green-600'}`}>
                    {level.isPerfect ? '💎 Perfecto: sin errores' : '✅ Completado'}
                  </span>
                )}

                {level.isUnlocked && (
                  <Link
                    to={`/levels/${level.id}`}
                    className="mt-4 block w-full text-center bg-accent-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition"
                  >
                    {level.isCompleted ? 'Repetir nivel' : 'Empezar nivel'}
                  </Link>
                )}
              </div>
            );

            return isJustUnlocked ? (
              <motion.div
                key={level.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {card}
              </motion.div>
            ) : (
              <div key={level.id}>{card}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;
