// src/pages/LevelsPage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import Navbar from "../components/Navigation/Navbar";
import { UserContext } from "../contexts/UserContext";

const LevelsPage = () => {
  const { moduleId } = useParams();
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [moduleDetails, setModuleDetails] = useState(null);
  const [levelsWithStatus, setLevelsWithStatus] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, userLoading, navigate]);

  useEffect(() => {
    if (currentUser && moduleId) {
      const fetchData = async () => {
        setLoadingData(true);
        setErrorData(null);

        try {
          const moduleDocRef = doc(db, "modules", moduleId);
          const moduleSnap = await getDoc(moduleDocRef);
          if (moduleSnap.exists()) {
            setModuleDetails({ id: moduleSnap.id, ...moduleSnap.data() });
          } else {
            throw new Error("Módulo no encontrado.");
          }

          const levelsRef = collection(db, "levels");
          const qLevels = query(
            levelsRef,
            where("moduleId", "==", moduleId),
            orderBy("order", "asc")
          );
          const levelsSnapshot = await getDocs(qLevels);
          const allLevels = levelsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const levelProgress = currentUser.levelProgress || {};
          const adiamantadas = currentUser.adiamantadas || {};
          const completedLevels = new Set(currentUser.completedLevels || []);

          const processedLevels = await Promise.all(
            allLevels.map(async (level, index) => {
              const isUnlocked =
                level.order === 1 ||
                (allLevels[index - 1] &&
                  completedLevels.has(allLevels[index - 1].id));

              let status = "locked";

              const levelProg = levelProgress[level.id];
              if (!levelProg) {
                return { ...level, isUnlocked, status: isUnlocked ? "unlocked" : "locked" };
              }

              // Obtener las lecciones del nivel
              const lessonsQuery = query(
                collection(db, "lessons"),
                where("levelId", "==", level.id)
              );
              const lessonsSnapshot = await getDocs(lessonsQuery);
              const lessonIds = lessonsSnapshot.docs.map((doc) => doc.id);

              const completedLessons = Object.keys(
                levelProg.lessons || {}
              );

              const todasCompletadas = lessonIds.every((id) =>
                completedLessons.includes(id)
              );

              const todasPerfectas = lessonIds.every(
                (id) => adiamantadas[id]
              );

              if (todasCompletadas && todasPerfectas) {
                status = "perfect";
              } else if (todasCompletadas) {
                status = "passed";
              } else {
                status = isUnlocked ? "unlocked" : "locked";
              }

              return {
                ...level,
                isUnlocked,
                status,
              };
            })
          );

          setLevelsWithStatus(processedLevels);
        } catch (error) {
          console.error("Error al obtener datos:", error);
          setErrorData(error.message || "Error al cargar niveles.");
        } finally {
          setLoadingData(false);
        }
      };

      fetchData();
    }
  }, [moduleId, currentUser]);

  if (userLoading || loadingData) {
    return <div className="p-10 text-center">Cargando...</div>;
  }

  if (errorData) {
    return (
      <div className="p-10 text-center text-red-500">{errorData}</div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light pb-10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-brand-blue mb-4">
          {moduleDetails?.title}
        </h1>
        <p className="text-text-secondary mb-6">
          {moduleDetails?.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levelsWithStatus.map((level) => {
            const baseClasses =
              "rounded-2xl shadow-md p-5 transition-all duration-300 border flex flex-col";
            const locked =
              "bg-neutral-medium border-gray-300 opacity-75 cursor-not-allowed";
            const unlocked =
              "bg-white border-neutral-medium hover:shadow-xl hover:-translate-y-1 transform";
            const passed = "bg-white border-brand-green hover:shadow-xl";
            const adiamantado =
              "border-4 border-cyan-400 animate-pulse ring-2 ring-cyan-300 shadow-cyan-500/50";

            let style =
              level.status === "perfect"
                ? `${unlocked} ${adiamantado}`
                : level.status === "passed"
                ? `${passed}`
                : level.status === "unlocked"
                ? unlocked
                : locked;

            const cardClasses = `${baseClasses} ${style}`;

            return level.status !== "locked" ? (
              <Link
                to={`/levels/${level.id}`}
                key={level.id}
                className={cardClasses}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-brand-blue mb-1">
                    {level.title}
                  </h3>
                  <p className="text-sm text-text-secondary flex-grow">
                    {level.description}
                  </p>
                  {level.status === "perfect" && (
                    <span className="bg-cyan-400 text-white text-xs font-bold py-1 px-3 rounded-full self-start mt-3 shadow-md">
                      Adiamantado
                    </span>
                  )}
                  {level.status === "passed" && (
                    <span className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full self-start mt-3 shadow-md">
                      Aprobado
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div key={level.id} className={cardClasses}>
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-brand-blue mb-1">
                    {level.title}
                  </h3>
                  <p className="text-sm text-text-secondary flex-grow">
                    {level.description}
                  </p>
                  <span className="bg-gray-400 text-white text-xs font-bold py-1 px-3 rounded-full self-start mt-3 shadow-md">
                    Bloqueado
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;
